package utils

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestGetPartitionedTableNameByChainId(t *testing.T) {
	tests := []struct {
		tableName string
		chainId   string
		want      string
	}{
		{
			tableName: "t",
			chainId:   "c",
			want:      "t_c",
		},
		{
			tableName: "t",
			chainId:   "c_1",
			want:      "t_c_1",
		},
		{
			tableName: "t",
			chainId:   "c_1-1",
			want:      "t_c_1__1",
		},
		{
			tableName: "t",
			chainId:   "c_1.1",
			want:      "t_c_1__1",
		},
		{
			// safe from SQL injection
			tableName: "t",
			chainId:   "c 1;1",
			want:      "t_c__1__1",
		},
	}
	for _, tt := range tests {
		require.Equalf(t, tt.want, GetPartitionedTableNameByChainId(tt.tableName, tt.chainId), "%s & %s", tt.tableName, tt.chainId)
	}
}

func TestMakePartitionIdFromKeys(t *testing.T) {
	tests := []struct {
		name      string
		keys      []any
		want      string
		wantPanic bool
	}{
		{
			name: "normal",
			keys: []any{"1"},
			want: "1",
		},
		{
			name: "normal",
			keys: []any{"1", "2"},
			want: "1 2",
		},
		{
			name: "normal",
			keys: []any{"1", 2, "3"},
			want: "1 2 3",
		},
		{
			name:      "no key",
			wantPanic: true,
		},
		{
			name:      "contains empty key",
			keys:      []any{"	", 2, "3"},
			wantPanic: true,
		},
		{
			name:      "contains nil key",
			keys:      []any{"1", 2, nil, "4"},
			wantPanic: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.wantPanic {
				require.Panics(t, func() {
					_ = MakePartitionIdFromKeys(tt.keys...)
				})
				return
			}
			if got := MakePartitionIdFromKeys(tt.keys...); got != tt.want {
				t.Errorf("MakePartitionIdFromKeys() = %v, want %v", got, tt.want)
			}
		})
	}
}
