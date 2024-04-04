package utils

import (
	"fmt"
	"github.com/EscanBE/go-lib/logging"
	logtypes "github.com/EscanBE/go-lib/logging/types"
	"github.com/stretchr/testify/require"
	"strings"
	"testing"
	"time"
)

var _ logging.Logger = &wlLogger{}

type wlLogger struct {
	callback func(string)
}

func (w *wlLogger) SetLogLevel(_ string) error {
	panic("implement me")
}

func (w *wlLogger) SetLogFormat(_ string) error {
	panic("implement me")
}

func (w *wlLogger) Info(msg string, _ ...interface{}) {
	w.callback(msg)
}

func (w *wlLogger) Debug(msg string, _ ...interface{}) {
	w.callback(msg)
}

func (w *wlLogger) Error(_ string, _ ...interface{}) {
	panic("implement me")
}

func (w *wlLogger) ApplyConfig(_ logtypes.LoggingConfig) error {
	panic("implement me")
}

func TestObserveLongOperation(t *testing.T) {
	type firstResultType int8
	const typeAction firstResultType = 1
	const typeLog firstResultType = 2

	tests := []struct {
		name          string
		actionSleep   time.Duration
		warningAfter  time.Duration
		wantFirstDone firstResultType
		wantWarnState bool
	}{
		{
			name:          "short action",
			actionSleep:   time.Second,
			warningAfter:  2 * time.Second,
			wantFirstDone: typeAction,
			wantWarnState: false,
		},
		{
			name:          "long action",
			actionSleep:   2 * time.Second,
			warningAfter:  time.Second,
			wantFirstDone: typeLog,
			wantWarnState: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			type state struct {
				logDone   bool
				warnState bool
				firstDone firstResultType
			}

			st := &state{}

			err := ObserveLongOperation(
				fmt.Sprintf("test %s", tt.name),
				func() error {
					time.Sleep(tt.actionSleep)
					if st.firstDone == 0 {
						st.firstDone = typeAction
					}
					return nil
				},
				tt.warningAfter,
				&wlLogger{
					callback: func(msg string) {
						st.warnState = strings.Contains(msg, "WARN:")
						if st.firstDone == 0 {
							st.firstDone = typeLog
						}
						st.logDone = true
					},
				},
			)
			require.NoError(t, err)
			for !st.logDone {
				time.Sleep(100 * time.Millisecond)
			}
			require.Equal(t, tt.wantFirstDone, st.firstDone, "first done")
			require.Equal(t, tt.wantWarnState, st.warnState, "warn state")
		})
	}
}
