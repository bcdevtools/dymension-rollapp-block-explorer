package types

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestNewRecordChainInfoForInsert(t *testing.T) {
	chainId := "chain_id-1"
	name := "name-1"
	chainType := "chain_type-1"
	bech32 := map[string]string{"key1": "value1"}
	denoms := map[string]string{"key2": "value2"}
	activeBeJsonRpcUrl := "activeBeJsonRpcUrl-1"

	t.Run("normal", func(t *testing.T) {
		record, err := NewRecordChainInfoForInsert(chainId, name, chainType, bech32, denoms, activeBeJsonRpcUrl)
		require.NoError(t, err)
		require.Equal(t, chainId, record.ChainId)
		require.Equal(t, name, record.Name)
		require.Equal(t, chainType, record.ChainType)
		require.Equal(t, `{"key1":"value1"}`, record.Bech32)
		require.Equal(t, `{"key2":"value2"}`, record.Denoms)
		require.Equal(t, []string{activeBeJsonRpcUrl}, record.BeJsonRpcUrls)
	})

	t.Run("nil bech32", func(t *testing.T) {
		record, err := NewRecordChainInfoForInsert(chainId, name, chainType, nil, denoms, activeBeJsonRpcUrl)
		require.NoError(t, err)
		require.Equal(t, chainId, record.ChainId)
		require.Equal(t, name, record.Name)
		require.Equal(t, chainType, record.ChainType)
		require.Equal(t, `{}`, record.Bech32)
		require.Equal(t, `{"key2":"value2"}`, record.Denoms)
		require.Equal(t, []string{activeBeJsonRpcUrl}, record.BeJsonRpcUrls)
	})

	t.Run("nil denoms", func(t *testing.T) {
		record, err := NewRecordChainInfoForInsert(chainId, name, chainType, bech32, nil, activeBeJsonRpcUrl)
		require.NoError(t, err)
		require.Equal(t, chainId, record.ChainId)
		require.Equal(t, name, record.Name)
		require.Equal(t, chainType, record.ChainType)
		require.Equal(t, `{"key1":"value1"}`, record.Bech32)
		require.Equal(t, `{}`, record.Denoms)
		require.Equal(t, []string{activeBeJsonRpcUrl}, record.BeJsonRpcUrls)
	})
}
