package services

import (
	"context"
	"errors"
	"time"

	database "back_end/database"
	helper "back_end/helpers"
	models "back_end/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

var Token string
func RegisterUser(user *models.User) error {
    collection := database.FDS.Database("FDS").Collection("user")
    var existingUser models.User
    err := collection.FindOne(context.Background(), bson.M{"email": user.Email}).Decode(&existingUser)

    if err == nil {
        return errors.New("email already exists")
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*user.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }

    hashedPasswordStr := string(hashedPassword)
    user.Password = &hashedPasswordStr

    user.Create_at = time.Now()
    user.Update_at = time.Now()

    // Insert user vào database
    result, err := collection.InsertOne(context.Background(), user)
    if err != nil {
        return err
    }

    // objectId = user_id
    user.User_id = result.InsertedID.(primitive.ObjectID).Hex()

    filter := bson.M{"_id": result.InsertedID}
    update := bson.M{"$set": bson.M{"user_id": user.User_id}}

    _, err = collection.UpdateOne(context.Background(), filter, update)
    if err != nil {
        return err
    }

    return nil
}



func LoginUser(email, password string) (string, error) {
    collection := database.FDS.Database("FDS").Collection("user")

    var user models.User
    err := collection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)
    if err != nil {
        return "", errors.New("user not found")
    }

    if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(password)); err != nil {
        return "", errors.New("invalid password")
    }

    token, err := helper.GenerateJWT(user.User_id) // Sử dụng user_id để tạo token
    if err != nil {
        return "", err
    }
    Token = token
    // Cập nhật token vào MongoDB
    update := bson.M{"$set": bson.M{"token": token, "update_at": time.Now()}}
    _, err = collection.UpdateOne(context.TODO(), bson.M{"email": email}, update)

    return token, err
}

func GetUserByToken(token string) (string, error) {
    // Xác thực token và lấy user_id
    userID, err := helper.ValidateJWT(token)
    if err != nil {
        return "nil", errors.New("invalid token")
    }

    // Lấy user theo user_id từ database
    collection := database.FDS.Database("FDS").Collection("user")
    var user models.User
    err = collection.FindOne(context.TODO(), bson.M{"user_id": userID}).Decode(&user)
    if err != nil {
        return "nil", errors.New("user not found")
    }

    return userID, nil
}
