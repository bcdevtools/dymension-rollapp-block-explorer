package utils

import (
	"regexp"
	"strings"
)

func NormalizeChainId(chainId string) string {
	return strings.ToLower(strings.TrimSpace(chainId))
}

func NormalizeAddress(addr string) string {
	return strings.ToLower(strings.TrimSpace(addr))
}

func UnsafeExtractBech32Hrp(bech32Addr string) (hrp string, success bool) {
	parts := strings.Split(bech32Addr, "1")
	if len(parts) != 2 {
		return "", false
	}
	return parts[0], parts[0] != "" && len(parts[1]) >= 7
}

var regexpEvmContractAddress = regexp.MustCompile(`^0x[\da-fA-F]{40}$`)

func IsEvmContractAddress(addr string) bool {
	return regexpEvmContractAddress.MatchString(NormalizeAddress(addr))
}
