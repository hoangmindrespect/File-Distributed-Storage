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
	fmt.Println("Successfully connected to all nodes!")
}

func enableCORS(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
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

// Setup routes
type Route struct {
	Path    string
	Handler http.HandlerFunc
}

type Router struct {
	mux    *http.ServeMux
	routes []Route
}

func NewRouter() *Router {
	return &Router{
		mux:    http.NewServeMux(),
		routes: defineRoutes(),
	}
}

func (r *Router) registerRoutes() {
	for _, route := range r.routes {
		r.mux.HandleFunc(route.Path, enableCORS(route.Handler))
	}
}

func defineRoutes() []Route {
	return []Route{
		// Auth routes
		{"/register", controller.RegisterHandler},
		{"/login", controller.LoginHandler},
		{"/currentuser", controller.CurrentUserHandler},
		// {"/getuser", controller.GetUserHandler},
		// {"/getusers", controller.GetAllUsersHandler},

		// File routes
		{"/file/upload", controller.UploadFileHandler},
		{"/file/download", controller.DownloadFileHandler},
		{"/file/delete", controller.DeleteFileHandler},
		{"/file/rename", controller.RenameFileHandler},
		{"/file/get_all", controller.GetAllFilesByUserIDHandler},
		{"/file/get_file_by_id", controller.GetFileByIDHandler},
		{"/file/add_to_starred", controller.AddToStarredHandler},
		{"/file/remove_from_starred", controller.RemoveFromStarredHandler},
		{"/file/load_starred", controller.LoadStarredHandler},
		{"/file/move_to_trash", controller.MoveToTrashHandler},
		{"/file/restore", controller.RestoreHandler},
		{"/file/load_trash", controller.LoadFileInTrashHandler},
		{"/file/share", controller.ShareFileHandler},
		{"/file/get_shared_files", controller.GetSharedFilesHandler},

		// Directory routes
		{"/directory/create", controller.CreateDirectoryHandler},
		{"/directory/update", controller.UpdateDirectoryHandler},
		{"/directory/rename", controller.RenameDirectoryHandler},
		{"/directory/delete", controller.DeleteDirectoryHandler},
		{"/directory/get_all_directories", controller.GetAllDirectoriesByUserIDHandler},
		{"/directory/get_directory_by_id", controller.GetDirectoryByIDHandler},
		{"/directory/move_to_trash", controller.MoveFolderToTrashHandler},
		{"/directory/restore", controller.RestoreFolderHandler},
		{"/directory/load_trash", controller.LoadFolderInTrashHandler},
		// {"/directory/share", controller.ShareFolderHandler},
		// {"/directory/get_shared_directories", controller.GetSharedFoldersHandler},
	}
}

func main() {
	router := NewRouter()
	router.registerRoutes()

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router.mux))
}
