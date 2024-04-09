package utils

import (
	"fmt"
	"github.com/EscanBE/go-lib/logging"
	"sync"
	"time"
)

// ObserveLongOperation is a utility function that observes a long operation and logs a warning if it takes too long.
// TODO: use ObserveLongOperation when creating table partitions
func ObserveLongOperation(
	actionName string, action func() error,
	warningAfter time.Duration, logger logging.Logger,
) error {
	locker := &sync.Mutex{}
	locker.Lock()

	go func() {
		time.Sleep(warningAfter)

		if locker.TryLock() {
			locker.Unlock() // release it due to try lock did a successfully locks
			logger.Debug(fmt.Sprintf("action [%s] executed gracefully with a short time", actionName), "threshold", warningAfter)
			return
		}

		logger.Info(fmt.Sprintf("WARN: action [%s] took too long to complete", actionName), "threshold", warningAfter)
	}()

	err := action()
	locker.Unlock()
	return err
}
