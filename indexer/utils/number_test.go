package utils

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestGetClosesRange(t *testing.T) {
	tests := []struct {
		name           string
		fromNumber     int64
		toNumber       int64
		excludeNumbers []int64
		wantHasResult  bool
		wantFrom       int64
		wantTo         int64
		wantPanic      bool
	}{
		{
			name:           "normal",
			fromNumber:     1,
			toNumber:       15,
			excludeNumbers: []int64{4, 5, 6, 7, 8, 9, 10, 11},
			wantHasResult:  true,
			wantFrom:       1,
			wantTo:         3,
		},
		{
			name:           "normal, un-ordered exclude, not sorted",
			fromNumber:     1,
			toNumber:       15,
			excludeNumbers: []int64{4, 5, 11, 7, 8, 9, 11, 10, 6},
			wantHasResult:  true,
			wantFrom:       1,
			wantTo:         3,
		},
		{
			name:          "normal, no exclude",
			fromNumber:    2,
			toNumber:      15,
			wantHasResult: true,
			wantFrom:      2,
			wantTo:        15,
		},
		{
			name:       "from must >= to",
			fromNumber: 15,
			toNumber:   2,
			wantPanic:  true,
		},
		{
			name:       "from < 1",
			fromNumber: 0,
			toNumber:   2,
			wantPanic:  true,
		},
		{
			name:       "to < 1",
			fromNumber: 0,
			toNumber:   0,
			wantPanic:  true,
		},
		{
			name:           "normal, having head and tail space",
			fromNumber:     1,
			toNumber:       15,
			excludeNumbers: []int64{4, 5, 6, 7, 8, 9, 10, 11},
			wantHasResult:  true,
			wantFrom:       1,
			wantTo:         3,
		},
		{
			name:           "normal, having head space only",
			fromNumber:     1,
			toNumber:       11,
			excludeNumbers: []int64{4, 5, 6, 7, 8, 9, 10, 11},
			wantHasResult:  true,
			wantFrom:       1,
			wantTo:         3,
		},
		{
			name:           "normal, having tail space only",
			fromNumber:     4,
			toNumber:       15,
			excludeNumbers: []int64{4, 5, 6, 7, 8, 9, 10, 11},
			wantHasResult:  true,
			wantFrom:       12,
			wantTo:         15,
		},
		{
			name:           "normal, in the middle",
			fromNumber:     4,
			toNumber:       11,
			excludeNumbers: []int64{4, 5, 9, 10, 11},
			wantHasResult:  true,
			wantFrom:       6,
			wantTo:         8,
		},
		{
			name:           "normal, in the middle, multiple",
			fromNumber:     4,
			toNumber:       14,
			excludeNumbers: []int64{4, 5, 9, 10, 12, 13, 14},
			wantHasResult:  true,
			wantFrom:       6,
			wantTo:         8,
		},
		{
			name:           "normal, in the middle, multiple",
			fromNumber:     4,
			toNumber:       14,
			excludeNumbers: []int64{4, 5, 6, 7, 8, 9, 10, 12, 14},
			wantHasResult:  true,
			wantFrom:       11,
			wantTo:         11,
		},
		{
			name:           "normal, collide head",
			fromNumber:     1,
			toNumber:       4,
			excludeNumbers: []int64{4, 5, 6, 7, 8, 9, 10, 11},
			wantHasResult:  true,
			wantFrom:       1,
			wantTo:         3,
		},
		{
			name:           "normal, collide tail",
			fromNumber:     10,
			toNumber:       14,
			excludeNumbers: []int64{4, 5, 6, 7, 8, 9, 10, 11},
			wantHasResult:  true,
			wantFrom:       12,
			wantTo:         14,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.wantPanic {
				require.Panics(t, func() {
					_, _, _ = GetClosesRange(tt.fromNumber, tt.toNumber, tt.excludeNumbers)
				})
				return
			}

			gotHasResult, gotFrom, gotTo := GetClosesRange(tt.fromNumber, tt.toNumber, tt.excludeNumbers)
			require.Equal(t, tt.wantHasResult, gotHasResult)
			require.Equal(t, tt.wantFrom, gotFrom)
			require.Equal(t, tt.wantTo, gotTo)
		})
	}
}
