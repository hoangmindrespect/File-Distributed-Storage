package controller

import (
	models "back_end/models"
	services "back_end/services"
	"encoding/json"
	"net/http"
)

func CreateDirectoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateDirectoryRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	userID, err := services.GetUserByToken(r.Header.Get("Authorization"))
	if err != nil {
		http.Error(w, "Invalid or missing token", http.StatusUnauthorized)
		return
	}

	folderID, err := services.CreateDirectory(req.Name, req.ParentId, userID, false)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Directory created successfully", "folder_id": folderID})
}

func RenameDirectoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	folderID := r.URL.Query().Get("folder_id")
	newFolderName := r.URL.Query().Get("new_folder_name")
	
	if folderID == "" || newFolderName == "" {
		http.Error(w, "folder_id and new_folder_name is required", http.StatusBadRequest)
		return
	}

	err := services.RenameDirectory(folderID, newFolderName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Directory renamed successfully"})
}

// Cập nhật thư mục tức là thêm file folder vô
func UpdateDirectoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	folderID := r.URL.Query().Get("folder_id")
	if folderID == "" {
		http.Error(w, "folder_id is required", http.StatusBadRequest)
		return
	}

	id := r.Header.Get("id")
	if id == "" {
		http.Error(w, "id is required in header", http.StatusBadRequest)
		return
	}

	isFile := r.URL.Query().Get("is_file") == "true"

	err := services.UpdateDirectory(folderID, id, isFile)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Directory updated successfully"})
}

// Xóa thư mục
func DeleteDirectoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	folderID := r.URL.Query().Get("folder_id")
	if folderID == "" {
		http.Error(w, "folder_id is required", http.StatusBadRequest)
		return
	}

	err := services.DeleteDirectory(folderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Directory deleted successfully"})
}

func GetAllDirectoriesByUserIDHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Lấy UserID từ token
	userID, err := services.GetUserByToken(r.Header.Get("Authorization"))
	if err != nil {
		http.Error(w, "Invalid or missing token", http.StatusUnauthorized)
		return
	}

	// Lấy danh sách thư mục theo UserID
	directories, err := services.GetAllDirectoriesByUserId(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.ApiResponse{
		Success: true,
		Data:    directories,
	})
}

func GetDirectoryByIDHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Lấy fileID từ query
	fileID := r.URL.Query().Get("folder_id")
	if fileID == "" {
		http.Error(w, "folder_id is required", http.StatusBadRequest)
		return
	}

	// Lấy UserID từ token
	userID, err := services.GetUserByToken(r.Header.Get("Authorization"))
	if err != nil {
		http.Error(w, "Invalid or missing token", http.StatusUnauthorized)
		return
	}

	// Lấy thông tin file theo fileID
	directory, err := services.GetDirectoryById(fileID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.ApiResponse{
		Success: true,
		Data:    directory,
	})
}


