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

func MoveFolderToTrashHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestData struct {
		UserID string `json:"user_id"`
		FolderID string `json:"folder_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := services.MoveFolderToTrash(requestData.UserID, requestData.FolderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Folder moved to trash successfully",
	})
}

func RestoreFolderHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestData struct {
		UserID string `json:"user_id"`
		FolderID string `json:"folder_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := services.RestoreFolder(requestData.UserID, requestData.FolderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Folder restored successfully",
	})
}

func LoadFolderInTrashHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	folders, err := services.LoadFolderInTrash(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"data":    folders,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}


// func ShareFolderHandler(w http.ResponseWriter, r *http.Request) {
//     w.Header().Set("Content-Type", "application/json")

//     // Check method
//     if r.Method != http.MethodPost {
//         http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
//         return
//     }

//     // Parse request body
//     var req struct {
// 		FolderID string   `json:"folder_id"`
//         Emails []string `json:"emails"`
//     }
//     if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//         http.Error(w, "Invalid request body", http.StatusBadRequest)
//         return
//     }

// 	if req.FolderID == "" {
//         http.Error(w, "folder_id is required", http.StatusBadRequest)
//         return
//     }

//     // Validate emails
//     if len(req.Emails) == 0 {
//         http.Error(w, "emails are required", http.StatusBadRequest)
//         return
//     }

//     // Share folder
//     if err := services.ShareDirectory(req.FolderID, req.Emails); err != nil {
//         http.Error(w, err.Error(), http.StatusInternalServerError)
//         return
//     }

//     // Return success
//     w.WriteHeader(http.StatusOK)
//     json.NewEncoder(w).Encode(models.ApiResponse{
//         Success: true,
//         Message: "Folder shared successfully",
//     })
// }

// func GetSharedFoldersHandler(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Type", "application/json")

//     // Check method
//     if r.Method != http.MethodGet {
//         http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
//         return
//     }

// 	//Get user email by token
// 	user, err := services.GetUserDataByToken(r.Header.Get("Authorization"))
// 	if err != nil {
// 		http.Error(w, "Invalid or missing token", http.StatusUnauthorized)
// 		return
// 	}

// 	// Get shared files
// 	sharedFolders, err := services.GetSharedDirectories(*user.Email)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}


//     // Return success
//     w.WriteHeader(http.StatusOK)
//     json.NewEncoder(w).Encode(models.ApiResponse{
//         Success: true,
//         Data:    sharedFolders,
//     })
// }

