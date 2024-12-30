package services

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
	"time"

	database "back_end/database"
	models "back_end/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const CHUNK_SIZE = 15 * 1024 * 1024

type ChunkLocation struct {
	ChunkIndex int
	NodeIndex  int
}

func getUniqueFileName(collection *mongo.Collection, fileName string, parentFolderId string) string {
	extension := filepath.Ext(fileName)
	fileNameWithoutExt := fileName[:len(fileName)-len(extension)]
	i := 1
	for {
		var existingFile bson.M
		collection.FindOne(context.Background(),
			bson.M{
				"file_name":        fileName,
				"parent_folder_id": parentFolderId,
			}).Decode(&existingFile)
		if existingFile == nil {
			return fileName
		}

		fileName = fmt.Sprintf("%s (%d)%s", fileNameWithoutExt, i, extension)
		i++
		if i > 5 {
			timestamp := time.Now().UnixNano()
			return fmt.Sprintf("%s_%d%s", fileNameWithoutExt, timestamp, extension)
		}

	}
}

func updateParentFolderFiles(fileId string, parentFolderId string, isAdd bool) error {
	update := bson.M{}
	if isAdd {
		update = bson.M{"$push": bson.M{"child_file_id": fileId}}
	} else {
		update = bson.M{"$pull": bson.M{"child_file_id": fileId}}
	}

	result, err := database.FDS.Database("FDS").Collection("directory").UpdateOne(
		context.Background(),
		bson.M{"folder_id": parentFolderId},
		update,
	)
	if err != nil {
		return fmt.Errorf("failed to update parent folder: %v", err)
	}

	if result.ModifiedCount == 0 {
		return fmt.Errorf("failed to update parent folder")
	}
	return nil
}

func UploadFile(fileContent io.Reader, fileName string, parentFolderId string) error {
	// Read file content
	data, err := io.ReadAll(fileContent)
	if err != nil {
		return fmt.Errorf("failed to read file: %v", err)
	}

	fileSize := len(data)
	numberOfChunks := (fileSize + CHUNK_SIZE - 1) / CHUNK_SIZE
	numberOfNodes := len(database.LiveNodes)

	if numberOfNodes == 0 {
		return fmt.Errorf("no nodes available")
	}

	// Create metadata first
	CoreDatabase := database.FDS.Database("FDS").Collection("file")
	userId, _ := GetUserByToken(Token)

    newFile := models.File{
        FileName:       getUniqueFileName(CoreDatabase, fileName, parentFolderId),
        FileType:       filepath.Ext(fileName),
        UserID:         userId,
        SharedUsers:    make([]string, 0),  
        FileSize:       int64(fileSize),
        UploadTime:     time.Now(),
        ParentFolderID: parentFolderId,
        IsStarred:      false,
        IsMovedToTrash: false,
        ChunkLocations: make([]models.ChunkLocation, numberOfChunks),
    }

	result, err := CoreDatabase.InsertOne(context.Background(), newFile)
	if err != nil {
		return fmt.Errorf("failed to create file metadata: %v", err)
	}

	fileID := result.InsertedID.(primitive.ObjectID).Hex()

	// Upload chunks using round-robin
	for i := 0; i < numberOfChunks; i++ {
		start := i * CHUNK_SIZE
		end := start + CHUNK_SIZE
		if end > fileSize {
			end = fileSize
		}

		nodeIndex := i % numberOfNodes
		chunk := models.Chunk{
			FileID:     fileID,
			FileName:   newFile.FileName,
			ChunkIndex: i,
			Data:       data[start:end],
			UploadTime: time.Now(),
		}

		// Store chunk in selected node
		Datacollection := database.LiveNodes[nodeIndex].Database("Data").Collection("chunks")
		_, err := Datacollection.InsertOne(context.Background(), chunk)
		if err != nil {
			// Rollback on failure
			deleteUploadedChunks(fileID, i)
			CoreDatabase.DeleteOne(context.Background(), bson.M{"_id": fileID})
			return fmt.Errorf("failed to upload chunk %d: %w", i, err)
		}

		// Track chunk location
		newFile.ChunkLocations[i] = models.ChunkLocation{
			ChunkIndex: i,
			NodeIndex:  nodeIndex,
		}

		// Update parent folder with new file
		if err := updateParentFolderFiles(fileID, parentFolderId, true); err != nil {
			// Rollback file creation if parent update fails
			CoreDatabase.DeleteOne(context.Background(), bson.M{"_id": fileID})
			return fmt.Errorf("failed to update parent folder: %v", err)
		}
	}

	// Update metadata with chunk locations
	_, err = CoreDatabase.UpdateOne(
		context.Background(),
		bson.M{"_id": result.InsertedID},
		bson.M{"$set": bson.M{
			"file_id":         fileID,
			"chunk_locations": newFile.ChunkLocations,
		}},
	)

	if err != nil {
		return fmt.Errorf("failed to update chunk locations: %v", err)
	}

	return nil
}

