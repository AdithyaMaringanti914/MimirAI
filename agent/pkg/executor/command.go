package executor

import (
	"context"
	"os/exec"
	"time"
)

func ExecuteShellCommand(cmdStr string, args []string, timeoutMs int) (string, error) {
	var ctx context.Context
	var cancel context.CancelFunc

	if timeoutMs > 0 {
		ctx, cancel = context.WithTimeout(context.Background(), time.Duration(timeoutMs)*time.Millisecond)
	} else {
		ctx, cancel = context.WithCancel(context.Background())
	}
	defer cancel()

	cmd := exec.CommandContext(ctx, cmdStr, args...)
	out, err := cmd.CombinedOutput()

	return string(out), err
}
