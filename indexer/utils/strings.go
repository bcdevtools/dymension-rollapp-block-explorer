package utils

import "sort"

func AreSortedStringArraysEquals(arr1, arr2 []string) bool {
	if len(arr1) != len(arr2) {
		return false
	}

	if len(arr1) == 0 {
		return true
	}

	sort.Strings(arr1)
	sort.Strings(arr2)

	for i := range arr1 {
		if arr1[i] != arr2[i] {
			return false
		}
	}

	return true
}
