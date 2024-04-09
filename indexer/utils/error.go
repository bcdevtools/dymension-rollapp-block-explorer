package utils

import "fmt"

func MergeError(err error, errs ...error) error {
	if len(errs) == 0 {
		return err
	}

	if err == nil && len(errs) == 1 {
		return errs[0]
	}

	if err == nil {
		err = errs[0]
		errs = errs[1:]
	}

	for _, e := range errs {
		err = fmt.Errorf("%v\n---\n%v", err, e)
	}

	return err
}
