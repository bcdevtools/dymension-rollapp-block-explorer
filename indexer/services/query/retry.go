package query

import (
	"fmt"
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

		fmt.Println("==== Before f(qSvc)")
		res, duration, err = f(qSvc)
		fmt.Println("==== After f(qSvc)")
		if err == nil {
			fmt.Println("==== Return success f(qSvc)")
			return
		}

		if firstErr == nil {
			firstErr = err
		}

		errMsg := err.Error()
		if strings.Contains(errMsg, "connection refused") {
			fmt.Println("==== Break 1")
			break
		} else if strings.Contains(errMsg, "-32601") && strings.Contains(errMsg, "not available") {
			fmt.Println("==== Break 2")
			break
		} else if strings.Contains(errMsg, "-32602") /*invalid params*/ {
			fmt.Println("==== Break 3")
			break
		}

		if tryCount < minRetryCount {
			fmt.Printf("==== Continue %d/%d\n", tryCount, minRetryCount)
			continue
		}

		if time.Since(startTime) < maximumRetryDuration {
			fmt.Println("==== Continue by time")
			continue
		}

		fmt.Println("==== Break 4")
		break
	}

	fmt.Println("==== Final returns")
	err = firstErr
	return
}
