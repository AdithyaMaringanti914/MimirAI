package main

import (
	"bufio"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"time"

	"mimir-agent/pkg/api"
	"mimir-agent/pkg/capture"
	"mimir-agent/pkg/executor"
	"mimir-agent/pkg/input"
	"mimir-agent/pkg/system"
	"mimir-agent/pkg/transport"
)

func main() {
	url := "ws://localhost:3000" // Connect to root socket.io, namespace handled internally
	token := "AGENT_SECRET_TOKEN"

	log.Println("Starting Mimir Native Agent...")

	// Start WebSocket Server for Perception OS
	go func() {
		http.HandleFunc("/ws", api.ServeWS)
		log.Println("[Agent] WebSocket server listening on :4000")
		if err := http.ListenAndServe(":4000", nil); err != nil {
			log.Fatalf("WebSocket Server failed: %v", err)
		}
	}()

	// Start C# UIAMonitor
	go startUIAMonitor()

	client := transport.NewWSClient(url, token)
	client.OnMsg = func(msg []byte) {
		var req transport.CommandRequest
		if err := json.Unmarshal(msg, &req); err != nil {
			log.Println("Invalid command request:", err)
			return
		}

		handleCommand(client, req)
	}

	for {
		log.Println("Connecting to", url)
		if err := client.Connect(); err != nil {
			log.Println("Connection failed:", err, "Retrying in 5s...")
			time.Sleep(5 * time.Second)
			continue
		}
		log.Println("Connected to Backend!")
		break
	}

	// Wait for interrupt
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c
	log.Println("Shutting down Agent...")
}

func handleCommand(client *transport.WSClient, req transport.CommandRequest) {
	resp := transport.CommandResponse{
		SessionID: req.SessionID,
		CommandID: req.CommandID,
		Success:   true,
	}

	switch req.Type {
	case "execute":
		var payload transport.ExecutePayload
		json.Unmarshal(req.Payload, &payload)
		out, err := executor.ExecuteShellCommand(payload.Command, payload.Args, payload.Timeout)
		if err != nil {
			resp.Success = false
			resp.Error = err.Error()
		}
		data, _ := json.Marshal(map[string]string{"output": out})
		resp.Data = data

	case "metrics":
		metrics, err := system.GetMetrics()
		if err != nil {
			resp.Success = false
			resp.Error = err.Error()
		} else {
			data, _ := json.Marshal(metrics)
			resp.Data = data
		}

	case "mouse.move":
		var payload transport.MousePayload
		json.Unmarshal(req.Payload, &payload)
		if err := input.MoveMouse(payload.X, payload.Y); err != nil {
			resp.Success = false
			resp.Error = err.Error()
		}

	case "mouse.down", "mouse.up":
		var payload transport.MousePayload
		json.Unmarshal(req.Payload, &payload)
		down := req.Type == "mouse.down"
		if err := input.ClickMouse(payload.Button, down); err != nil {
			resp.Success = false
			resp.Error = err.Error()
		}

	case "capture":
		b64, err := capture.CaptureScreen()
		windows, _ := system.EnumerateWindows()
		uiaRaw, _ := system.DumpUIATree()

		if err != nil {
			resp.Success = false
			resp.Error = err.Error()
		} else {
			// uiaRaw is already a JSON string, we can inject it or parse it.
			// Let's pass it as a raw string so we don't double serialize
			payload := map[string]interface{}{
				"image":   b64,
				"windows": windows,
				"uiaRaw":  uiaRaw,
			}
			data, _ := json.Marshal(payload)
			resp.Data = data
		}

	default:
		resp.Success = false
		resp.Error = "Unknown command type: " + req.Type
	}

	client.SendResponse(resp)
}

func startUIAMonitor() {
	monitorPath, err := filepath.Abs("cmd/uia-monitor/UIAMonitor.exe")
	if err != nil {
		log.Println("[UIAMonitor] Path error:", err)
		return
	}

	cmd := exec.Command(monitorPath)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Println("[UIAMonitor] StdoutPipe error:", err)
		return
	}

	if err := cmd.Start(); err != nil {
		log.Println("[UIAMonitor] Start error:", err)
		return
	}

	log.Println("[UIAMonitor] Started successfully")

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		line := scanner.Bytes()
		// log.Println("[UIAMonitor] Event:", string(line))
		api.BroadcastEvent(line)
	}

	if err := cmd.Wait(); err != nil {
		log.Println("[UIAMonitor] Exited with error:", err)
	}
}
