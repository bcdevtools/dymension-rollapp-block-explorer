package query

import (
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
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

		if tryCount < retryOption[0].MinRetryCount {
			continue
		}

		if time.Since(startTime) < retryOption[0].MaximumRetryDuration {
			continue
		}

		break
	}

	err = firstErr
	return
}
