package constants

const (
	RpcTxAheadBlockTimeAllowed                     = 86400 - 1 // now + X
	RpcTxMaximumTxsPerBlockAllowed                 = 50        // maximum X txs per block
	RpcTxMaximumMessagesPerTxAllowed               = 40        // maximum X msgs per tx
	RpcTxMaximumStringSizeAllowed                  = 1000      // characters
	RpcTxMaximumSignersPerTx                       = 10        // maximum X signers per tx
	RpcTxMaximumLengthAddressAllowed               = 100       // address characters can not access X characters
	RpcTxMaximumInvolversPerTxAllowed              = 200       // no more than X involvers can be involved in one tx
	RpcTxMaximumTokenContractsInvolvesPerTxAllowed = 20        // no more than X token contracts can be involved in one tx
)
