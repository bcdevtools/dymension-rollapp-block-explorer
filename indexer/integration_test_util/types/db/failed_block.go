package db

type FailedBlockRecord struct {
	ChainId        string
	Height         int64
	RetryCount     int16
	LastRetryEpoch int64
	ErrorMessages  []string
}
