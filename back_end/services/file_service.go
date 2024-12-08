package services

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"time"

	database "back_end/database"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)


func UploadFile(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	fileData, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}

	numberOfNodes := len(database.LiveNodes)
	if numberOfNodes == 0 {
		return fmt.Errorf("no nodes available")
	}

	totalFileSize := len(fileData)
	chunkSize := totalFileSize / numberOfNodes
	if totalFileSize%numberOfNodes != 0 {
		chunkSize++ 
	}

	fileName := file.Name()

	// Chia file thành các chunk và lưu vào các node, bao nhiu node bấy nhiu chunk
	for i := 0; i < numberOfNodes; i++ {
		startIndex := i * chunkSize
		endIndex := startIndex + chunkSize
		if endIndex > totalFileSize {
			endIndex = totalFileSize
		}

		chunkData := fileData[startIndex:endIndex]

		nodeIndex := i
		collection := database.LiveNodes[nodeIndex].Database("Data").Collection("chunks")

		_, err := collection.InsertOne(context.Background(), bson.M{
			"file_name":  fileName,
			"chunk_index": i,
			"data":        chunkData,
			"upload_time": time.Now(),
		})
		if err != nil {
			return fmt.Errorf("failed to upload chunk %d: %w", i, err)
		}
	}

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

	// Sắp xếp chunks theo thứ tự `chunk_index`
	sort.Slice(chunks, func(i, j int) bool {
		return chunks[i]["chunk_index"].(int32) < chunks[j]["chunk_index"].(int32)
	})

	// Lấy đường dẫn đến thư mục Downloads ở máy mình
	downloadsPath := filepath.Join(os.Getenv("USERPROFILE"), "Downloads")
	localFilePath := filepath.Join(downloadsPath, fileName)

	file, err := os.Create(localFilePath)
	if err != nil {
		return fmt.Errorf("failed to create file in Downloads: %w", err)
	}
	defer file.Close()

	// Ghép các chunk và ghi vào file local
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
