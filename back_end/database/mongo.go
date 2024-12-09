package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


var LiveNodes []*mongo.Client
var FDS *mongo.Client

// ConnectToMongoDB - Kết nối các node MongoDB
func ConnectToNodes(uris []string) error {
	for _, uri := range uris {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		node, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err != nil {
			return err
		}

		LiveNodes = append(LiveNodes, node)
	}
	return nil
}

// ConnectToMongoDB - Kết nối các FDSDB
func ConnectToFDS() error {
	// Load biến môi trường
	err := godotenv.Load()
	if err != nil {
		return fmt.Errorf("failed to load .env file: %w", err)
	}

	// Lấy URI từ biến môi trường
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		return fmt.Errorf("MONGODB_URI is not set in the environment")
	}

	// Tạo client options
	clientOptions := options.Client().ApplyURI(mongoURI)

	// Kết nối MongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		return err
	}
	FDS = client
	return nil
}
