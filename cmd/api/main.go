package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	controller "back_end/controllers"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var userCollection *mongo.Collection

func init() {
	// Kết nối MongoDB
	godotenv.Load()
	mongo_uri := os.Getenv("MONGODB_URI")
	clientOptions := options.Client().ApplyURI(mongo_uri)
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}

	userCollection = client.Database("FDS").Collection("user") // Đặt tên database phù hợp
	fmt.Println("Connected to MongoDB!")
}

func main() {
	http.HandleFunc("/signup", SignupHandler)
	http.HandleFunc("/signin", SigninHandler)
	http.HandleFunc("/getuser", GetUserHandler)
	http.HandleFunc("/getusers", GetUsersHandler)

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Signup Handler
func SignupHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	json.NewDecoder(r.Body).Decode(&req)
	token, refreshToken, err := controller.Signup(context.Background(), userCollection, req.Email, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resp := map[string]string{
		"token":         token,
		"refresh_token": refreshToken,
	}
	json.NewEncoder(w).Encode(resp)
}

// Signin Handler
func SigninHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	json.NewDecoder(r.Body).Decode(&req)
	token, refreshToken, err := controller.Signin(context.Background(), userCollection, req.Email, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	resp := map[string]string{
		"token":         token,
		"refresh_token": refreshToken,
	}
	json.NewEncoder(w).Encode(resp)
}

// GetUser Handler
func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	user, err := controller.GetUser(context.Background(), userCollection, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(user)
}

// GetUsers Handler
func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := controller.GetUsers(context.Background(), userCollection)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(users)
}
