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

func main() {
	http.HandleFunc("/register", controller.RegisterHandler)
	http.HandleFunc("/login", controller.LoginHandler)
	// http.HandleFunc("/getuser", controller.GetUserHandler)
	// http.HandleFunc("/getusers", controller.GetAllUsersHandler)
	http.HandleFunc("/currentuser", controller.CurrentUserHandler)

	// Định nghĩa route handlers
	http.HandleFunc("/upload", controller.UploadFileHandler)
	http.HandleFunc("/download", controller.DownloadFileHandler)
	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
