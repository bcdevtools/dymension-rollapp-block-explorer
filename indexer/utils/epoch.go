package utils

import "time"

func GetEpochWeek(optionalEpochUtcSeconds int64) int64 {
	var epochUtcSeconds int64
	if optionalEpochUtcSeconds == 0 {
		epochUtcSeconds = time.Now().UTC().Unix()
	} else {
		epochUtcSeconds = optionalEpochUtcSeconds
	}
	return epochUtcSeconds / (86400 * 7)
}
