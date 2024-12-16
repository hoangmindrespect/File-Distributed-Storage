package controller

import (
	services "back_end/services"
	"encoding/json"
	"net/http"
)

func CreateDirectoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Lấy tên directory từ header
	name := r.Header.Get("name")
	if name == "" {
		http.Error(w, "name is required in header", http.StatusBadRequest)
		return
	}

	folderID, err := services.CreateDirectory(name)
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
	if folderID == "" {
		http.Error(w, "folder_id is required", http.StatusBadRequest)
		return
	}

	newName := r.Header.Get("name")
	if newName == "" {
		http.Error(w, "name is required in header", http.StatusBadRequest)
		return
	}

	err := services.RenameDirectory(folderID, newName)
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

func GetAllDirectoriesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	directories, err := services.GetAllDirectories()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(directories)
}

func GetDirectoryByIDHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	folderID := r.URL.Query().Get("folder_id")
	if folderID == "" {
		http.Error(w, "folder_id is required", http.StatusBadRequest)
		return
	}

	directory, err := services.GetDirectoryByID(folderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(directory)
}
