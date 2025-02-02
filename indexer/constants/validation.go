package constants

const (
	RpcTxAheadBlockTimeAllowed                     = 86400 - 1 // now + X
	RpcTxMaximumTxsPerBlockAllowed                 = 100       // maximum X txs per block
	RpcTxMaximumMessagesPerTxAllowed               = 30        // maximum X msgs per tx
	RpcTxMaximumSystemMessagesPerTxAllowed         = 300       // maximum X system msgs per tx
	RpcTxMaximumStringSizeAllowed                  = 1000      // characters
	RpcTxMaximumSignersPerTx                       = 10        // maximum X signers per tx
	RpcTxMaximumLengthAddressAllowed               = 100       // address characters can not access X characters
	RpcTxMaximumInvolversPerTxAllowed              = 250       // no more than X involvers can be involved in one tx
	RpcTxMaximumTokenContractsInvolvesPerTxAllowed = 20        // no more than X token contracts can be involved in one tx
)
