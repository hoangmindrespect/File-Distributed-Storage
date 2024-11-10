package database

import (
	"context"
	"fmt"
	"os"
	"time"

	_ "github.com/joho/godotenv/autoload"
	"go.mongodb.org/mongo-driver/mongo"

	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectToMongoDB() (*mongo.Client) {
    // Thiết lập URI và cấu hình timeout cho context
    mongoURI := os.Getenv("MONGODB_URI")
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    // Kết nối đến MongoDB
    client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
    if err != nil {
        fmt.Println("error connecting to MongoDB")
    }

    // Kiểm tra kết nối bằng Ping
    if err := client.Ping(ctx, nil); err != nil {
        fmt.Println("failed to ping MongoDB")
    }

    fmt.Println("Connected to MongoDB!")
    return client
}

var Client *mongo.Client = ConnectToMongoDB()
func OpenCollection(client *mongo.Client, collectionName string) *mongo. Collection{
	var collection *mongo. Collection = client.Database("").Collection(collectionName)
	return collection
}
