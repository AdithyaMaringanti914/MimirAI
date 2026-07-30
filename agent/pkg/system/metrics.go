package system

import (
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
)

type Metrics struct {
	CPUUsagePercent float64 `json:"cpuUsagePercent"`
	MemoryTotal     uint64  `json:"memoryTotal"`
	MemoryUsed      uint64  `json:"memoryUsed"`
	MemoryPercent   float64 `json:"memoryPercent"`
}

func GetMetrics() (*Metrics, error) {
	percentages, err := cpu.Percent(0, false)
	if err != nil {
		return nil, err
	}

	vm, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	cpuPercent := 0.0
	if len(percentages) > 0 {
		cpuPercent = percentages[0]
	}

	return &Metrics{
		CPUUsagePercent: cpuPercent,
		MemoryTotal:     vm.Total,
		MemoryUsed:      vm.Used,
		MemoryPercent:   vm.UsedPercent,
	}, nil
}
