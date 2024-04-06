package types

import "fmt"

type Bech32PrefixOfChainInfo struct {
	Bech32PrefixAccAddr  string `json:"addr"`
	Bech32PrefixCons     string `json:"cons"`
	Bech32PrefixOperator string `json:"val"`
}

func (b Bech32PrefixOfChainInfo) ValidateBasic() error {
	if b.Bech32PrefixAccAddr == "" {
		return fmt.Errorf("bech32 prefix for account address is missing")
	}
	if b.Bech32PrefixCons == "" {
		return fmt.Errorf("bech32 prefix for consensus address is missing")
	}
	if b.Bech32PrefixOperator == "" {
		return fmt.Errorf("bech32 prefix for validator address is missing")
	}

	return nil
}
