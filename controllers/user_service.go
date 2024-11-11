package controller

import (
	"back_end/fds_core/database"
	helper "back_end/helpers"
	"back_end/users"
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "user")
var validate = validator.New()

func HashPassword(password string) string{
	bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil{
		log.Panic(err)
	}
	return string(bytes)	
}	

func Signup()gin.HandlerFunc{
	return func(c *gin. Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var user users.User
		
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		validationErr := validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error":validationErr. Error()})
			return
		}
		
		count, err := userCollection.CountDocuments(ctx, bson.M{"email":user. Email})
		defer cancel()

		password := HashPassword(*user.Password)
		user.Password := &password

		if err != nil {
			log.Panic(err)
			c. JSON(http. StatusInternalServerError, gin.H{"error":"error occured while checking for the"})
		}
			
		if count >0{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "this email was used!"})
		}

		user.Create_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.Update_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.ID = primitive.NewObjectID()
		user.User_id = user.ID.Hex()
		token, refreshToken, _ := helper.GenerateAllTokens(*user.Email)
		user.Token = &token
		user.Refresh_token = &refreshToken
		result, insertErr := userCollection.InsertOne(ctx, user)
		if insertErr != nil{
			msg := fmt.Sprintf("User item was not created")
			c.JSON(http.StatusInternalServerError, gin.H{"error":msg})
			return
		}
		defer cancel()
		c.JSON(http.StatusOK, result)
	}
}

func Login() gin. HandlerFunc{
	return func(c *gin. Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var user users.User
		var foundUser users.User
		
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error":err.Error()})
			return
		}
		
		err := userCollection. FindOne(ctx, bson.M{"email":user. Email}).Decode(&foundUser)
		defer cancel ()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error":"email or password is incorrect"})
			return
		}
		
		passwordIsValid, msg := VerifyPassword(*user.Password, *foundUser.Password)
		defer cancel()
		
		if passwordIsValid != true{
			c.JSON(http.StatusInternalServerError, gin.H{"Error": msg})
			return
		}

		if foundUser.Email == nil{
			c.JSON(http.StatusInternalServerError, gin.H{"Error":"user not found"})
		}

		token, refreshToken, _ := helper.GenerateAllTokens((*foundUser.Email))
		helper.UpdateAllToken(token, refreshToken, foundUser.User_id)
		userCollection.FindOne(ctx, bson.M{"user_id":foundUser.User_id}).Decode(&foundUser)

		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		}
		c.JSON(http.StatusOK, foundUser)
	}
}

func VerifyPassword(userPassword string, providedPassword string) (bool, string){
	err := bcrypt.CompareHashAndPassword([]byte(providedPassword), []byte(userPassword))
	check := true
	msg := ""
	
	if err != nil {
		msg = fmt.Sprintf("email of password is incorrect")
		check=false
	}
	return check, msg
}

// func GetUsers () gin.HandlerFunc{
// 	return func(c *gin.Context){
// 		helper.CheckUserType(c, "ADMIN") ; err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error":err.Error()})
// 			return
// 		}
// 		var ctx, cancel = context.WithTimeout (context. Background(), 100*time.Second)
		
// 		recordPerPage, err := strconv.Atoi(c.Query("recordPerPage"))
// 		if err != nil | | recordPerPage <1{
// 			recordPerPage = 10
// 		}
// 		page, errl := strconv.Atoi(c.Query("page"))
// 		if errl != nil | | page<1{
// 			page = 1
// 		}
		
// 		startIndex := (page - 1) * recordPerPage
// 		startIndex, err = strconv.Atoi(c.Query("startIndex"))
		
// 		matchStage := bson.D{{"$match", bson.D{{}}}}
// 		groupStage := bson.D{{"$group", bson.D{{"_id", bson.D{"_id", "null"}}, "total_count", bson.D{"$sum", 1}}}}
// 	}
// }

func GetUser() gin. HandlerFunc{
	return func(c *gin.Context){
		userId := c.Param("user_id")
		
		if err := helper.MatchUserTypeToUid(c, userId); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error":err.Error()})
			return
		}
		
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		
		var user users.User
		err := userCollection.FindOne(ctx, bson.M{"user_id":userId}).Decode(&user)
		defer cancel()
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, user)
	}
}