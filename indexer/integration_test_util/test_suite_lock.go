package integration_test_util

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"testing"
	"time"
)

// AcquireMultiTestSuitesLock prevents multiple test suites from running at the same time.
// It returns a function that must be called at the end of the test suite to release the lock.
//
// Use case: generally used when multiple test suites are running in parallel
// and accessing the same resources that couldn't be shared.
// So we need this test suite lock to prevent multiple test suites from running at the same time.
func AcquireMultiTestSuitesLock(t *testing.T) (releaser func()) {
	const port = 10306
	const timeoutAcquire = 5 * time.Minute
	httpServerExitDone := &sync.WaitGroup{}
	chanStartServerSignal := make(chan interface{})

	type serverSignalWaitingLock struct{}
	type serverFailedToStartError error

	startHttpServer := func() *http.Server {
		srv := &http.Server{Addr: fmt.Sprintf(":%d", port)}

		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

		go func() {
			defer httpServerExitDone.Done() // let main know we are done setting up

			startTime := time.Now().UTC()
			for {
				// returns error when server is stopped or closed
				if err := srv.ListenAndServe(); err != nil {
					if strings.Contains(err.Error(), "already in use") {
						if time.Now().UTC().Sub(startTime) < timeoutAcquire {
							time.Sleep(100 * time.Millisecond)
							chanStartServerSignal <- serverSignalWaitingLock{}
							continue
						}

						chanStartServerSignal <- serverFailedToStartError(err)
					} else if err != http.ErrServerClosed {
						chanStartServerSignal <- serverFailedToStartError(err)
					}

					break
				}
			}
		}()

		// returning reference so caller can call Shutdown()
		return srv
	}

	httpServerExitDone.Add(1)

	srv := startHttpServer()

	for {
		select {
		case signal := <-chanStartServerSignal:
			if _, isWaitingLock := signal.(serverSignalWaitingLock); isWaitingLock {
				continue
			} else if err, isError := signal.(serverFailedToStartError); isError {
				t.Logf("failed to acquire lock by reserve HTTP port with error: %v", error(err))
				t.FailNow()
				return func() {
					// no-op
				}
			} else {
				panic(fmt.Sprintf("un-expected signal %v", signal))
			}
		case <-time.After(1 * time.Second):
			fmt.Println("Acquired multi test suites lock!")
			break
		}
		break
	}

	return func() {
		// now close the server gracefully ("shutdown")
		// timeout could be given with a proper context
		if err := srv.Shutdown(context.Background()); err != nil {
			panic(err) // failure/timeout shutting down the server gracefully
		}

		// wait for goroutine started in startHttpServer() to stop
		httpServerExitDone.Wait()
	}
}
