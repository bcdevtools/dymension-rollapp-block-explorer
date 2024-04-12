package utils

import (
	"math/rand"
)

// RandomPositiveInt64 returns a random int64, value >= 0.
func RandomPositiveInt64() int64 {
	val := rand.Int63()
	if val < 0 {
		val = -val
	}
	return val
}
