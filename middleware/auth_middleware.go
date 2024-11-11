package middleware

import (
	helper "back_end/helpers"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Authenticate() gin.HandlerFunc{
	return func(c * gin.Context){
		clientToken := c.Request.Header.Get("token")
		if clientToken == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": fmt.Sprint("Authenticate fail")})
			c.Abort()
			return
		}

		claims, err := helper.ValidateToken(clientToken)
		if err != ""{
			c.JSON(http.StatusInternalServerError, gin.H{"error", err})
			c.Abort()
			return
		}

		c.Set("email", claims. Email)
		c.Set("user_type", claims.User_type)
		c.Next()
	}
}