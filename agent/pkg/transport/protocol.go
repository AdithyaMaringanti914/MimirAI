package transport

import "encoding/json"

type CommandRequest struct {
	SessionID string          `json:"sessionId"`
	CommandID string          `json:"commandId"`
	Type      string          `json:"type"` // "execute", "mouse.move", "metrics", etc.
	Payload   json.RawMessage `json:"payload"`
}

type CommandResponse struct {
	SessionID string          `json:"sessionId"`
	CommandID string          `json:"commandId"`
	Success   bool            `json:"success"`
	Data      json.RawMessage `json:"data,omitempty"`
	Error     string          `json:"error,omitempty"`
}

type MousePayload struct {
	X      int    `json:"x"`
	Y      int    `json:"y"`
	Button string `json:"button,omitempty"` // "left", "right", "middle"
	DeltaX int    `json:"deltaX,omitempty"`
	DeltaY int    `json:"deltaY,omitempty"`
}

type KeyboardPayload struct {
	Key       string `json:"key"`
	Code      string `json:"code"`
	ShiftKey  bool   `json:"shiftKey"`
	CtrlKey   bool   `json:"ctrlKey"`
	AltKey    bool   `json:"altKey"`
	MetaKey   bool   `json:"metaKey"`
}

type ExecutePayload struct {
	Command string   `json:"command"`
	Args    []string `json:"args"`
	Timeout int      `json:"timeout,omitempty"` // in ms
}