func UploadFileParallel(fileContent io.Reader, fileName string, parentFolderId string) error {
	// Read file content
	data, err := io.ReadAll(fileContent)
	if err != nil {
		return fmt.Errorf("failed to read file: %v", err)
	}

	// Setup initial metadata
	userId, err := GetUserByToken(Token)
	if err != nil {
		return errors.New("unauthorized")
	}

	CoreDatabase := database.FDS.Database("FDS").Collection("file")
	fileSize := len(data)
	numberOfChunks := (fileSize + CHUNK_SIZE - 1) / CHUNK_SIZE
	numberOfNodes := len(database.LiveNodes)

	if numberOfNodes == 0 {
		return fmt.Errorf("no nodes available")
	}

	// Create file metadata
	newFile := models.File{
		FileName:       getUniqueFileName(CoreDatabase, fileName, parentFolderId),
		FileType:       filepath.Ext(fileName),
		UserID:         userId,
		FileSize:       int64(fileSize),
		UploadTime:     time.Now(),
		ParentFolderID: parentFolderId,
		ChunkLocations: make([]models.ChunkLocation, numberOfChunks),
	}

	// Save metadata first
	result, err := CoreDatabase.InsertOne(context.Background(), newFile)
	if err != nil {
		return fmt.Errorf("failed to create file metadata: %v", err)
	}

	fileID := result.InsertedID.(primitive.ObjectID).Hex()

	// Setup channels
	tasks := make(chan models.ChunkLocation, numberOfChunks)
	results := make(chan error, numberOfChunks)
	const workers = 5

	// Start worker pool
	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for task := range tasks {
				start := task.ChunkIndex * CHUNK_SIZE
				end := start + CHUNK_SIZE
				if end > fileSize {
					end = fileSize
				}

				chunk := models.Chunk{
					FileID:     fileID,
					FileName:   newFile.FileName,
					ChunkIndex: task.ChunkIndex,
					Data:       data[start:end],
					UploadTime: time.Now(),
				}

				nodeClient := database.LiveNodes[task.NodeIndex]
				_, err := nodeClient.Database("Data").Collection("chunks").InsertOne(
					context.Background(),
					chunk,
				)
				results <- err
			}
		}()
	}

	// Distribute chunks
	go func() {
		for i := 0; i < numberOfChunks; i++ {
			loc := models.ChunkLocation{
				ChunkIndex: i,
				NodeIndex:  i % numberOfNodes,
			}
			newFile.ChunkLocations[i] = loc
			tasks <- loc
		}
		close(tasks)
	}()

	// Wait and check errors
	go func() {
		wg.Wait()
		close(results)
	}()

	for err := range results {
		if err != nil {
			// Rollback on error
			deleteUploadedChunks(fileID, numberOfChunks)
			CoreDatabase.DeleteOne(context.Background(), bson.M{"_id": result.InsertedID})
			return fmt.Errorf("chunk upload failed: %v", err)
		}
	}

	// Update metadata with chunk locations
	_, err = CoreDatabase.UpdateOne(
		context.Background(),
		bson.M{"_id": result.InsertedID},
		bson.M{"$set": bson.M{
			"file_id":         fileID,
			"chunk_locations": newFile.ChunkLocations,
		}},
	)

	if err != nil {
		return fmt.Errorf("failed to update chunk locations: %v", err)
	}

	// Update parent folder
	if err := updateParentFolderFiles(fileID, parentFolderId, true); err != nil {
		return fmt.Errorf("failed to update parent folder: %v", err)
	}

	return nil
}

