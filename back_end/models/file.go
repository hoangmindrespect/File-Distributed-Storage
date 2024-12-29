package models

import (
"time"

"go.mongodb.org/mongo-driver/bson/primitive"
)

type File struct {
ID         		primitive.ObjectID 	`bson:"_id,omitempty"`
FileID     		string            	`bson:"file_id" json:"file_id"`
FileName   		string            	`bson:"file_name" json:"file_name"`
FileType   		string            	`bson:"file_type" json:"file_type"`
FileSize   		int64            	`bson:"file_size" json:"file_size"`
UserID     		string            	`bson:"user_id" json:"user_id"`
SharedUsers 	[]string			`bson:"shared_users" json:"shared_users"`
UploadTime 		time.Time         	`bson:"upload_time" json:"upload_time"`
IsStarred       bool                `bson:"is_starred" json:"is_starred"`
IsMovedToTrash  bool                `bson:"is_moved_to_trash" json:"is_moved_to_trash"`
ParentFolderID 	string            	`bson:"parent_folder_id" json:"parent_folder_id"`
ChunkLocations []ChunkLocation `bson:"chunk_locations"`
}

type ChunkLocation struct {
ChunkIndex int `bson:"chunk_index"`
NodeIndex  int `bson:"node_index"`
}