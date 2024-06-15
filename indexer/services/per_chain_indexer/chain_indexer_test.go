package per_chain_indexer

//goland:noinspection SpellCheckingInspection
import (
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"github.com/stretchr/testify/require"
	"slices"
	"testing"
	"time"
)

func Test_responseByJsonRpcUrlSlice(t *testing.T) {
	info := func(height int64) *querytypes.ResponseBeGetChainInfo {
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
	require.Equal(t, int64(3), got.res.LatestBlock)
	require.Equal(t, 3*time.Second, got.duration)

	slices.Reverse(records) // invalidate the sort order

	top, found := records.GetTop()
	require.Len(t, records, 6, "should not change the length")
	require.True(t, found)
	require.Equal(t, int64(3), top.res.LatestBlock)
	require.Equal(t, 3*time.Second, top.duration)

	require.Equal(t, int64(3), records[1].res.LatestBlock)
	require.Equal(t, 4*time.Second, records[1].duration)

	require.Equal(t, int64(3), records[2].res.LatestBlock)
	require.Equal(t, 5*time.Second, records[2].duration)

	require.Equal(t, int64(2), records[3].res.LatestBlock)
	require.Equal(t, 2*time.Millisecond, records[3].duration)

	require.Equal(t, int64(2), records[4].res.LatestBlock)
	require.Equal(t, 3*time.Millisecond, records[4].duration)

	require.Equal(t, int64(1), records[5].res.LatestBlock)
	require.Equal(t, 1*time.Millisecond, records[5].duration)

	records = responseByJsonRpcUrlSlice{}
	_, found = records.GetTop()
	require.False(t, found)
}

func Test_responseByJsonRpcUrlSlice_PrioritySelfMaintained(t *testing.T) {
	t.Run("self-maintained is the top", func(t *testing.T) {
		records := responseByJsonRpcUrlSlice{
			{
				url: "https://external.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             2,
					LatestBlockTimeEpochUTC: 2,
				},
				duration: 1 * time.Millisecond,
			},
			{
				url: "https://1ocalhost.online/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             3,
					LatestBlockTimeEpochUTC: 3,
				},
				duration: 2 * time.Millisecond,
			},
			{
				url: "https://example.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             2,
					LatestBlockTimeEpochUTC: 2,
				},
				duration: 3 * time.Millisecond,
			},
		}

		top, found := records.GetTop()
		require.Len(t, records, 3)
		require.True(t, found)
		require.Equal(t, int64(3), top.res.LatestBlock)
		require.Equal(t, 2*time.Millisecond, top.duration)
	})

	t.Run("self-maintained is not the top but priority it", func(t *testing.T) {
		records := responseByJsonRpcUrlSlice{
			{
				url: "https://external.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             4,
					LatestBlockTimeEpochUTC: 4,
				},
				duration: 1 * time.Millisecond,
			},
			{
				url: "https://1ocalhost.online/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             3,
					LatestBlockTimeEpochUTC: 3,
				},
				duration: 2 * time.Millisecond,
			},
			{
				url: "https://example.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             2,
					LatestBlockTimeEpochUTC: 2,
				},
				duration: 3 * time.Millisecond,
			},
		}

		top, found := records.GetTop()
		require.Len(t, records, 3)
		require.True(t, found)
		require.Equal(t, int64(3), top.res.LatestBlock)
		require.Equal(t, 2*time.Millisecond, top.duration)
	})

	t.Run("self-maintained is not the top but priority it, case reach limit offset allowed", func(t *testing.T) {
		records := responseByJsonRpcUrlSlice{
			{
				url: "https://external.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             4 + maxSelfMaintainedBlocksFallBehind,
					LatestBlockTimeEpochUTC: 4 + maxSelfMaintainedEpochsFallBehind,
				},
				duration: 4 * time.Millisecond,
			},
			{
				url: "https://1ocalhost.online/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             4,
					LatestBlockTimeEpochUTC: 4,
				},
				duration: 4 * time.Millisecond,
			},
			{
				url: "https://example.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             2,
					LatestBlockTimeEpochUTC: 2,
				},
				duration: 3 * time.Millisecond,
			},
		}

		top, found := records.GetTop()
		require.Len(t, records, 3)
		require.True(t, found)
		require.Equal(t, int64(4), top.res.LatestBlock)
		require.Contains(t, top.url, "1ocalhost.online")
	})

	t.Run("self-maintained is not the top and not priority due to block fall-behind", func(t *testing.T) {
		records := responseByJsonRpcUrlSlice{
			{
				url: "https://external.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             4 + maxSelfMaintainedBlocksFallBehind + 1,
					LatestBlockTimeEpochUTC: 4 + maxSelfMaintainedEpochsFallBehind,
				},
				duration: 4 * time.Millisecond,
			},
			{
				url: "https://1ocalhost.online/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             4,
					LatestBlockTimeEpochUTC: 4,
				},
				duration: 4 * time.Millisecond,
			},
			{
				url: "https://example.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             2,
					LatestBlockTimeEpochUTC: 2,
				},
				duration: 3 * time.Millisecond,
			},
		}

		top, found := records.GetTop()
		require.Len(t, records, 3)
		require.True(t, found)
		require.Contains(t, top.url, "external.com")
	})

	t.Run("self-maintained is not the top and not priority due to epoch fall-behind", func(t *testing.T) {
		records := responseByJsonRpcUrlSlice{
			{
				url: "https://external.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             4 + maxSelfMaintainedBlocksFallBehind,
					LatestBlockTimeEpochUTC: 4 + maxSelfMaintainedEpochsFallBehind + 1,
				},
				duration: 4 * time.Millisecond,
			},
			{
				url: "https://1ocalhost.online/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             4,
					LatestBlockTimeEpochUTC: 4,
				},
				duration: 4 * time.Millisecond,
			},
			{
				url: "https://example.com/rpc",
				res: &querytypes.ResponseBeGetChainInfo{
					LatestBlock:             2,
					LatestBlockTimeEpochUTC: 2,
				},
				duration: 3 * time.Millisecond,
			},
		}

		top, found := records.GetTop()
		require.Len(t, records, 3)
		require.True(t, found)
		require.Contains(t, top.url, "external.com")
	})
}

func Test_getTxValueFromTx(t *testing.T) {
	tests := []struct {
		name       string
		inputValue string
		wantValue  []string
		wantErr    bool
	}{
		{
			name:       "normal, single",
			inputValue: "1uatom",
			wantValue:  []string{"1 uatom"},
			wantErr:    false,
		},
		{
			name:       "normal, multiple",
			inputValue: "1uatom,1uosmo",
			wantValue:  []string{"1 uatom", "1 uosmo"},
			wantErr:    false,
		},
		{
			name:       "normal, empty",
			inputValue: "",
			wantValue:  nil,
			wantErr:    false,
		},
		{
			name:       "normal, but abnormal",
			inputValue: "1 uatom",
			wantValue:  []string{"1 uatom"},
			wantErr:    false,
		},
		{
			name:       "invalid",
			inputValue: "abc",
			wantErr:    true,
		},
		{
			name:       "invalid",
			inputValue: "uatom1",
			wantErr:    true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotValue, err := getTxValueFromTx(querytypes.TransactionInBlockInResponseBeTransactionsInBlockRange{
				Value: tt.inputValue,
			})
			if tt.wantErr {
				require.Error(t, err)
				require.Nil(t, gotValue)
				return
			}

			require.NoError(t, err)
			if len(tt.wantValue) == 0 {
				require.Nil(t, gotValue)
				return
			}

			require.Equal(t, tt.wantValue, gotValue)
		})
	}
}
