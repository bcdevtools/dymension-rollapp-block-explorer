package query

import (
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"strings"
	"time"
)

var defaultRetryOption = querytypes.DefaultRetryOption()

func BeJsonRpcQueryWithRetry[T any](
	qSvc BeJsonRpcQueryService,
	f func(BeJsonRpcQueryService) (T, time.Duration, error),
	retryOption ...querytypes.RetryOption,
) (res T, duration time.Duration, err error) {
	startTime := time.Now().UTC()
	tryCount := -1

	if len(retryOption) == 0 {
		retryOption = []querytypes.RetryOption{defaultRetryOption}
	}

	minRetryCount := retryOption[0].MinRetryCount
	maximumRetryDuration := retryOption[0].MaximumRetryDuration

	var firstErr error
	for {
		tryCount++

		if tryCount > 0 {
			time.Sleep(100 * time.Millisecond)
		}

		res, duration, err = f(qSvc)
		if err == nil {
			return
		}

		if firstErr == nil {
			firstErr = err
		}

		if querytypes.IsErrResponseValidationFailed(err) {
			break
		}

		errMsg := err.Error()
		if strings.Contains(errMsg, "connection refused") {
			break
		} else if strings.Contains(errMsg, "-32601") && strings.Contains(errMsg, "not available") {
			break
		} else if strings.Contains(errMsg, "-32602") /*invalid params*/ {
			break
		}

		if tryCount < minRetryCount {
			continue
		}

		if time.Since(startTime) < maximumRetryDuration {
			continue
		}

		break
	}

	err = firstErr
	return
}
