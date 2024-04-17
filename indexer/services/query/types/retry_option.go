package types

import "time"

type RetryOption struct {
	MinRetryCount        int
	MaximumRetryDuration time.Duration
}

func DefaultRetryOption() RetryOption {
	return RetryOption{
		MinRetryCount:        3,
		MaximumRetryDuration: 5 * time.Second,
	}
}

func (m RetryOption) MinCount(minRetryCount int) RetryOption {
	m.MinRetryCount = minRetryCount
	return m
}

func (m RetryOption) MaxDuration(maximumRetryDuration time.Duration) RetryOption {
	m.MaximumRetryDuration = maximumRetryDuration
	return m
}
