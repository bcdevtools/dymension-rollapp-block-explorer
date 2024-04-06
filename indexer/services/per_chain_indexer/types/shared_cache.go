package types

import "sync"

type SharedCache interface {
	MarkCreatedPartitionsForEpochWeek(epochWeek int64)
	IsCreatedPartitionsForEpochWeek(epochWeek int64) bool
}

var _ SharedCache = &sharedCache{}

type sharedCache struct {
	sync.RWMutex
	createdPartitionsForEpochWeek map[int64]bool
}

func NewSharedCache() SharedCache {
	return &sharedCache{
		RWMutex:                       sync.RWMutex{},
		createdPartitionsForEpochWeek: make(map[int64]bool),
	}
}

func (s *sharedCache) MarkCreatedPartitionsForEpochWeek(epochWeek int64) {
	s.Lock()
	defer s.Unlock()
	s.createdPartitionsForEpochWeek[epochWeek] = true
}

func (s *sharedCache) IsCreatedPartitionsForEpochWeek(epochWeek int64) bool {
	s.RLock()
	defer s.RUnlock()
	_, found := s.createdPartitionsForEpochWeek[epochWeek]
	return found
}
