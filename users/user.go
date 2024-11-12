package users

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID             primitive.ObjectID `bson:"_id"`
	Type           *string            `json:"user_type"`
	Email          *string            `json:"email"`
	Password 	   *string            `json:"pass"`
	Token		   *string            `json:"token"`
	Refresh_token  *string            `json:"refresh_token"`
	Create_at	   time.Time		  `json:"create_at"`
	Update_at      time.Time		  `json:"update_at"`
	User_id		   string 			  `json:"user_id"`
}

