package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Directory struct {
    ID         		primitive.ObjectID 	`bson:"_id,omitempty"`
	FolderID     	string            	`bson:"folder_id" json:"folder_id"`
	Name   			string            	`bson:"name" json:"name"`
	ParentID   		string            	`bson:"parent_id" json:"parent_id"`
	ChildFileID   	[]string          	`bson:"child_file_id" json:"child_file_id"`
	ChildFolderID 	[]string          	`bson:"child_folder_id" json:"child_folder_id"`
	CreateAt 		time.Time         	`bson:"create_at" json:"create_at"`
	UserID     		string            	`bson:"user_id" json:"user_id"`
	UpdateAt 		time.Time         	`bson:"update_at" json:"update_at"`
}