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
