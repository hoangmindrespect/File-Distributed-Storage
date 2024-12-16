package main

import (
	"fmt"
	"log"
	"net/http"

	controller "back_end/controllers"
	database "back_end/database"
)

func init() {
	// connect to FDS
	if err := database.ConnectToFDS(); err != nil {
		log.Fatalf("Failed to connect to FDS: %v", err)
	}
	fmt.Println("Successfully connected to FDS!")

	// Connect to all nodes
	if err := database.ConnectToNodes(database.NodeURIs); err != nil {
		log.Fatalf("Failed to connect to nodes: %v", err)
	}
	fmt.Println("Successfully connected to all nodes!")}

func enableCORS(handler http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Cho phép requests từ front-end
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173") // URL của Vite dev server
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Authorization")

        // Xử lý preflight request
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        handler(w, r)
    }
}

func main() {
	http.HandleFunc("/register", enableCORS(controller.RegisterHandler))
	http.HandleFunc("/login", enableCORS(controller.LoginHandler))
	// http.HandleFunc("/getuser", controller.GetUserHandler)
	// http.HandleFunc("/getusers", controller.GetAllUsersHandler)
	http.HandleFunc("/currentuser", enableCORS(controller.CurrentUserHandler))

	http.HandleFunc("/file/upload", enableCORS(controller.UploadFileHandler))
	http.HandleFunc("/file/download", enableCORS(controller.DownloadFileHandler))
	http.HandleFunc("/file/delete", enableCORS(controller.DeleteFileHandler))
	http.HandleFunc("/file/rename", enableCORS(controller.RenameFileHandler))
	http.HandleFunc("/file/get_all", enableCORS(controller.GetAllFilesByUserIDHandler))
	http.HandleFunc("/file/get_file_by_id", enableCORS(controller.GetFileByIDHandler))

	http.HandleFunc("/directory/create", enableCORS(controller.CreateDirectoryHandler))
	http.HandleFunc("/directory/update", enableCORS(controller.UpdateDirectoryHandler))
	http.HandleFunc("/directory/rename", enableCORS(controller.RenameDirectoryHandler))
	http.HandleFunc("/directory/delete", enableCORS(controller.DeleteDirectoryHandler))

	http.HandleFunc("/directory/get_all_directories", enableCORS(controller.GetAllDirectoriesByUserIDHandler))
	http.HandleFunc("/directory/get_directory_by_id", enableCORS(controller.GetDirectoryByIDHandler))

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
