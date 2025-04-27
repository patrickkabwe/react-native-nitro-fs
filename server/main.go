package main

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func main() {
	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/download/", downloadHandler) // Note the trailing slash

	port := ":5100"
	fmt.Printf("Server running at http://localhost%s\n", port)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		panic(err)
	}
}

func downloadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract filename from URL path
	filename := strings.TrimPrefix(r.URL.Path, "/download/")
	if filename == "" {
		http.Error(w, "Filename not provided", http.StatusBadRequest)
		return
	}

	// Ensure the filename is safe
	filename = filepath.Base(filename)
	filePath := filepath.Join("./uploads", filename)

	// Check if file exists
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "File not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to access file", http.StatusInternalServerError)
		}
		return
	}

	// Open the file
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, "Failed to open file", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Get content type
	contentType := mime.TypeByExtension(filepath.Ext(filename))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Set headers
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	w.Header().Set("Accept-Ranges", "bytes")
	w.Header().Set("Content-Length", strconv.FormatInt(fileInfo.Size(), 10))
	w.Header().Set("Last-Modified", fileInfo.ModTime().UTC().Format(http.TimeFormat))
	w.Header().Set("ETag", fmt.Sprintf(`"%x-%x"`, fileInfo.ModTime().Unix(), fileInfo.Size()))

	// Handle range requests
	rangeHeader := r.Header.Get("Range")
	if rangeHeader != "" {
		// Parse range header
		ranges, err := parseRange(rangeHeader, fileInfo.Size())
		if err != nil {
			http.Error(w, "Invalid range", http.StatusRequestedRangeNotSatisfiable)
			return
		}
		if len(ranges) > 1 {
			http.Error(w, "Multiple ranges not supported", http.StatusRequestedRangeNotSatisfiable)
			return
		}

		// Get the range
		ra := ranges[0]

		// Seek to start of range
		_, err = file.Seek(ra.start, io.SeekStart)
		if err != nil {
			http.Error(w, "Failed to seek file", http.StatusInternalServerError)
			return
		}

		// Set partial content headers
		w.Header().Set("Content-Range", fmt.Sprintf("bytes %d-%d/%d", ra.start, ra.end, fileInfo.Size()))
		w.Header().Set("Content-Length", strconv.FormatInt(ra.length, 10))
		w.WriteHeader(http.StatusPartialContent)

		// Send the range
		_, err = io.CopyN(w, file, ra.length)
		if err != nil {
			fmt.Printf("Error sending range: %v\n", err)
		}
		return
	}

	// Send the entire file
	w.WriteHeader(http.StatusOK)
	_, err = io.Copy(w, file)
	if err != nil {
		fmt.Printf("Error sending file: %v\n", err)
	}
}

// httpRange specifies the byte range to be sent to the client
type httpRange struct {
	start  int64
	end    int64
	length int64
}

