package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	database "back_end/database"
	models "back_end/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Tạo thư mục mới
func CreateDirectory(name string, parentId string, userId string, isRoot bool) (string, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")

	var folderID string
	if isRoot {
		folderID = "folder-root-" + userId		
	} else {
		folderID = primitive.NewObjectID().Hex()
	}

	if parentId == "folder-root-" {
		parentId = parentId + userId
	}

	newDirectory := models.Directory{
		FolderID:    folderID,
		Name:        name,
		UserID:      userId,
		ParentID:    parentId,
		ChildFileID: []string{},
		ChildFolderID: []string{},
		CreateAt:    time.Now(),
		UpdateAt:    time.Now(),
	}
	
	_, err := CoreDatabase.InsertOne(context.Background(), newDirectory)
	if err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Update parent folder's child_folder_id array if parent exists
	if parentId != "" {
        if err := UpdateDirectory(parentId, folderID, false); err != nil {
            return "", fmt.Errorf("failed to update parent directory: %w", err)
        }
    }

	return folderID, nil
}

func RenameDirectory(folderID, newName string) error {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")

	update := bson.M{
		"$set": bson.M{
			"name":      newName,
			"update_at": time.Now(),
		},
	}

	result, err := CoreDatabase.UpdateOne(context.Background(), bson.M{"folder_id": folderID}, update)
	if err != nil {
		return fmt.Errorf("failed to rename directory: %w", err)
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("directory with folder_id %s not found", folderID)
	}

	return nil
}

func UpdateDirectory(folderID, id string, isFile bool) error {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")

	var updateField string
	if isFile {
		updateField = "child_file_id"
	} else {
		updateField = "child_folder_id"
	}

	update := bson.M{
		"$push": bson.M{updateField: id},
		"$set":  bson.M{"update_at": time.Now()},
	}

	result, err := CoreDatabase.UpdateOne(context.Background(), bson.M{"folder_id": folderID}, update)
	if err != nil {
		return fmt.Errorf("failed to update directory: %w", err)
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("directory with folder_id %s not found", folderID)
	}

	return nil
}

func DeleteDirectory(folderID string) error {
    CoreDatabase := database.FDS.Database("FDS").Collection("directory")
    
    // Get folder info to find parent
    var folder models.Directory
    err := CoreDatabase.FindOne(context.Background(), bson.M{"folder_id": folderID}).Decode(&folder)
    if err != nil {
        return fmt.Errorf("folder not found: %w", err)
    }

    // Recursively get and delete all children
    if err := deleteDirectoryRecursive(folderID); err != nil {
        return err
    }

    // Update parent folder's references
    if folder.ParentID != "" {
        _, err = CoreDatabase.UpdateOne(
            context.Background(),
			bson.M{"folder_id": folder.ParentID},
            bson.M{"$pull": bson.M{"child_folder_id": folderID}},
        )
        if err != nil {
            return fmt.Errorf("failed to update parent folder: %w", err)
        }
    }

    return nil
}

func deleteDirectoryRecursive(folderID string) error {
    CoreDatabase := database.FDS.Database("FDS").Collection("directory")
    
    // Get current folder
    var folder models.Directory
    err := CoreDatabase.FindOne(context.Background(), bson.M{"folder_id": folderID}).Decode(&folder)
    if err != nil {
        return fmt.Errorf("folder not found: %w", err)
    }

    // Delete all child files
    for _, fileID := range folder.ChildFileID {
        if err := DeleteFile(fileID); err != nil {
            return fmt.Errorf("failed to delete child file: %w", err)
        }
    }

    // Recursively delete all child folders
    for _, childFolderID := range folder.ChildFolderID {
        if err := deleteDirectoryRecursive(childFolderID); err != nil {
            return fmt.Errorf("failed to delete child folder: %w", err)
        }
    }

    // Delete current folder
    _, err = CoreDatabase.DeleteOne(context.Background(), bson.M{"folder_id": folderID})
    if err != nil {
        return fmt.Errorf("failed to delete directory: %w", err)
    }

    return nil
}

