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

	// Định nghĩa route handlers
	http.HandleFunc("/upload", enableCORS(controller.UploadFileHandler))
	http.HandleFunc("/download", enableCORS(controller.DownloadFileHandler))
	http.HandleFunc("/delete", enableCORS(controller.DeleteFileHandler))
	http.HandleFunc("/rename", enableCORS(controller.RenameFileHandler))

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
