package main

import (
	"back_end/fds_core/database"
	routes "back_end/routes"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

// func gracefulShutdown(apiServer *http.Server, done chan bool) {
// 	// Create context that listens for the interrupt signal from the OS.
// 	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
// 	defer stop()

// 	// Listen for the interrupt signal.
// 	<-ctx.Done()

// 	log.Println("shutting down gracefully, press Ctrl+C again to force")

// 	// The context is used to inform the server it has 5 seconds to finish
// 	// the request it is currently handling
// 	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
// 	defer cancel()
// 	if err := apiServer.Shutdown(ctx); err != nil {
// 		log.Printf("Server forced to shutdown with error: %v", err)
// 	}

// 	log.Println("Server exiting")

// 	// Notify the main goroutine that the shutdown is complete
// 	done <- true
// }

func main() {

	// Init connection with our MongoDB
    database.ConnectToMongoDB()

	port := os.Getenv("PORT")

	if port == ""{
		port="8000"
	}

	router := gin.New()
	router.Use(gin.Logger())

	routes.AuthRoutes(router)
	routes.UserRoutes(router)

	router.GET("/api-1", func(c *gin.Context){
		c.JSON(200, gin.H{"success":"Access granted for api-1"})
	})

	router. GET("/api-2", func(c *gin.Context){
		c.JSON(200, gin.H{"success":"Access granted for api-2"})
	})

	router.RUN(":" + port)
}
