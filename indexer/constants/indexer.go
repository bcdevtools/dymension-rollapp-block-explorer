package constants

import "time"

const (
	MaximumNumberOfBlocksToIndexPerBatch = 100

	RecheckPostponedChainInterval time.Duration = 5 * time.Minute
)

const (
	InvolversTypeSenderOrSigner     = "s"
	InvolversTypeNormal             = "0"
	InvolversTypeErc20              = "erc20"
	InvolversTypeNft                = "nft"
	InvolversTypeContractsInvolvers = "contracts"
)
