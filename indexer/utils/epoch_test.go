package utils

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestGetEpochWeek(t *testing.T) {
	require.Equal(t, int64(2831), GetEpochWeek(1712376984+0))
	require.Equal(t, int64(2832), GetEpochWeek(1712376984+86400*7))
	require.Equal(t, int64(2830), GetEpochWeek(1712376984-86400*7))
	require.LessOrEqual(t, int64(2831), GetEpochWeek(0))

	require.Equal(t, int64(2830), GetEpochWeek(1712188800-1))
	require.Equal(t, int64(2831), GetEpochWeek(1712188800+0))
	require.Equal(t, int64(2831), GetEpochWeek(1712188800+1))
}
