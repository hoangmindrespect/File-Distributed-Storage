package controller

import (
	"encoding/json"
	"fmt"
	"net/http"

	"back_end/models"
	services "back_end/services"
)

func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Check method
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// // Get multipart reader
	// reader, err := r.MultipartReader()
	// if err != nil {
	//     http.Error(w, "Error getting multipart reader", http.StatusBadRequest)
	//     return
	// }

	// // Read first part (file)
	// part, err := reader.NextPart()
	// if err != nil {
	//     http.Error(w, "Error reading multipart form", http.StatusBadRequest)
	//     return
	// }

	// // Check if file is provided
	// if part.FileName() == "" {
	//     http.Error(w, "No file provided", http.StatusBadRequest)
	//     return
	// }

	// // Get parent folder ID from query params
	// parentFolderId := r.URL.Query().Get("parentFolderId")

	// Get user from token first
	userId, err := services.GetUserByToken(r.Header.Get("Authorization"))
	if err != nil {
		json.NewEncoder(w).Encode(models.ApiResponse{
			Success: false,
			Message: "Invalid or missing token",
		})
		return
	}

	// Get file from multipart form
	file, handler, err := r.FormFile("file")
	if err != nil {
		json.NewEncoder(w).Encode(models.ApiResponse{
			Success: false,
			Message: "No file provided",
		})
		return
	}
	defer file.Close()

	parentFolderId := r.URL.Query().Get("parentFolderId")
	if parentFolderId == "folder-root-" {
		parentFolderId = parentFolderId + userId
	}

	// Upload file
	err = services.UploadFileParallel(file, handler.Filename, parentFolderId)
	if err != nil {
		json.NewEncoder(w).Encode(models.ApiResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Return success response
	json.NewEncoder(w).Encode(models.ApiResponse{
		Success: true,
		Message: "File uploaded successfully",
	})
}

func DeleteFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	fileID := r.URL.Query().Get("file_id")
	if fileID == "" {
		http.Error(w, "file_id is required", http.StatusBadRequest)
		return
	}

	err := services.DeleteFile(fileID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "File deleted successfully"})
}

func DownloadFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}

	fileName := r.URL.Query().Get("file_name")
	if fileName == "" {
		http.Error(w, "file_name is required", http.StatusBadRequest)
		return
	}

	err := services.DownloadFileParallel(fileName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("File %s downloaded successfully", fileName),
	})
}

func RenameFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	fileID := r.URL.Query().Get("file_id")
	newFileName := r.URL.Query().Get("new_file_name")

	if fileID == "" || newFileName == "" {
		http.Error(w, "file_id and new_file_name are required", http.StatusBadRequest)
		return
	}

	err := services.RenameFile(fileID, newFileName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "File renamed successfully",
	})
}

func GetAllFilesByUserIDHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		json.NewEncoder(w).Encode(models.ApiResponse{Success: false, Message: "Invalid request method"})
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// Lấy UserID từ token
	userID, err := services.GetUserByToken(r.Header.Get("Authorization"))
	if err != nil {
		json.NewEncoder(w).Encode(models.ApiResponse{Success: false, Message: "Invalid or missing token"})
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Lấy danh sách file theo UserID
	files, err := services.GetAllFilesByUserID(userID)
	if err != nil {
		json.NewEncoder(w).Encode(models.ApiResponse{Success: false, Message: "Invalid or missing token"})
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.ApiResponse{
		Success: true,
		Data:    files,
	})
}

func GetFileByIDHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Lấy fileID từ query
	fileID := r.URL.Query().Get("file_id")
	if fileID == "" {
		http.Error(w, "file_id is required", http.StatusBadRequest)
		return
	}

	// Lấy UserID từ token
	userID, err := services.GetUserByToken(r.Header.Get("Authorization"))
	if err != nil {
		http.Error(w, "Invalid or missing token", http.StatusUnauthorized)
		return
	}

	// Lấy thông tin file theo fileID
	file, err := services.GetFileByID(fileID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.ApiResponse{
		Success: true,
		Data:    file,
	})
}

func AddToStarredHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestData struct {
		UserID string `json:"user_id"`
		FileID string `json:"file_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := services.AddToStarred(requestData.UserID, requestData.FileID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "File added to starred successfully",
	})
}

func RemoveFromStarredHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestData struct {
		UserID string `json:"user_id"`
		FileID string `json:"file_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := services.RemoveFromStarred(requestData.UserID, requestData.FileID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "File removed from starred successfully",
	})
}

func LoadStarredHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	files, err := services.LoadStarred(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"data":    files,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func MoveToTrashHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestData struct {
		UserID string `json:"user_id"`
		FileID string `json:"file_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := services.MoveToTrash(requestData.UserID, requestData.FileID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "File moved to trash successfully",
	})
}

func RestoreHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestData struct {
		UserID string `json:"user_id"`
		FileID string `json:"file_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := services.Restore(requestData.UserID, requestData.FileID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "File restored successfully",
	})
}

func LoadFileInTrashHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	files, err := services.LoadFileInTrash(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"data":    files,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func ShareFileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Check method
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req struct {
		FileID string   `json:"file_id"`
		Emails []string `json:"emails"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate fileId
	if req.FileID == "" {
		http.Error(w, "file_id is required", http.StatusBadRequest)
		return
	}

	// Validate emails
	if len(req.Emails) == 0 {
		http.Error(w, "emails are required", http.StatusBadRequest)
		return
	}

	// Share folder
	if err := services.ShareFile(req.FileID, req.Emails); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.ApiResponse{
		Success: true,
		Message: "Folder shared successfully",
	})
}

func GetSharedFilesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Check method
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	//Get user email by token
	user, err := services.GetUserDataByToken(r.Header.Get("Authorization"))
	if err != nil {
		http.Error(w, "Invalid or missing token", http.StatusUnauthorized)
		return
	}

	// Get shared files
	sharedFiles, err := services.GetSharedFiles(*user.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.ApiResponse{
		Success: true,
		Data:    sharedFiles,
	})
}

func MoveFileHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
        return
    }

    var req struct {
        FileID string `json:"file_id"`
        NewParentID string `json:"new_parent_id"` 
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    if err := services.MoveFile(req.FileID, req.NewParentID); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "File moved successfully",
    })
}
