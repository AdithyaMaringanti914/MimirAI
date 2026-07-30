package api

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow cross-origin for local dev
	},
}

var clients = make(map[*websocket.Conn]bool)
var clientsMutex sync.Mutex

func ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("[WebSocket] Upgrade error:", err)
		return
	}
	
	clientsMutex.Lock()
	clients[conn] = true
	clientsMutex.Unlock()
	
	log.Println("[WebSocket] Client connected")

	// Wait for connection to close
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			clientsMutex.Lock()
			delete(clients, conn)
			clientsMutex.Unlock()
			conn.Close()
			log.Println("[WebSocket] Client disconnected")
			break
		}
	}
}

// BroadcastEvent sends a JSON payload to all connected clients
func BroadcastEvent(event []byte) {
	clientsMutex.Lock()
	defer clientsMutex.Unlock()

	for client := range clients {
		err := client.WriteMessage(websocket.TextMessage, event)
		if err != nil {
			log.Println("[WebSocket] Write error:", err)
			client.Close()
			delete(clients, client)
		}
	}
}
