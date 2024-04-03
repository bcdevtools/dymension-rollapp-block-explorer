package per_chain_indexer

import (
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"github.com/stretchr/testify/require"
	"slices"
	"testing"
	"time"
)

func Test_responseByJsonRpcUrlSlice(t *testing.T) {
	info := func(height uint64) *querytypes.ResponseBeGetChainInfo {
		return &querytypes.ResponseBeGetChainInfo{
			LatestBlock: height,
		}
	}

	records := responseByJsonRpcUrlSlice{
		{
			res:      info(1),
			duration: 1 * time.Millisecond,
		},
		{
			res:      info(2),
			duration: 2 * time.Millisecond,
		},
		{
			res:      info(2),
			duration: 3 * time.Millisecond,
		},
		{
			res:      info(3),
			duration: 3 * time.Second,
		},
		{
			res:      info(3),
			duration: 5 * time.Second,
		},
		{
			res:      info(3),
			duration: 4 * time.Second,
		},
	}

	records.Sort()
	require.Len(t, records, 6, "should not change the length")

	got := records[0]
	require.Equal(t, uint64(3), got.res.LatestBlock)
	require.Equal(t, 3*time.Second, got.duration)

	slices.Reverse(records) // invalidate the sort order

	top, found := records.GetTop()
	require.Len(t, records, 6, "should not change the length")
	require.True(t, found)
	require.Equal(t, uint64(3), top.res.LatestBlock)
	require.Equal(t, 3*time.Second, top.duration)

	require.Equal(t, uint64(3), records[1].res.LatestBlock)
	require.Equal(t, 4*time.Second, records[1].duration)

	require.Equal(t, uint64(3), records[2].res.LatestBlock)
	require.Equal(t, 5*time.Second, records[2].duration)

	require.Equal(t, uint64(2), records[3].res.LatestBlock)
	require.Equal(t, 2*time.Millisecond, records[3].duration)

	require.Equal(t, uint64(2), records[4].res.LatestBlock)
	require.Equal(t, 3*time.Millisecond, records[4].duration)

	require.Equal(t, uint64(1), records[5].res.LatestBlock)
	require.Equal(t, 1*time.Millisecond, records[5].duration)

	records = responseByJsonRpcUrlSlice{}
	_, found = records.GetTop()
	require.False(t, found)
}
