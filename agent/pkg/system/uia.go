package system

import (
	"bytes"
	"os/exec"
	"path/filepath"
)

// DumpUIATree executes the PowerShell script to extract the UIA tree.
func DumpUIATree() (string, error) {
	scriptPath, err := filepath.Abs("scripts/Get-UIATree.ps1")
	if err != nil {
		return "", err
	}

	cmd := exec.Command("powershell", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", scriptPath)
	var out bytes.Buffer
	cmd.Stdout = &out

	err = cmd.Run()
	if err != nil {
		return "", err
	}

	return out.String(), nil
}
