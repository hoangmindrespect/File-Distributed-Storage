package helper

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

var SECRET_KEY string = os.Getenv("SECRET_KEY")

type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}

// GenerateJWT generates a new JWT token
func GenerateJWT(userID string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(SECRET_KEY)
}

// ValidateToken validates a JWT token
func ValidateToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return SECRET_KEY, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}