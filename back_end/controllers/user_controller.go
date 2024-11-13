package controller

import (
	helper "back_end/helpers"
	"context"
	"errors"
	"time"

	"back_end/users"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func Signup(ctx context.Context, db *mongo.Collection, email, password string) (string, string, error) {
	// Check if user exists
	var existingUser users.User
	err := db.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		return "", "", errors.New("user already exists")
	}

	// Hash password (using bcrypt or similar)
	hashedPassword, _ := HashPassword(password)

	user := users.User{
		ID:            primitive.NewObjectID(),
		Email:         &email,
		Password:      &hashedPassword,
		Create_at:     time.Now(),
		Update_at:     time.Now(),
		User_id:       primitive.NewObjectID().Hex(),
	}

	// Insert the new user
	_, err = db.InsertOne(ctx, user)
	if err != nil {
		return "", "", err
	}

	// Generate JWT tokens
	token, err := helper.GenerateJWT(user.User_id)
	refreshToken, err := helper.GenerateJWT(user.User_id) // Generate refresh token differently if needed

	return token, refreshToken, nil
}

func Signin(ctx context.Context, db *mongo.Collection, email, password string) (string, string, error) {
	// Find the user by email
	var user users.User
	err := db.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return "", "", errors.New("user not found")
	}

	// Check password
	if !CheckPasswordHash(password, *user.Password) {
		return "", "", errors.New("incorrect password")
	}

	// Generate tokens
	token, err := helper.GenerateJWT(user.User_id)
	refreshToken, err := helper.GenerateJWT(user.User_id)

	return token, refreshToken, nil
}

func GetUser(ctx context.Context, db *mongo.Collection, userID string) (*users.User, error) {
	var user users.User
	err := db.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

func GetUsers(ctx context.Context, db *mongo.Collection) ([]*users.User, error) {
	cursor, err := db.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users_list []*users.User
	for cursor.Next(ctx) {
		var user users.User
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		users_list = append(users_list, &user)
	}

	return users_list, nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
