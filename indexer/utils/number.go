package utils

import (
	"fmt"
	"slices"
)

// GetClosesRange returns the closest range of numbers, that not in the-exclude list.
// The input number must be > 0.
func GetClosesRange(fromNumber, toNumber int64, excludeNumbers []int64) (hasResult bool, from, to int64) {
	if fromNumber > toNumber {
		panic(fmt.Sprintf("input: from must <= to: %d & %d", fromNumber, toNumber))
	}
	if fromNumber < 1 || toNumber < 1 {
		panic(fmt.Sprintf("input: must be >=1: %d & %d", fromNumber, toNumber))
	}

	if len(excludeNumbers) == 0 {
		return true, fromNumber, toNumber
	}

	// this was designed for a small set of data,
	// so it is not needed to be optimized, instead, it just needs to be easy to be read.

	var mapInput = make(map[int64]bool, toNumber-fromNumber+1)
	for input := fromNumber; input <= toNumber; input++ {
		mapInput[input] = true
	}

	for _, exclude := range excludeNumbers {
		delete(mapInput, exclude)
	}

	if len(mapInput) == 0 {
		hasResult = false
		return
	}

	input := make([]int64, len(mapInput))
	i := 0
	for n := range mapInput {
		input[i] = n
		i++
	}

	slices.Sort(input)

	from = input[0]
	to = from
	for t := 1; t < len(input); t++ {
		if input[t]-input[t-1] > 1 {
			break
		}

		to = input[t]
	}

	hasResult = from > 0 && from <= to
	return
}