func DownloadFile(fileID string) error {
	// Get file metadata
	var fileMetadata models.File
	err := database.FDS.Database("FDS").Collection("file").
		FindOne(context.Background(), bson.M{"file_id": fileID}).
		Decode(&fileMetadata)

	if err != nil {
		return fmt.Errorf("file not found: %v", err)
	}

	// Create local file
	downloadsPath := filepath.Join(os.Getenv("USERPROFILE"), "Downloads")
	localFilePath := filepath.Join(downloadsPath, fileMetadata.FileName)

	file, err := os.Create(localFilePath)
	if err != nil {
		return fmt.Errorf("failed to create local file: %v", err)
	}
	defer file.Close()

	// Download each chunk in order
	for _, loc := range fileMetadata.ChunkLocations {
		nodeClient := database.LiveNodes[loc.NodeIndex]
		var chunk models.Chunk

		err := nodeClient.Database("Data").Collection("chunks").
			FindOne(context.Background(), bson.M{
				"file_id":     fileID,
				"chunk_index": loc.ChunkIndex,
			}).Decode(&chunk)

		if err != nil {
			return fmt.Errorf("failed to retrieve chunk %d: %v", loc.ChunkIndex, err)
		}

		_, err = file.Write(chunk.Data)
		if err != nil {
			return fmt.Errorf("failed to write chunk %d: %v", loc.ChunkIndex, err)
		}
	}

	return nil
}

func DownloadFileParallel(fileID string) error {
	// Get file metadata
	var fileMetadata models.File
	err := database.FDS.Database("FDS").Collection("file").
		FindOne(context.Background(), bson.M{"file_id": fileID}).
		Decode(&fileMetadata)

	if err != nil {
		return fmt.Errorf("file not found: %v", err)
	}

	// Create download directory if not exists
	downloadsPath := filepath.Join(os.Getenv("USERPROFILE"), "Downloads")
	localFilePath := filepath.Join(downloadsPath, fileMetadata.FileName)

	file, err := os.Create(localFilePath)
	if err != nil {
		return fmt.Errorf("failed to create local file: %v", err)
	}
	defer file.Close()

	// Setup concurrent download
	workers := 5
	tasks := make(chan models.ChunkLocation, len(fileMetadata.ChunkLocations))
	results := make(chan struct {
		index int
		data  []byte
		err   error
	}, len(fileMetadata.ChunkLocations))

	// Start worker pool
	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for loc := range tasks {
				var chunk models.Chunk
				err := database.LiveNodes[loc.NodeIndex].Database("Data").Collection("chunks").
					FindOne(context.Background(), bson.M{
						"file_id":     fileID,
						"chunk_index": loc.ChunkIndex,
					}).Decode(&chunk)

				results <- struct {
					index int
					data  []byte
					err   error
				}{loc.ChunkIndex, chunk.Data, err}
			}
		}()
	}

	// Send download tasks
	go func() {
		for _, loc := range fileMetadata.ChunkLocations {
			tasks <- loc
		}
		close(tasks)
	}()

	// Collect and write chunks in order
	chunks := make([][]byte, len(fileMetadata.ChunkLocations))
	go func() {
		wg.Wait()
		close(results)
	}()

	for range fileMetadata.ChunkLocations {
		result := <-results
		if result.err != nil {
			return fmt.Errorf("failed to download chunk %d: %v", result.index, result.err)
		}
		chunks[result.index] = result.data
	}

	// Write chunks sequentially
	for _, chunk := range chunks {
		if _, err := file.Write(chunk); err != nil {
			return fmt.Errorf("failed to write chunk to file: %v", err)
		}
	}

	return nil
}

func deleteUploadedChunks(fileID string, untilIndex int) {
	for _, node := range database.LiveNodes {
		node.Database("Data").Collection("chunks").DeleteMany(
			context.Background(),
			bson.M{
				"file_id":     fileID,
				"chunk_index": bson.M{"$lte": untilIndex},
			},
		)
	}
}

