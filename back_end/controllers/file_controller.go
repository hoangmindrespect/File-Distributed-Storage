package controller

import (
	"encoding/json"
	"fmt"
	"net/http"

	services "back_end/services"
)

func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	filePath := r.URL.Query().Get("file_path")
	if filePath == "" {
		http.Error(w, "file_path is required", http.StatusBadRequest)
		return
	}

	err := services.UploadFile(filePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "File uploaded successfully"})
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

	err := services.DownloadFile(fileName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("File %s downloaded successfully", fileName),
	})
}
