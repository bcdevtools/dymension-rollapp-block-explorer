package types

import (
	"fmt"
	"sync"
)

type SharedCache interface {
	MarkCreatedPartitionsForEpochWeekAndChainIdWL(epochWeek int64, chainId string)
	IsCreatedPartitionsForEpochWeekAndChainIdRL(epochWeek int64, chainId string) bool
}

var _ SharedCache = &sharedCache{}

type sharedCache struct {
	sync.RWMutex
	createdPartitionsForEpochWeekAndChainId map[string]bool
}

func NewSharedCache() SharedCache {
	return &sharedCache{
		RWMutex:                                 sync.RWMutex{},
		createdPartitionsForEpochWeekAndChainId: make(map[string]bool),
	}
}

func (s *sharedCache) MarkCreatedPartitionsForEpochWeekAndChainIdWL(epochWeek int64, chainId string) {
	s.Lock()
	defer s.Unlock()
	s.createdPartitionsForEpochWeekAndChainId[buildKeyFromEpochWeekAndChainId(epochWeek, chainId)] = true
}

func (s *sharedCache) IsCreatedPartitionsForEpochWeekAndChainIdRL(epochWeek int64, chainId string) bool {
	s.RLock()
	defer s.RUnlock()
	_, found := s.createdPartitionsForEpochWeekAndChainId[buildKeyFromEpochWeekAndChainId(epochWeek, chainId)]
	return found
}

func buildKeyFromEpochWeekAndChainId(epochWeek int64, chainId string) string {
	return fmt.Sprintf("%s w%d", chainId, epochWeek)
}
