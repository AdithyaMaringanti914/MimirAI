package system

import (
	"syscall"
	"unsafe"
)

var (
	user32               = syscall.NewLazyDLL("user32.dll")
	procEnumWindows      = user32.NewProc("EnumWindows")
	procGetWindowTextW   = user32.NewProc("GetWindowTextW")
	procGetClassNameW    = user32.NewProc("GetClassNameW")
	procGetWindowRect    = user32.NewProc("GetWindowRect")
	procIsWindowVisible  = user32.NewProc("IsWindowVisible")
	procGetWindowLongW   = user32.NewProc("GetWindowLongW")
	procGetDpiForWindow  = user32.NewProc("GetDpiForWindow")
)

const (
	GWL_STYLE = -16
	WS_MINIMIZE = 0x20000000
	WS_MAXIMIZE = 0x01000000
)

type WindowInfo struct {
	Title       string `json:"title"`
	ClassName   string `json:"className"`
	Bounds      Rect   `json:"bounds"`
	IsVisible   bool   `json:"isVisible"`
	ZOrder      int    `json:"zOrder"`
	DpiScaling  int    `json:"dpiScaling"`
	WindowState string `json:"windowState"`
}

type Rect struct {
	X      int32 `json:"x"`
	Y      int32 `json:"y"`
	Width  int32 `json:"width"`
	Height int32 `json:"height"`
}

type winRect struct {
	Left   int32
	Top    int32
	Right  int32
	Bottom int32
}

func EnumerateWindows() ([]WindowInfo, error) {
	var windows []WindowInfo
	zOrder := 0

	cb := syscall.NewCallback(func(hwnd syscall.Handle, lParam uintptr) uintptr {
		ret, _, _ := procIsWindowVisible.Call(uintptr(hwnd))
		if ret != 0 {
			// Get Title
			b := make([]uint16, 255)
			procGetWindowTextW.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&b[0])), 255)
			title := syscall.UTF16ToString(b)

			// Get Class
			c := make([]uint16, 255)
			procGetClassNameW.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&c[0])), 255)
			className := syscall.UTF16ToString(c)

			// Get Bounds
			var rect winRect
			procGetWindowRect.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&rect)))
			
			// Get DPI
			dpi, _, _ := procGetDpiForWindow.Call(uintptr(hwnd))
			if dpi == 0 {
				dpi = 96 // Default DPI
			}

			// Get State
			gwlStyle := int32(GWL_STYLE)
			style, _, _ := procGetWindowLongW.Call(uintptr(hwnd), uintptr(gwlStyle))
			state := "Normal"
			if style&WS_MINIMIZE != 0 {
				state = "Minimized"
			} else if style&WS_MAXIMIZE != 0 {
				state = "Maximized"
			}

			if title != "" {
				windows = append(windows, WindowInfo{
					Title:     title,
					ClassName: className,
					Bounds: Rect{
						X:      rect.Left,
						Y:      rect.Top,
						Width:  rect.Right - rect.Left,
						Height: rect.Bottom - rect.Top,
					},
					IsVisible:   true,
					ZOrder:      zOrder,
					DpiScaling:  int(dpi),
					WindowState: state,
				})
				zOrder++
			}
		}
		return 1 // Continue enumeration
	})

	procEnumWindows.Call(cb, 0)
	return windows, nil
}
