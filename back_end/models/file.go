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
    UploadTime 		time.Time         	`bson:"upload_time" json:"upload_time"`
	ParentFolderID 	string            	`bson:"parent_folder_id" json:"parent_folder_id"`
    ChunkLocations []ChunkLocation `bson:"chunk_locations"`
}

type ChunkLocation struct {
    ChunkIndex int `bson:"chunk_index"`
    NodeIndex  int `bson:"node_index"`
}