package users

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID             primitive.ObjectID `db:"id"`
	Type           string             `db:"user_type"`
	Email          string             `db:"email"`
	Password string                   `db:"pass"`
	Token		   string             `db:"token"`
	Refresh_token  string             `db:"refresh_token"`
	Create_at	   time.Time		  `db:"create_at"`
	Update_at      time.Time		  `db:"update_at"`
	User_id		   string 			  `db:"user_id`
}