func GetAllDirectoriesByUserId(userID string) ([]bson.M, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")

	// Lọc các thư mục có user_id khớp với userID và is_moved_to_trash == false
    filter := bson.M{
		"user_id":           userID,
		"is_moved_to_trash": false,
	}
	cursor, err := CoreDatabase.Find(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve files: %w", err)
	}
	defer cursor.Close(context.Background())

	// Duyệt qua kết quả và lưu trữ
	var directories []bson.M
	if err := cursor.All(context.Background(), &directories); err != nil {
		return nil, fmt.Errorf("failed to decode directories: %w", err)
	}

	return directories, nil
}

func GetDirectoryById(folderID, userID string) (bson.M, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")

	// Tìm file metadata theo file_id
	var directory  bson.M
	err := CoreDatabase.FindOne(context.Background(), bson.M{"folder_id": folderID}).Decode(&directory)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, fmt.Errorf("file with ID %s not found", folderID)
		}
		return nil, fmt.Errorf("failed to retrieve file metadata: %w", err)
	}

	// Kiểm tra quyền truy cập
	if directory ["user_id"] != userID {
		return nil, fmt.Errorf("access denied: file does not belong to the current user")
	}

	return directory , nil
}

func MoveFolderToTrash(userID, folderID string) error {
	filter := bson.M{"user_id": userID, "folder_id": folderID}
	update := bson.M{"$set": bson.M{"is_moved_to_trash": true}}

	result, err := database.FDS.Database("FDS").Collection("directory").UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("failed to move to trash: %v", err)
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("folder with ID %s not found for user %s", folderID, userID)
	}

	return nil
}

func RestoreFolder(userID, folderID string) error {
	filter := bson.M{"user_id": userID, "folder_id": folderID}
	update := bson.M{"$set": bson.M{"is_moved_to_trash": false}}

	result, err := database.FDS.Database("FDS").Collection("directory").UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("failed to restore folder: %v", err)
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("folder with ID %s not found for user %s", folderID, userID)
	}

	return nil
}

func LoadFolderInTrash(userID string) ([]bson.M, error) {
	filter := bson.M{"user_id": userID, "is_moved_to_trash": true}

	cursor, err := database.FDS.Database("FDS").Collection("directory").Find(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("failed to load folders in trash: %v", err)
	}
	defer cursor.Close(context.Background())

	var folders []bson.M
	if err := cursor.All(context.Background(), &folders); err != nil {
		return nil, fmt.Errorf("failed to decode folders: %v", err)
	}

	return folders, nil
}

// func ShareDirectory(folderID string, emails []string) error {
//     // Share parent folder
//     filter := bson.M{"folder_id": folderID}
//     update := bson.M{
//         "$addToSet": bson.M{
//             "shared_users": bson.M{
//                 "$each": emails,
//             },
//         },
//     }
    
//     _, err := database.FDS.Database("FDS").Collection("directory").UpdateOne(
//         context.Background(),
//         filter,
//         update,
//     )
//     if err != nil {
//         return fmt.Errorf("failed to share parent folder: %w", err)
//     }

//     // Get folder details
//     var folder models.Directory
//     err = database.FDS.Database("FDS").Collection("directory").FindOne(
//         context.Background(),
//         filter,
//     ).Decode(&folder)
//     if err != nil {
//         return fmt.Errorf("failed to get folder details: %w", err)
//     }

//     // Share child files
//     for _, fileID := range folder.ChildFileID {
//         err := ShareFile(fileID, emails)
//         if err != nil {
//             return fmt.Errorf("failed to share child file %s: %w", fileID, err)
//         }
//     }

//     // Recursively share child folders
//     for _, childFolderID := range folder.ChildFolderID {
//         err := ShareDirectory(childFolderID, emails)
//         if err != nil {
//             return fmt.Errorf("failed to share child folder %s: %w", childFolderID, err)
//         }
//     }

//     return nil
// }

// func GetSharedDirectories(email string) ([]bson.M, error) {
//     filter := bson.M{"shared_users": email}
//     cursor, err := database.FDS.Database("FDS").Collection("directory").Find(context.Background(), filter)
//     if err != nil {
//         return nil, err
//     }
//     var results []bson.M
//     err = cursor.All(context.Background(), &results)
//     return results, err
// }

