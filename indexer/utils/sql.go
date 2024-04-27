package utils

import (
	"fmt"
	"regexp"
)

// GetPartitionedTableNameByChainId returns the partitioned table name of the given table for the corresponding chain id.
// NOTICE: the implementation have to be safe from SQL injection.
func GetPartitionedTableNameByChainId(tableName, chainId string) string {
	escapedChainId := regexp.MustCompile(`\W`).ReplaceAllString(chainId, "__")
	return fmt.Sprintf("%s_%s", tableName, escapedChainId)
}

// GetPartitionedTableNameBySaltInt64AndChainId returns the partitioned table name of the given table for the corresponding chain id with salt int64.
// NOTICE: the implementation have to be safe from SQL injection.
func GetPartitionedTableNameBySaltInt64AndChainId(tableName string, salt int64, chainId string) string {
	escapedChainId := regexp.MustCompile(`\W`).ReplaceAllString(chainId, "__")
	return fmt.Sprintf("%s_%d_%s", tableName, salt, escapedChainId)
}