func DeleteFile(fileID string) error {
	// Get file metadata to find chunk locations and parent folder
	var fileMetadata models.File
	CoreDatabase := database.FDS.Database("FDS").Collection("file")

	err := CoreDatabase.FindOne(
		context.Background(),
		bson.M{"file_id": fileID},
	).Decode(&fileMetadata)

	if err != nil {
		return fmt.Errorf("file not found: %v", err)
	}

	// Delete all chunks from their respective nodes
	for _, loc := range fileMetadata.ChunkLocations {
		nodeClient := database.LiveNodes[loc.NodeIndex]
		_, err := nodeClient.Database("Data").Collection("chunks").DeleteOne(
			context.Background(),
			bson.M{
				"file_id":     fileID,
				"chunk_index": loc.ChunkIndex,
			},
		)
		if err != nil {
			return fmt.Errorf("failed to delete chunk %d: %v", loc.ChunkIndex, err)
		}
	}

	// Delete file metadata
	_, err = CoreDatabase.DeleteOne(context.Background(), bson.M{"file_id": fileID})
	if err != nil {
		return fmt.Errorf("failed to delete file metadata: %v", err)
	}

	// Update parent folder's child_file_id array
	err = updateParentFolderFiles(fileID, fileMetadata.ParentFolderID, false)
	if err != nil {
		return fmt.Errorf("failed to update parent folder: %v", err)
	}

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

	// Lọc các file có user_id khớp với userID và is_moved_to_trash == false
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

func AddToStarred(userID, fileID string) error {
	filter := bson.M{"user_id": userID, "file_id": fileID}
	update := bson.M{"$set": bson.M{"is_starred": true}}

	result, err := database.FDS.Database("FDS").Collection("file").UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("failed to add to starred: %v", err)
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("file with ID %s not found for user %s", fileID, userID)
	}

	return nil
}

func RemoveFromStarred(userID, fileID string) error {
	filter := bson.M{"user_id": userID, "file_id": fileID}
	update := bson.M{"$set": bson.M{"is_starred": false}}

	result, err := database.FDS.Database("FDS").Collection("file").UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("failed to remove from starred: %v", err)
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("file with ID %s not found for user %s", fileID, userID)
	}

	return nil
}

func LoadStarred(userID string) ([]bson.M, error) {
	filter := bson.M{"user_id": userID, "is_starred": true, "is_moved_to_trash": false}

	cursor, err := database.FDS.Database("FDS").Collection("file").Find(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("failed to load starred files: %v", err)
	}
	defer cursor.Close(context.Background())

	var files []bson.M
	if err := cursor.All(context.Background(), &files); err != nil {
		return nil, fmt.Errorf("failed to decode files: %v", err)
	}

	return files, nil
}

func MoveToTrash(userID, fileID string) error {
	filter := bson.M{"user_id": userID, "file_id": fileID}
	update := bson.M{"$set": bson.M{"is_moved_to_trash": true}}

	result, err := database.FDS.Database("FDS").Collection("file").UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("failed to move to trash: %v", err)
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("file with ID %s not found for user %s", fileID, userID)
	}

	return nil
}

func Restore(userID, fileID string) error {
	filter := bson.M{"user_id": userID, "file_id": fileID}
	update := bson.M{"$set": bson.M{"is_moved_to_trash": false}}

	result, err := database.FDS.Database("FDS").Collection("file").UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("failed to restore file: %v", err)
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("file with ID %s not found for user %s", fileID, userID)
	}

	return nil
}

func LoadFileInTrash(userID string) ([]bson.M, error) {
	filter := bson.M{"user_id": userID, "is_moved_to_trash": true}

	cursor, err := database.FDS.Database("FDS").Collection("file").Find(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("failed to load files in trash: %v", err)
	}
	defer cursor.Close(context.Background())

	var files []bson.M
	if err := cursor.All(context.Background(), &files); err != nil {
		return nil, fmt.Errorf("failed to decode files: %v", err)
	}

	return files, nil
}

func ShareFile(fileID string, emails []string) error {
	// Add debug logging
	fmt.Printf("Sharing file %s with emails: %v\n", fileID, emails)

	filter := bson.M{"file_id": fileID}
	update := bson.M{
		"$addToSet": bson.M{
			"shared_users": bson.M{
				"$each": emails,
			},
		},
	}

	// Debug print update operation
	fmt.Printf("Update operation: %+v\n", update)

	result, err := database.FDS.Database("FDS").Collection("file").UpdateOne(
		context.Background(),
		filter,
		update,
	)

	// Debug print result
	fmt.Printf("Update result: %+v\n", result)

	if err != nil {
		return fmt.Errorf("failed to share file: %w", err)
	}

	// Verify update
	var file models.File
	err = database.FDS.Database("FDS").Collection("file").FindOne(
		context.Background(),
		filter,
	).Decode(&file)

	if err != nil {
		return fmt.Errorf("failed to verify update: %w", err)
	}

	fmt.Printf("Updated file shared_users: %v\n", file.SharedUsers)

	return nil
}

func GetSharedFiles(email string) ([]bson.M, error) {
	filter := bson.M{"shared_users": email}
	cursor, err := database.FDS.Database("FDS").Collection("file").Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	var results []bson.M
	err = cursor.All(context.Background(), &results)
	return results, err
}
