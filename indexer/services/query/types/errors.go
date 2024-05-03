package types

import (
	"github.com/pkg/errors"
	"strings"
)

// ErrBlackList is the error when the response contains critical issue
var ErrBlackList = errors.New("black list")
var ErrBlackListDueToMisMatchChainId = errors.Wrap(ErrBlackList, "mis-match chain-id")
var ErrBlackListDueToMalformedResponse = errors.Wrapf(ErrBlackList, "malformed response")

// IsErrBlackList returns true if the error indicate the response contains critical issue, the URL should be ignored
func IsErrBlackList(err error) bool {
	return strings.Contains(err.Error(), ErrBlackList.Error())
}

// ErrResponseValidationFailed is the error when the response does not pass the validation
var ErrResponseValidationFailed = errors.New("response validation failed")

func NewErrResponseValidationFailedFrom(err error) error {
	return errors.Wrap(ErrResponseValidationFailed, err.Error())
}

// IsErrResponseValidationFailed returns true if the error indicate the response does not pass the validation
func IsErrResponseValidationFailed(err error) bool {
	return strings.Contains(err.Error(), ErrResponseValidationFailed.Error())
}
