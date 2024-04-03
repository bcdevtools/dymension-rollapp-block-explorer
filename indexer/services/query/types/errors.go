package types

import (
	"fmt"
	"github.com/pkg/errors"
	"strings"
)

var ErrBlackList = fmt.Errorf("black list")
var ErrBlackListDueToMisMatchChainId = errors.Wrap(ErrBlackList, "mis-match chain-id")

// IsErrBlackList returns true if the error indicate the response contains critical issue, the URL should be ignored
func IsErrBlackList(err error) bool {
	return strings.Contains(err.Error(), ErrBlackList.Error())
}
