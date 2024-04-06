package utils

func RandomBlockHeight() int64 {
	return RandomPositiveInt64()%10_000 + 100
}
