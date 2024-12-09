package controller

import (
	services "back_end/services"
	models "back_end/users"
	"encoding/json"
	"fmt"
	"net/http"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    var user models.User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Failed to parse request body", http.StatusBadRequest)
        return
    }

    // Đăng ký người dùng
    if err := services.RegisterUser(&user); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("User registered successfully"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    credentials := make(map[string]string)

    if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
        http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
        return
    }

    token, err := services.LoginUser(credentials["email"], credentials["pass"])
    if err != nil {
        http.Error(w, fmt.Sprintf("Login failed: %v", err), http.StatusUnauthorized)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(fmt.Sprintf(`{"message":"Login successful","token":"%s"}`, token)))
}

// func GetUserHandler(w http.ResponseWriter, r *http.Request) {
//     email := r.URL.Query().Get("email")

//     user, err := services.GetUserByEmail(email)
//     if err != nil {
//         http.Error(w, "User not found", http.StatusNotFound)
//         return
//     }

//     w.WriteHeader(http.StatusOK)
//     json.NewEncoder(w).Encode(user)
// }

func CurrentUserHandler(w http.ResponseWriter, r *http.Request) {
    token := r.Header.Get("Authorization")

    user, err := services.GetUserByToken(token)
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(user)
}