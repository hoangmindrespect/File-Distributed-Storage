package models


type ApiResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

type CreateDirectoryRequest struct {
	Name string `json:"name"`
	ParentId string `json:"parent_id"`
}