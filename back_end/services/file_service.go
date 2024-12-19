package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"time"

	database "back_end/database"
	models "back_end/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func UploadFile(fileContent io.Reader, fileName string, parentFolderId string) error {
	// Get user from token
	userId, err := GetUserByToken(Token)
	if err != nil {
		return errors.New("unauthorized")
	}

	// Create file metadata
	newFile := models.File{
		FileName:       fileName,
		FileType:       filepath.Ext(fileName),
		UserID:         userId,
		UploadTime:     time.Now(),
		ParentFolderID: parentFolderId,
	}

	// Save metadata to MongoDB first
	CoreDatabase := database.FDS.Database("FDS").Collection("file")
	result, err := CoreDatabase.InsertOne(context.Background(), newFile)
	if err != nil {
		return fmt.Errorf("failed to create file metadata: %v", err)
	}

	// Update FileID with ObjectID
	insertedID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return fmt.Errorf("failed to cast InsertedID to ObjectID")
	}
	fileID := insertedID.Hex()

	// Create temporary buffer to calculate size and chunks
    var buffer bytes.Buffer
    size, err := io.Copy(&buffer, fileContent)
    if err != nil {
        return fmt.Errorf("failed to read file: %v", err)
    }

	// Update file size
	_, err = CoreDatabase.UpdateOne(
		context.Background(),
		bson.M{"_id": insertedID},
		bson.M{"$set": bson.M{
			"file_id"	: fileID,
			"file_size"	: size,
		}},
	)
    if err != nil {
        return fmt.Errorf("failed to update file size: %v", err)
    }

	// Chia file thành các chunk và lưu vào các node, bao nhiu node bấy nhiu chunk
	data := buffer.Bytes()
	numberOfNodes := len(database.LiveNodes)
	if numberOfNodes == 0 {
		return fmt.Errorf("no nodes available")
	}

    chunkSize := len(data) / numberOfNodes
    if chunkSize == 0 {
        chunkSize = len(data)
    }

	for i := 0; i < numberOfNodes; i++ {
		startIndex := i * chunkSize
		endIndex := startIndex + chunkSize
        if i == numberOfNodes-1 {
            endIndex = len(data)
        }

		chunk := models.Chunk{
			FileID:     fileID,
			FileName:   newFile.FileName,
			ChunkIndex: i,
			Data:       data[startIndex:endIndex],
			UploadTime: time.Now(),
		}

		Datacollection := database.LiveNodes[i].Database("Data").Collection("chunks")
		_, err := Datacollection.InsertOne(context.Background(), chunk)
		if err != nil {
			CoreDatabase.DeleteOne(context.Background(), bson.M{"_id": fileID})
			return fmt.Errorf("failed to upload chunk %d: %w", i, err)
		}
	}

	return nil

}

func DeleteFile(fileID string) error {
	// Kết nối tới collection lưu metadata file
	CoreDatabase := database.FDS.Database("FDS").Collection("file")

	// Tìm file metadata theo `file_id`
	var fileMetadata bson.M
	err := CoreDatabase.FindOne(context.Background(), bson.M{"file_id": fileID}).Decode(&fileMetadata)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return fmt.Errorf("file with ID %s not found", fileID)
		}
		return fmt.Errorf("failed to retrieve file metadata: %w", err)
	}

	// Xóa tất cả các chunk liên quan trong LiveNodes
	for _, node := range database.LiveNodes {
		Datacollection := node.Database("Data").Collection("chunks")
		_, err := Datacollection.DeleteMany(context.Background(), bson.M{"file_id": fileID})
		if err != nil {
			return fmt.Errorf("failed to delete chunks for file %s: %w", fileID, err)
		}
	}

	// Xóa metadata file khỏi FDS
	_, err = CoreDatabase.DeleteOne(context.Background(), bson.M{"file_id": fileID})
	if err != nil {
		return fmt.Errorf("failed to delete file metadata: %w", err)
	}

	fmt.Printf("File %s and its chunks deleted successfully\n", fileID)
	return nil
}