// parseRange parses a Range header string as per RFC 7233
func parseRange(s string, size int64) ([]httpRange, error) {
	if !strings.HasPrefix(s, "bytes=") {
		return nil, fmt.Errorf("invalid range format")
	}

	var ranges []httpRange
	for _, ra := range strings.Split(strings.TrimPrefix(s, "bytes="), ",") {
		ra = strings.TrimSpace(ra)
		if ra == "" {
			continue
		}

		i := strings.Index(ra, "-")
		if i < 0 {
			return nil, fmt.Errorf("invalid range format")
		}

		start, end := strings.TrimSpace(ra[:i]), strings.TrimSpace(ra[i+1:])
		var r httpRange

		if start == "" {
			// suffix-length format "-N"
			n, err := strconv.ParseInt(end, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("invalid range format")
			}
			if n > size {
				n = size
			}
			r.start = size - n
			r.end = size - 1
		} else {
			// start-end format
			i, err := strconv.ParseInt(start, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("invalid range format")
			}
			if i >= size {
				return nil, fmt.Errorf("range out of bounds")
			}
			r.start = i
			if end == "" {
				// "N-" format means to end of file
				r.end = size - 1
			} else {
				i, err := strconv.ParseInt(end, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid range format")
				}
				if i >= size {
					i = size - 1
				}
				r.end = i
			}
		}
		r.length = r.end - r.start + 1
		if r.length < 0 {
			return nil, fmt.Errorf("invalid range")
		}
		ranges = append(ranges, r)
	}
	return ranges, nil
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Limit the request body size to avoid abuse
	r.Body = http.MaxBytesReader(w, r.Body, 10<<30) // 10GB max upload size

	contentType := r.Header.Get("Content-Type")
	filename := r.Header.Get("X-Filename")

	fmt.Printf("Received upload request - Content-Type: %s, X-Filename: %s\n", contentType, filename)

	// Get Content-Range header
	rangeHeader := r.Header.Get("Content-Range")
	var start, end, total int64
	var err error

	if rangeHeader != "" {
		// Parse Content-Range header (format: bytes start-end/total)
		parts := strings.Split(strings.Split(rangeHeader, " ")[1], "/")
		rangeVals := strings.Split(parts[0], "-")
		start, err = strconv.ParseInt(rangeVals[0], 10, 64)
		if err != nil {
			http.Error(w, "Invalid Content-Range header", http.StatusBadRequest)
			return
		}
		end, err = strconv.ParseInt(rangeVals[1], 10, 64)
		if err != nil {
			http.Error(w, "Invalid Content-Range header", http.StatusBadRequest)
			return
		}
		total, err = strconv.ParseInt(parts[1], 10, 64)
		if err != nil {
			http.Error(w, "Invalid Content-Range header", http.StatusBadRequest)
			return
		}
	}

	uploadsDir := "./uploads"
	tempDir := "./uploads/temp"
	os.MkdirAll(tempDir, os.ModePerm)
	os.MkdirAll(uploadsDir, os.ModePerm)

	if strings.HasPrefix(contentType, "multipart/form-data") {
		handleMultipartUpload(w, r, tempDir, uploadsDir)
		return
	}

	// Handle direct file upload (non-multipart)
	if filename == "" {
		// If no filename provided, generate one
		filename = fmt.Sprintf("upload_%d", time.Now().UnixNano())
	}

	fmt.Printf("Processing direct file upload for: %s\n", filename)

	tempPath := filepath.Join(tempDir, filename+".part")
	finalPath := filepath.Join(uploadsDir, filename)

	var dst *os.File
	var fileMode os.FileMode = 0666

	if start > 0 {
		// Append to existing file
		dst, err = os.OpenFile(tempPath, os.O_WRONLY|os.O_APPEND, fileMode)
		if err != nil {
			http.Error(w, "Failed to open temporary file: "+err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// Create new file
		dst, err = os.OpenFile(tempPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, fileMode)
		if err != nil {
			http.Error(w, "Failed to create temporary file: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}
	defer dst.Close()

	written, err := io.Copy(dst, r.Body)
	if err != nil {
		http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Check if this is the final chunk
	if end == total-1 || rangeHeader == "" {
		dst.Close()
		err = os.Rename(tempPath, finalPath)
		if err != nil {
			http.Error(w, "Failed to finalize file: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Upload completed successfully"))
	} else {
		// Partial upload
		w.Header().Set("Range", fmt.Sprintf("bytes=0-%d", start+written-1))
		w.WriteHeader(http.StatusPartialContent)
		w.Write([]byte("Chunk uploaded successfully"))
	}

	fmt.Printf("Processed %d bytes for file: %s\n", written, filename)
}

func handleMultipartUpload(w http.ResponseWriter, r *http.Request, tempDir, uploadsDir string) {
	mr, err := r.MultipartReader()
	if err != nil {
		fmt.Printf("Failed to create multipart reader: %v\n", err)
		http.Error(w, "Failed to create multipart reader: "+err.Error(), http.StatusBadRequest)
		return
	}

	for {
		part, err := mr.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			http.Error(w, "Error reading multipart: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if part.FileName() == "" {
			// This is a field, not a file
			fieldName := part.FormName()
			valueBytes, err := io.ReadAll(part)
			if err != nil {
				http.Error(w, "Failed to read form field: "+err.Error(), http.StatusInternalServerError)
				return
			}
			fmt.Printf("Received field: %s = %s\n", fieldName, string(valueBytes))
			continue
		}

		filename := filepath.Base(part.FileName())
		tempPath := filepath.Join(tempDir, filename+".part")
		finalPath := filepath.Join(uploadsDir, filename)

		dst, err := os.Create(tempPath)
		if err != nil {
			http.Error(w, "Failed to create temporary file: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		written, err := io.Copy(dst, part)
		if err != nil {
			http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
			return
		}

		dst.Close()
		err = os.Rename(tempPath, finalPath)
		if err != nil {
			http.Error(w, "Failed to finalize file: "+err.Error(), http.StatusInternalServerError)
			return
		}

		fmt.Printf("Uploaded file: %s (%d bytes)\n", filename, written)
	}

	w.Write([]byte("Upload successful!"))
}
