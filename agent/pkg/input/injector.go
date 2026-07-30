package input

import (
	"fmt"
	"syscall"
	"unsafe"
)

var (
	user32               = syscall.NewLazyDLL("user32.dll")
	procSendInput        = user32.NewProc("SendInput")
	procSetCursorPos     = user32.NewProc("SetCursorPos")
	procGetSystemMetrics = user32.NewProc("GetSystemMetrics")
)

const (
	INPUT_MOUSE    = 0
	INPUT_KEYBOARD = 1
	INPUT_HARDWARE = 2

	MOUSEEVENTF_MOVE       = 0x0001
	MOUSEEVENTF_LEFTDOWN   = 0x0002
	MOUSEEVENTF_LEFTUP     = 0x0004
	MOUSEEVENTF_RIGHTDOWN  = 0x0008
	MOUSEEVENTF_RIGHTUP    = 0x0010
	MOUSEEVENTF_MIDDLEDOWN = 0x0020
	MOUSEEVENTF_MIDDLEUP   = 0x0040
	MOUSEEVENTF_WHEEL      = 0x0800
	MOUSEEVENTF_HWHEEL     = 0x1000
	MOUSEEVENTF_ABSOLUTE   = 0x8000
)

type MOUSEINPUT struct {
	Dx          int32
	Dy          int32
	MouseData   uint32
	DwFlags     uint32
	Time        uint32
	DwExtraInfo uintptr
}

type INPUT struct {
	Type uint32
	Mi   MOUSEINPUT
	// Padding for 64-bit to match C struct size
	Padding [8]byte
}

func MoveMouse(x, y int) error {
	ret, _, err := procSetCursorPos.Call(uintptr(x), uintptr(y))
	if ret == 0 {
		return fmt.Errorf("failed to set cursor pos: %v", err)
	}
	return nil
}

func ClickMouse(button string, down bool) error {
	var flag uint32
	switch button {
	case "left":
		if down {
			flag = MOUSEEVENTF_LEFTDOWN
		} else {
			flag = MOUSEEVENTF_LEFTUP
		}
	case "right":
		if down {
			flag = MOUSEEVENTF_RIGHTDOWN
		} else {
			flag = MOUSEEVENTF_RIGHTUP
		}
	case "middle":
		if down {
			flag = MOUSEEVENTF_MIDDLEDOWN
		} else {
			flag = MOUSEEVENTF_MIDDLEUP
		}
	default:
		return fmt.Errorf("unknown mouse button: %s", button)
	}

	input := INPUT{
		Type: INPUT_MOUSE,
		Mi: MOUSEINPUT{
			DwFlags: flag,
		},
	}

	ret, _, err := procSendInput.Call(
		1,
		uintptr(unsafe.Pointer(&input)),
		unsafe.Sizeof(input),
	)
	if ret == 0 {
		return fmt.Errorf("failed to send mouse input: %v", err)
	}
	return nil
}
