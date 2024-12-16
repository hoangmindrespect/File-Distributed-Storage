package services

import (
	"context"
	"fmt"
	"time"

	database "back_end/database"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Tạo thư mục mới
func CreateDirectory(name string) (string, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")
	folderID := primitive.NewObjectID().Hex()

	newDirectory := bson.M{
		"folder_id":       folderID,
		"name":            name,
		"parent_id":       nil,
		"child_file_id":   []string{},
		"child_folder_id": []string{},
		"create_at":       time.Now(),
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

func GetAllDirectories() ([]bson.M, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")

	cursor, err := CoreDatabase.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch directories: %w", err)
	}
	defer cursor.Close(context.Background())

	var directories []bson.M
	if err := cursor.All(context.Background(), &directories); err != nil {
		return nil, fmt.Errorf("failed to decode directories: %w", err)
	}

	return directories, nil
}

func GetDirectoryByID(folderID string) (bson.M, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("directory")

	objectID, err := primitive.ObjectIDFromHex(folderID)
	if err != nil {
		return nil, fmt.Errorf("invalid folder_id: %w", err)
	}

	var directory bson.M
	err = CoreDatabase.FindOne(context.Background(), bson.M{"folder_id": objectID}).Decode(&directory)
	if err != nil {
		return nil, fmt.Errorf("directory not found: %w", err)
	}

	return directory, nil
}
