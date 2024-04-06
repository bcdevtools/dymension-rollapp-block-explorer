package utils

import "strings"

func NormalizeChainId(chainId string) string {
	return strings.ToLower(strings.TrimSpace(chainId))
}

func NormalizeAddress(addr string) string {
	return strings.ToLower(strings.TrimSpace(addr))
}
