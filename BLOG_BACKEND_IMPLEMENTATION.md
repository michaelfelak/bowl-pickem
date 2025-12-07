# Blog Feature - Backend Implementation Guide

## Database Migration

Add this migration to your database migration files (e.g., in `/migrations/` or your migration tool):

```sql
-- Create blog_entries table
CREATE TABLE IF NOT EXISTS blog_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    posted_by VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for faster queries by year and date
CREATE INDEX idx_blog_year ON blog_entries(year);
CREATE INDEX idx_blog_created_date ON blog_entries(created_date);
```

## Go Backend Implementation

### 1. Create BlogEntry Model (`models/blog.go`)

```go
package models

import "time"

// BlogEntry represents a blog post
type BlogEntry struct {
	ID        *int       `json:"Id"`
	Title     string     `json:"Title"`
	Body      string     `json:"Body"`
	PostedBy  string     `json:"PostedBy"`
	CreatedDate string   `json:"CreatedDate"`
	Year      int        `json:"Year"`
}

// CreateBlogEntryRequest is the request body for creating a blog entry
type CreateBlogEntryRequest struct {
	Title     string `json:"Title"`
	Body      string `json:"Body"`
	PostedBy  string `json:"PostedBy"`
	CreatedDate string `json:"CreatedDate"`
}
```

### 2. Create Blog Repository (`repository/blog_repository.go`)

```go
package repository

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"your-module/models"
)

// BlogRepository handles blog database operations
type BlogRepository struct {
	db *sql.DB
}

// NewBlogRepository creates a new blog repository
func NewBlogRepository(db *sql.DB) *BlogRepository {
	return &BlogRepository{db: db}
}

// CreateBlogEntry saves a new blog entry to the database
func (r *BlogRepository) CreateBlogEntry(ctx context.Context, entry *models.BlogEntry, year int) (*models.BlogEntry, error) {
	query := `
		INSERT INTO blog_entries (title, body, posted_by, created_date, year)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	var id int
	err := r.db.QueryRowContext(ctx, query, entry.Title, entry.Body, entry.PostedBy, entry.CreatedDate, year).Scan(&id)
	if err != nil {
		log.Printf("Error creating blog entry: %v", err)
		return nil, err
	}

	entry.ID = &id
	entry.Year = year
	return entry, nil
}

// GetBlogEntriesByYear retrieves all blog entries for a specific year
func (r *BlogRepository) GetBlogEntriesByYear(ctx context.Context, year int) ([]models.BlogEntry, error) {
	query := `
		SELECT id, title, body, posted_by, created_date, year
		FROM blog_entries
		WHERE year = $1
		ORDER BY created_date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, year)
	if err != nil {
		log.Printf("Error querying blog entries: %v", err)
		return nil, err
	}
	defer rows.Close()

	var entries []models.BlogEntry
	for rows.Next() {
		var entry models.BlogEntry
		var createdDate time.Time

		err := rows.Scan(&entry.ID, &entry.Title, &entry.Body, &entry.PostedBy, &createdDate, &entry.Year)
		if err != nil {
			log.Printf("Error scanning blog entry: %v", err)
			return nil, err
		}

		entry.CreatedDate = createdDate.Format("2006-01-02T15:04:05Z07:00")
		entries = append(entries, entry)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error iterating blog entries: %v", err)
		return nil, err
	}

	return entries, nil
}

// DeleteBlogEntry removes a blog entry from the database
func (r *BlogRepository) DeleteBlogEntry(ctx context.Context, id int) error {
	query := `DELETE FROM blog_entries WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		log.Printf("Error deleting blog entry: %v", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("blog entry not found")
	}

	return nil
}
```

### 3. Create Blog Service (`service/blog_service.go`)

```go
package service

import (
	"context"
	"log"

	"your-module/models"
	"your-module/repository"
)

// BlogService handles business logic for blog entries
type BlogService struct {
	repo *repository.BlogRepository
}

// NewBlogService creates a new blog service
func NewBlogService(repo *repository.BlogRepository) *BlogService {
	return &BlogService{repo: repo}
}

// CreateBlogEntry creates a new blog entry with validation
func (s *BlogService) CreateBlogEntry(ctx context.Context, req *models.CreateBlogEntryRequest, year int) (*models.BlogEntry, error) {
	// Validate input
	if req.Title == "" {
		req.Title = "Blog Entry"
	}
	if req.Body == "" {
		return nil, ErrInvalidInput
	}
	if req.PostedBy == "" {
		return nil, ErrInvalidInput
	}
	if req.CreatedDate == "" {
		return nil, ErrInvalidInput
	}

	entry := &models.BlogEntry{
		Title:       req.Title,
		Body:        req.Body,
		PostedBy:    req.PostedBy,
		CreatedDate: req.CreatedDate,
	}

	createdEntry, err := s.repo.CreateBlogEntry(ctx, entry, year)
	if err != nil {
		log.Printf("Error creating blog entry: %v", err)
		return nil, err
	}

	return createdEntry, nil
}

