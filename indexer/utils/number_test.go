package utils

import (
	"github.com/stretchr/testify/require"
	"testing"
)

var testcasesGetClosesRange = []struct {
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
	{
		name:           "totally excluded",
		fromNumber:     5,
		toNumber:       9,
		excludeNumbers: []int64{4, 5, 6, 7, 8, 9, 10, 11},
		wantHasResult:  false,
	},
}

func TestGetClosesRange(t *testing.T) {
	for _, tt := range testcasesGetClosesRange {
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

func TestGetClosesRangeWithExtensible(t *testing.T) {
	for _, tt := range testcasesGetClosesRange {
		t.Run(tt.name, func(t *testing.T) {
			funcGetExcludeNumbers := func(_ int64, _ int64) ([]int64, error) {
				return tt.excludeNumbers, nil
			}
			if tt.wantPanic {
				require.Panics(t, func() {
					_, _, _, _ = GetClosesRangeWithExtensible(tt.fromNumber, tt.toNumber, funcGetExcludeNumbers, 0, 0)
				})
				return
			}

			gotHasResult, gotFrom, gotTo, gotErr := GetClosesRangeWithExtensible(tt.fromNumber, tt.toNumber, funcGetExcludeNumbers, 0, 0)
			require.NoError(t, gotErr)
			require.Equal(t, tt.wantHasResult, gotHasResult)
			require.Equal(t, tt.wantFrom, gotFrom)
			require.Equal(t, tt.wantTo, gotTo)
		})
	}

	tests := []struct {
		name                         string
		fromNumber                   int64
		toNumber                     int64
		funcGetExcludeNumbers        func(int64, int64) ([]int64, error)
		onFirstTryNoResultExtendUpTo int64
		onFirstTryNoResultExtendSize int
		wantHasResult                bool
		wantFrom                     int64
		wantTo                       int64
		wantErr                      bool
	}{
		{
			name:       "extensible",
			fromNumber: 1,
			toNumber:   5,
			funcGetExcludeNumbers: func(f int64, t int64) (res []int64, _ error) {
				if t <= 10 {
					for i := f; i <= t; i++ {
						res = append(res, i)
					}
					return
				}

				return nil, nil
			},
			onFirstTryNoResultExtendUpTo: 15,
			onFirstTryNoResultExtendSize: 5,
			wantHasResult:                true,
			wantFrom:                     11,
			wantTo:                       15,
			wantErr:                      false,
		},
		{
			name:       "extensible, larger",
			fromNumber: 1,
			toNumber:   5,
			funcGetExcludeNumbers: func(f int64, t int64) (res []int64, _ error) {
				if t <= 10 {
					for i := f; i <= t; i++ {
						res = append(res, i)
					}
					return
				}

				return nil, nil
			},
			onFirstTryNoResultExtendUpTo: 16,
			onFirstTryNoResultExtendSize: 5,
			wantHasResult:                true,
			wantFrom:                     11,
			wantTo:                       15,
			wantErr:                      false,
		},
		{
			name:       "extensible, less",
			fromNumber: 1,
			toNumber:   5,
			funcGetExcludeNumbers: func(f int64, t int64) (res []int64, _ error) {
				if t <= 10 {
					for i := f; i <= t; i++ {
						res = append(res, i)
					}
					return
				}

				return nil, nil
			},
			onFirstTryNoResultExtendUpTo: 14,
			onFirstTryNoResultExtendSize: 5,
			wantHasResult:                true,
			wantFrom:                     11,
			wantTo:                       14,
			wantErr:                      false,
		},
		{
			name:       "extensible, none",
			fromNumber: 1,
			toNumber:   5,
			funcGetExcludeNumbers: func(f int64, t int64) (res []int64, _ error) {
				for i := f; i <= t; i++ {
					res = append(res, i)
				}
				return
			},
			onFirstTryNoResultExtendUpTo: 15,
			onFirstTryNoResultExtendSize: 5,
			wantHasResult:                false,
		},
		{
			name:       "extensible, middle",
			fromNumber: 1,
			toNumber:   5,
			funcGetExcludeNumbers: func(f int64, t int64) (res []int64, _ error) {
				for i := f; i <= t; i++ {
					if i == 10 {
						continue
					}
					res = append(res, i)
				}
				return
			},
			onFirstTryNoResultExtendUpTo: 15,
			onFirstTryNoResultExtendSize: 5,
			wantHasResult:                true,
			wantFrom:                     10,
			wantTo:                       10,
			wantErr:                      false,
		},
		{
			name:       "extensible, middle",
			fromNumber: 1,
			toNumber:   5,
			funcGetExcludeNumbers: func(f int64, t int64) (res []int64, _ error) {
				for i := f; i <= t; i++ {
					if i >= 6 && i <= 8 {
						continue
					}
					if i == 13 {
						continue
					}
					res = append(res, i)
				}
				return
			},
			onFirstTryNoResultExtendUpTo: 15,
			onFirstTryNoResultExtendSize: 5,
			wantHasResult:                true,
			wantFrom:                     6,
			wantTo:                       8,
			wantErr:                      false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotHasResult, gotFrom, gotTo, err := GetClosesRangeWithExtensible(tt.fromNumber, tt.toNumber, tt.funcGetExcludeNumbers, tt.onFirstTryNoResultExtendUpTo, tt.onFirstTryNoResultExtendSize)
			if tt.wantErr {
				require.Error(t, err)
				return
			}

			require.NoError(t, err)
			require.Equal(t, tt.wantHasResult, gotHasResult)
			require.Equal(t, tt.wantFrom, gotFrom)
			require.Equal(t, tt.wantTo, gotTo)
		})
	}
}
