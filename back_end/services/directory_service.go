package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	database "back_end/database"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Tạo thư mục mới
func CreateDirectory(name string) (string, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")
	folderID := primitive.NewObjectID().Hex()
	userId, _ := GetUserByToken(Token)

	newDirectory := bson.M{
		"folder_id":       folderID,
		"name":            name,
		"parent_id":       nil,
		"child_file_id":   []string{},
		"child_folder_id": []string{},
		"create_at":       time.Now(),
		"user_id": userId,
		"update_at":       time.Now(),
	}

	_, err := CoreDatabase.InsertOne(context.Background(), newDirectory)
	if err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
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

	result, err := CoreDatabase.DeleteOne(context.Background(), bson.M{"folder_id": folderID})
	if err != nil {
		return fmt.Errorf("failed to delete directory: %w", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("directory with folder_id %s not found", folderID)
	}

	return nil
}

func GetAllDirectoriesByUserId(userID string) ([]bson.M, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")

	// Lọc các thư mục có user_id khớp với userID
	cursor, err := CoreDatabase.Find(context.Background(), bson.M{"user_id": userID})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch directories: %w", err)
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

