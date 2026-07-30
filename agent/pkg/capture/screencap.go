package capture

import (
	"bytes"
	"encoding/base64"
	"image/jpeg"
	"github.com/kbinani/screenshot"
)

// CaptureScreen takes a screenshot of the primary display and returns it as a base64 encoded JPEG string.
func CaptureScreen() (string, error) {
	bounds := screenshot.GetDisplayBounds(0) // Monitor 0

	img, err := screenshot.CaptureRect(bounds)
	if err != nil {
		return "", err
	}

	// Encode to JPEG to save bandwidth vs PNG
	var buf bytes.Buffer
	err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: 60})
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}