func DownloadFile(fileName string) error {
	if fileName == "" {
		return fmt.Errorf("file_name is required")
	}

	var chunks []bson.M

	for _, client := range database.LiveNodes {
		collection := client.Database("Data").Collection("chunks")

		cursor, err := collection.Find(context.Background(), bson.M{"file_name": fileName})
		if err != nil {
			fmt.Printf("failed to find file in node: %v\n", err)
			continue
		}

		var nodeChunks []bson.M
		if err := cursor.All(context.Background(), &nodeChunks); err == nil {
			chunks = append(chunks, nodeChunks...)
		}
	}

	if len(chunks) == 0 {
		return fmt.Errorf("file not found on any node")
	}

	sort.Slice(chunks, func(i, j int) bool {
		return chunks[i]["chunk_index"].(int32) < chunks[j]["chunk_index"].(int32)
	})

	downloadsPath := filepath.Join(os.Getenv("USERPROFILE"), "Downloads")
	localFilePath := filepath.Join(downloadsPath, fileName)

	file, err := os.Create(localFilePath)
	if err != nil {
		return fmt.Errorf("failed to create file in Downloads: %w", err)
	}
	defer file.Close()

	for _, chunk := range chunks {
		data := chunk["data"].(primitive.Binary).Data
		_, err := file.Write(data)
		if err != nil {
			return fmt.Errorf("failed to write data to local file: %w", err)
		}
	}

	fmt.Printf("File downloaded successfully to %s\n", localFilePath)
	return nil
}

func RenameFile(fileID string, newFileName string) error {
	CoreDatabase := database.FDS.Database("FDS").Collection("file")

	// Tìm metadata file để lấy thông tin extension
	var fileMetadata bson.M
	err := CoreDatabase.FindOne(context.Background(), bson.M{"file_id": fileID}).Decode(&fileMetadata)
	if err != nil {
		return fmt.Errorf("failed to retrieve file metadata: %w", err)
	}

	fileName := fileMetadata["file_name"].(string)
	extension := filepath.Ext(fileName)

	// Tạo tên file mới với extension
	newFileNameWithExt := newFileName + extension

	// Cập nhật tên file trong collection metadata
	_, err = CoreDatabase.UpdateOne(
		context.Background(),
		bson.M{"file_id": fileID},
		bson.M{"$set": bson.M{"file_name": newFileNameWithExt}},
	)
	if err != nil {
		return fmt.Errorf("failed to update file name in metadata: %w", err)
	}

	// Cập nhật từng chunk trên các node
	for _, node := range database.LiveNodes {
		Datacollection := node.Database("Data").Collection("chunks")

		_, err := Datacollection.UpdateMany(
			context.Background(),
			bson.M{"file_id": fileID},
			bson.M{"$set": bson.M{"file_name": newFileNameWithExt}},
		)
		if err != nil {
			return fmt.Errorf("failed to update chunks on node %v: %w", node, err)
		}
	}

	return nil
}

func GetAllFilesByUserID(userID string) ([]bson.M, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("file")

	// Lọc các file có user_id khớp với userID
	cursor, err := CoreDatabase.Find(context.Background(), bson.M{"user_id": userID})
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve files: %w", err)
	}
	defer cursor.Close(context.Background())

	// Duyệt qua kết quả và lưu trữ
	var files []bson.M
	if err = cursor.All(context.Background(), &files); err != nil {
		return nil, fmt.Errorf("failed to decode files: %w", err)
	}

	return files, nil
}

func GetFileByID(fileID, userID string) (bson.M, error) {
	CoreDatabase := database.FDS.Database("FDS").Collection("file")

	// Tìm file metadata theo file_id
	var fileMetadata bson.M
	err := CoreDatabase.FindOne(context.Background(), bson.M{"file_id": fileID}).Decode(&fileMetadata)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, fmt.Errorf("file with ID %s not found", fileID)
		}
		return nil, fmt.Errorf("failed to retrieve file metadata: %w", err)
	}

	// Kiểm tra quyền truy cập
	if fileMetadata["user_id"] != userID {
		return nil, fmt.Errorf("access denied: file does not belong to the current user")
	}

	return fileMetadata, nil
}