// GetBlogEntriesByYear retrieves all blog entries for a given year
func (s *BlogService) GetBlogEntriesByYear(ctx context.Context, year int) ([]models.BlogEntry, error) {
	entries, err := s.repo.GetBlogEntriesByYear(ctx, year)
	if err != nil {
		log.Printf("Error getting blog entries: %v", err)
		return nil, err
	}

	if entries == nil {
		entries = []models.BlogEntry{}
	}

	return entries, nil
}

// DeleteBlogEntry removes a blog entry
func (s *BlogService) DeleteBlogEntry(ctx context.Context, id int) error {
	return s.repo.DeleteBlogEntry(ctx, id)
}
```

### 4. Create Blog Handler (`handler/blog_handler.go`)

```go
package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"your-module/models"
	"your-module/service"
)

// BlogHandler handles HTTP requests for blog operations
type BlogHandler struct {
	service *service.BlogService
}

// NewBlogHandler creates a new blog handler
func NewBlogHandler(service *service.BlogService) *BlogHandler {
	return &BlogHandler{service: service}
}

// CreateBlogEntry handles POST /api/v1/blogentry/create/{year}
func (h *BlogHandler) CreateBlogEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract year from URL path
	year, err := strconv.Atoi(r.PathValue("year"))
	if err != nil {
		http.Error(w, "Invalid year", http.StatusBadRequest)
		return
	}

	// Decode request body
	var req models.CreateBlogEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create blog entry
	entry, err := h.service.CreateBlogEntry(r.Context(), &req, year)
	if err != nil {
		http.Error(w, "Failed to create blog entry", http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entry)
}

// GetBlogEntriesByYear handles GET /api/v1/blogentry/list/{year}
func (h *BlogHandler) GetBlogEntriesByYear(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract year from URL path
	year, err := strconv.Atoi(r.PathValue("year"))
	if err != nil {
		http.Error(w, "Invalid year", http.StatusBadRequest)
		return
	}

	// Get blog entries
	entries, err := h.service.GetBlogEntriesByYear(r.Context(), year)
	if err != nil {
		http.Error(w, "Failed to retrieve blog entries", http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entries)
}

// DeleteBlogEntry handles DELETE /api/v1/blogentry/{id}
func (h *BlogHandler) DeleteBlogEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Delete blog entry
	if err := h.service.DeleteBlogEntry(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete blog entry", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusNoContent)
}
```

### 5. Register Routes in Main Application

In your main `main.go` or router setup file, add these routes:

```go
// Initialize blog repository, service, and handler
blogRepo := repository.NewBlogRepository(db)
blogService := service.NewBlogService(blogRepo)
blogHandler := handler.NewBlogHandler(blogService)

// Register blog routes
http.HandleFunc("POST /api/v1/blogentry/create/{year}", blogHandler.CreateBlogEntry)
http.HandleFunc("GET /api/v1/blogentry/list/{year}", blogHandler.GetBlogEntriesByYear)
http.HandleFunc("DELETE /api/v1/blogentry/{id}", blogHandler.DeleteBlogEntry)
```

## Error Handling

Add to your `service/errors.go`:

```go
package service

import "errors"

var (
	ErrInvalidInput = errors.New("invalid input provided")
	ErrNotFound     = errors.New("blog entry not found")
	ErrDatabase     = errors.New("database error occurred")
)
```

## Middleware (Optional but Recommended)

For admin protection, add authentication middleware:

```go
// In your middleware package
func AuthMiddleware(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract JWT token
			token := extractToken(r)
			if token == "" {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Verify token
			claims, err := verifyToken(token)
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Check role (if applicable)
			if requiredRole != "" && claims["role"] != requiredRole {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// Apply middleware to create endpoint
http.Handle("POST /api/v1/blogentry/create/{year}", 
	AuthMiddleware("admin")(http.HandlerFunc(blogHandler.CreateBlogEntry)))
```

## Testing

Example curl commands to test the endpoints:

```bash
# Create blog entry
curl -X POST http://localhost:8080/api/v1/blogentry/create/2025 \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Game Day Analysis",
    "Body": "Today we analyzed the bowl games and found...",
    "PostedBy": "The General",
    "CreatedDate": "2025-12-07T00:00:00Z"
  }'

# Get blog entries
curl http://localhost:8080/api/v1/blogentry/list/2025

# Delete blog entry
curl -X DELETE http://localhost:8080/api/v1/blogentry/1
```
