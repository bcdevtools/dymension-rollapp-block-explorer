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
