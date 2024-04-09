package types

type TestChain struct {
	ChainId             string
	Bech32AccAddrPrefix string
	MinDenom            string
	Decimals            uint8
}

type TestChains []*TestChain

func (c TestChains) Number(num int) *TestChain {
	return c[num-1]
}
