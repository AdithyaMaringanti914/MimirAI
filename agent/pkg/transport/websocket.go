package transport

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type WSClient struct {
	URL      string
	Token    string
	Conn     *websocket.Conn
	OnMsg    func(msg []byte)
}

func NewWSClient(url, token string) *WSClient {
	return &WSClient{
		URL:   url,
		Token: token,
	}
}

func (c *WSClient) Connect() error {
	headers := http.Header{}
	headers.Add("Authorization", "Bearer "+c.Token)
	headers.Add("X-Agent-Client", "mimir-desktop")

	// Must append /socket.io/?EIO=4&transport=websocket to bypass engine.io polling
	dialUrl := c.URL + "/socket.io/?EIO=4&transport=websocket"

	conn, _, err := websocket.DefaultDialer.Dial(dialUrl, headers)
	if err != nil {
		return err
	}
	c.Conn = conn

	// Send Socket.IO connect packet to the namespace
	c.Conn.WriteMessage(websocket.TextMessage, []byte("40/native-agent,"))

	go c.listen()
	return nil
}

func (c *WSClient) listen() {
	defer c.Conn.Close()
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("WS Read Error:", err)
			break
		}
		
		msgStr := string(message)
		// Respond to Engine.IO ping (2) with pong (3)
		if msgStr == "2" {
			c.Conn.WriteMessage(websocket.TextMessage, []byte("3"))
			continue
		}

		// Look for Socket.IO event in namespace: 42/native-agent,["agent:command", "..."]
		prefix := "42/native-agent,[\"agent:command\","
		if len(msgStr) > len(prefix) && msgStr[:len(prefix)] == prefix {
			// Extract the JSON payload
			jsonPayload := msgStr[len(prefix) : len(msgStr)-1] // remove trailing ]
			
			// We have a stringified string for packet usually, so let's unescape it
			var packetStr string
			if err := json.Unmarshal([]byte(jsonPayload), &packetStr); err != nil {
				log.Println("Failed to unmarshal packet string:", err)
				continue
			}

			if c.OnMsg != nil {
				c.OnMsg([]byte(packetStr))
			}
		}
	}
}

func (c *WSClient) SendResponse(resp CommandResponse) error {

	// Format as Socket.IO event: 42/native-agent,["agent:response", {...}]
	out, _ := json.Marshal([]interface{}{"agent:response", resp})
	finalMsg := "42/native-agent," + string(out)
	
	return c.Conn.WriteMessage(websocket.TextMessage, []byte(finalMsg))
}
