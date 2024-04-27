package utils

import (
	"fmt"
	"regexp"
	"strings"
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

// MakePartitionIdFromKeys builds a partition id from the given keys.
func MakePartitionIdFromKeys(keys ...any) string {
	if len(keys) == 0 {
		panic("no keys")
	}

	var sb strings.Builder
	for i, key := range keys {
		if key == nil {
			panic(fmt.Sprintf("key[%d] is nil", i))
		}
		str := strings.TrimSpace(fmt.Sprintf("%v", key))
		if str == "" {
			panic(fmt.Sprintf("key[%d] is empty", i))
		}

		if i > 0 {
			sb.WriteString(" ")
		}
		sb.WriteString(str)
	}

	return sb.String()
}
