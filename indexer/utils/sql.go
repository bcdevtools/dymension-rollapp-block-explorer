package utils

import (
	"fmt"
	"regexp"
)

// GetPartitionedTableNameByChainId returns the partitioned table name of the given table for the corresponding chain id.
func GetPartitionedTableNameByChainId(tableName, chainId string) string {
	escapedChainId := regexp.MustCompile(`\W`).ReplaceAllString(chainId, "__")
	return fmt.Sprintf("%s_%s", tableName, escapedChainId)
}
