package types

import "fmt"

type IndexingMode int8

const (
	IndexingModeNewBlocks IndexingMode = iota
	IndexingModeRetryFailedBlocks
)

func (m IndexingMode) String() string {
	switch m {
	case IndexingModeNewBlocks:
		return "new_blocks"
	case IndexingModeRetryFailedBlocks:
		return "retry_failed_blocks"
	default:
		return fmt.Sprintf("unknown %d", m)
	}
}
