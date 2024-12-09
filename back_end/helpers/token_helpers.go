package helper

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

var SECRET_KEY string = os.Getenv("SECRET_KEY")

// Tạo JWT token
func GenerateJWT(userID string) (string, error) {
    claims := jwt.MapClaims{}
    claims["user_id"] = userID
    claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(SECRET_KEY)) // Đảm bảo SECRET_KEY đã được cấu hình
}

// Xác thực JWT token
func ValidateJWT(token string) (string, error) {
    //Bỏ bearer
    if len(token) > 7 && token[:7] == "Bearer " {
        token = token[7:]
    }

    // Parse và xác thực JWT token
    claims := jwt.MapClaims{}
    parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(SECRET_KEY), nil
    })
    if err != nil || !parsedToken.Valid {
        return "", errors.New("invalid token")
    }

    // Trả về user_id từ claims
    userID, ok := claims["user_id"].(string)
    if !ok {
        return "", errors.New("user_id not found in token")
    }

    return userID, nil
}