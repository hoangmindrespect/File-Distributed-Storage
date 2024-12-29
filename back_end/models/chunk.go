package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Chunk struct {
    ID         primitive.ObjectID `bson:"_id,omitempty"`
    FileID     string            `bson:"file_id" json:"file_id"`
    FileName   string            `bson:"file_name" json:"file_name"`
    ChunkIndex int               `bson:"chunk_index" json:"chunk_index"`
    Data       []byte            `bson:"data" json:"data"`
    UploadTime time.Time         `bson:"upload_time" json:"upload_time"`
}