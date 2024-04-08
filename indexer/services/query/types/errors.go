package types

import (
	"github.com/pkg/errors"
	"strings"
)

// ErrBlackList is the error when the response contains critical issue
var ErrBlackList = errors.New("black list")
var ErrBlackListDueToMisMatchChainId = errors.Wrap(ErrBlackList, "mis-match chain-id")

// IsErrBlackList returns true if the error indicate the response contains critical issue, the URL should be ignored
func IsErrBlackList(err error) bool {
	return strings.Contains(err.Error(), ErrBlackList.Error())
}
