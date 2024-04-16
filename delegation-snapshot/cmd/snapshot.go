package cmd

import (
	sdkmath "cosmossdk.io/math"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/delegation-snapshot/constants"
	sdk "github.com/cosmos/cosmos-sdk/types"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"io"
	"math/big"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	flagValidatorOperatorAddress = "valoper"
	flagRestApi                  = "rest"
	flagTransformMaxDelegation   = "transform-max"
	flagMinDelegation            = "min"
	flagAllocate                 = "allocate"
	flagIndividualMax            = "individual-max"
	flagTokenExponent            = "token-exponent"
	flagTokenDenom               = "token-denom"
	flagBondDenom                = "bond-denom"
	flagBondDenomExponent        = "bond-exponent"
	flagMemo                     = "memo"
	flagTokenDistributor         = "from"
)

var snapshotCmd = &cobra.Command{
	Use:     "snapshot [?block height]",
	Aliases: []string{"ss"},
	Short:   "Snapshot the validator",
	Args:    cobra.RangeArgs(0, 1),
	Run: func(cmd *cobra.Command, args []string) {
		validatorOperationAddress, err := cmd.Flags().GetString(flagValidatorOperatorAddress)
		if err != nil {
			panic(err)
		}
		if len(validatorOperationAddress) == 0 {
			panic("validator operator address cannot be empty")
		}
		restApi, err := cmd.Flags().GetString(flagRestApi)
		if err != nil {
			panic(err)
		}
		if len(restApi) == 0 {
			panic("rest api endpoint cannot be empty")
		}
		restApi = strings.TrimSuffix(restApi, "/")
		transformMaxDelegation, err := cmd.Flags().GetUint(flagTransformMaxDelegation)
		if err != nil {
			panic(err)
		}
		minDelegation, err := cmd.Flags().GetUint(flagMinDelegation)
		if err != nil {
			panic(err)
		}
		allocateGiftTokenAmount, err := cmd.Flags().GetUint(flagAllocate)
		if err != nil {
			panic(err)
		}
		if allocateGiftTokenAmount < 100 {
			panic("allocate gift token amount must be >= 100")
		}
		individualMax, err := cmd.Flags().GetUint8(flagIndividualMax)
		if err != nil {
			panic(err)
		}
		if individualMax < 5 || individualMax > 90 {
			panic("individual max must be between 5% and 90%")
		}
		giftTokenExponent, err := cmd.Flags().GetUint8(flagTokenExponent)
		if err != nil {
			panic(err)
		}
		if giftTokenExponent != 0 && giftTokenExponent != 6 && giftTokenExponent != 9 && giftTokenExponent != 18 {
			panic("token exponent must be 0, 6, 9, or 18")
		}
		bondDenom, err := cmd.Flags().GetString(flagBondDenom)
		if err != nil {
			panic(err)
		}
		if len(bondDenom) == 0 {
			panic("bond denom cannot be empty")
		}
		bondDenomExponent, err := cmd.Flags().GetUint8(flagBondDenomExponent)
		if err != nil {
			panic(err)
		}
		if bondDenomExponent != 6 && bondDenomExponent != 18 {
			panic("bond denom exponent must be 6 or 18")
		}
		tokenDenom, err := cmd.Flags().GetString(flagTokenDenom)
		if err != nil {
			panic(err)
		}
		if len(tokenDenom) == 0 {
			panic("token denom cannot be empty")
		}
		memo, err := cmd.Flags().GetString(flagMemo)
		if err != nil {
			panic(err)
		}
		if memo == "" && validatorOperationAddress == constants.DrBeValidatorOperationAddress {
			memo = fmt.Sprintf("Token distribution. Ticket to register RollApp onto Dymension RollApps Block Explorer and unlock storage & features. Thank you for delegating to Dr.BE %s", constants.DrBeValidatorOperationAddress)
		}
		tokenDistributor, err := cmd.Flags().GetString(flagTokenDistributor)
		if err != nil {
			panic(err)
		}
		if len(tokenDistributor) == 0 {
			panic("token distributor cannot be empty")
		}
		var height int64
		if len(args) > 0 {
			height, err := strconv.ParseInt(args[0], 10, 64)
			if err != nil {
				panic(err)
			}
			if height < 0 {
				panic("block height can not be negative")
			}
		}
		heightStr := strconv.FormatInt(height, 10)

		oneHighBond := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(bondDenomExponent)), nil)
		oneHighGiftToken := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(giftTokenExponent)), nil)

		amountTransformMaxDelegation := sdkmath.NewIntFromBigInt(new(big.Int).Mul(new(big.Int).SetUint64(uint64(transformMaxDelegation)), oneHighBond))
		amountMinDelegation := sdkmath.NewIntFromBigInt(new(big.Int).Mul(new(big.Int).SetUint64(uint64(minDelegation)), oneHighBond))
		amountAllocateGiftToken := sdkmath.NewIntFromBigInt(new(big.Int).Mul(new(big.Int).SetUint64(uint64(allocateGiftTokenAmount)), oneHighGiftToken))
		amountCapAllocateGiftToken := amountAllocateGiftToken.QuoRaw(100).MulRaw(int64(individualMax))

		gasPrice := sdkmath.NewInt(1)
		if bondDenomExponent == 18 {
			gasPrice = sdkmath.NewInt(20_000_000_000)
		}

		queryDelegationUrl := fmt.Sprintf("%s/cosmos/staking/v1beta1/validators/%s/delegations", restApi, validatorOperationAddress)

		fmt.Println("Validator:", validatorOperationAddress)
		fmt.Println("Context height:", height)
		fmt.Println("Rest API:", restApi, "=>", queryDelegationUrl)
		fmt.Println("Bond Denom:", bondDenom)
		fmt.Println("Cap Delegation:", displayNumber(amountTransformMaxDelegation, bondDenomExponent), "exponent", bondDenomExponent)
		fmt.Println("Min Delegation:", displayNumber(amountMinDelegation, bondDenomExponent), "exponent", bondDenomExponent)
		fmt.Println("Token Denom:", tokenDenom)
		fmt.Println("Allocate Gift Token:", displayNumber(amountAllocateGiftToken, giftTokenExponent), "exponent", giftTokenExponent)
		fmt.Println("Cap Allocate Gift Token to individual:", displayNumber(amountCapAllocateGiftToken, giftTokenExponent), "exponent", giftTokenExponent)
		fmt.Println("Distributor:", tokenDistributor)
		fmt.Println("Memo:", memo)
		fmt.Println("Gas Price:", gasPrice, bondDenom)

		httpClient := &http.Client{}

		delegation := make(map[string]sdkmath.Int)
		var nextKey []byte
		var stop = false
		page := 1
		for !stop {
			req, err := http.NewRequest("GET", queryDelegationUrl, nil)
			if err != nil {
				panic(err)
			}
			if height > 0 {
				req.Header.Add("x-cosmos-block-height", heightStr)
			}
			query := req.URL.Query()
			query.Add("pagination.limit", "500")
			if len(nextKey) > 0 {
				query.Add("pagination.key", base64.StdEncoding.EncodeToString(nextKey))
			}
			req.URL.RawQuery = query.Encode()

			var bz []byte
			var queryErr error

			startTime := time.Now().UTC()
			retryCount := 0
			const minRetryCount = 3
			const maxRetryDuration = 60 * time.Second
			const sleepEachRetry = 100 * time.Millisecond

			for {
				if retryCount > 0 {
					time.Sleep(sleepEachRetry)
				}

				bz, queryErr = func() ([]byte, error) {
					res, err := httpClient.Do(req)

					if err != nil {
						return nil, err
					}

					defer func() {
						_ = res.Body.Close()
					}()

					return io.ReadAll(res.Body)
				}()

				if queryErr == nil {
					break
				}

				fmt.Println("ERR: query error", queryErr)

				if retryCount < minRetryCount {
					retryCount++
					continue
				}

				if time.Since(startTime) <= maxRetryDuration {
					continue
				}

				break
			}

			if queryErr != nil {
				fmt.Println("ERR: stopped at page", page, "with error", err)
				os.Exit(1)
			}

			type balanceValidatorDelegationResponse struct {
				Denom  string `json:"denom"`
				Amount string `json:"amount"`
			}
			type delegationValidatorDelegationResponse struct {
				DelegatorAddress string `json:"delegator_address"`
				ValidatorAddress string `json:"validator_address"`
			}
			type validatorDelegationResponse struct {
				Delegation delegationValidatorDelegationResponse `json:"delegation"`
				Balance    balanceValidatorDelegationResponse    `json:"balance"`
			}
			type paginationValidatorDelegationResponse struct {
				NextKey string `json:"next_key"`
			}
			type validatorDelegationsResponse struct {
				DelegationResponses []validatorDelegationResponse         `json:"delegation_responses"`
				Pagination          paginationValidatorDelegationResponse `json:"pagination"`
			}

			var res validatorDelegationsResponse
			err = json.Unmarshal(bz, &res)
			if err != nil {
				fmt.Println("ERR: stopped at page", page, "due to unable to unmarshal data", err)
				fmt.Println("ERR: content", string(bz))
				os.Exit(1)
			}

			for _, del := range res.DelegationResponses {
				if strings.EqualFold(bondDenom, del.Balance.Denom) {
					delegationAmount, ok := sdkmath.NewIntFromString(del.Balance.Amount)
					if !ok {
						fmt.Println("ERR: stopped at page", page, "due to unable to parse amount")
						fmt.Println("ERR: content", string(bz))
						fmt.Println("ERR: amount", del.Balance.Amount)
						os.Exit(1)
					}
					if delegationAmount.GTE(amountMinDelegation) {
						delegation[del.Delegation.DelegatorAddress] = delegationAmount
					}
				}
			}

			if res.Pagination.NextKey == "" {
				break
			}

			nextKey, err = base64.StdEncoding.DecodeString(res.Pagination.NextKey)
			if err != nil {
				fmt.Println("ERR: stopped at page", page, "due to unable to decode next key", err)
				fmt.Println("ERR: content", string(bz))
				fmt.Println("ERR: next key", res.Pagination.NextKey)
				os.Exit(1)
			}
			stop = len(res.Pagination.NextKey) == 0
			page++
		}

		printTable := func(
			delegator,
			highDelegationAmount, lowDelegationAmount,
			highEffectiveDelegationAmount, lowEffectiveDelegationAmount,
			highAllocateTokenAmount, lowAllocateTokenAmount string) {
			fmt.Printf(
				"%-42s | %9s.%-18s | %9s.%-18s | %9s.%-18s |\n",
				delegator,
				highDelegationAmount, lowDelegationAmount,
				highEffectiveDelegationAmount, lowEffectiveDelegationAmount,
				highAllocateTokenAmount, lowAllocateTokenAmount,
			)
		}

		type record struct {
			delegatorAddress          string
			delegationAmount          sdkmath.Int
			effectiveDelegationAmount sdkmath.Int
			allocateTokenAmount       sdkmath.Int
		}
		var records []record
		sumDelegation := sdkmath.NewInt(0)
		sumEffectiveDelegation := sdkmath.NewInt(0)
		for delegator, delegationAmount := range delegation {
			effectiveDelegationAmount := delegationAmount
			if delegationAmount.GT(amountTransformMaxDelegation) {
				effectiveDelegationAmount = amountTransformMaxDelegation
			}
			records = append(records, record{
				delegatorAddress:          delegator,
				delegationAmount:          delegationAmount,
				effectiveDelegationAmount: effectiveDelegationAmount,
			})
			sumDelegation = sumDelegation.Add(delegationAmount)
			sumEffectiveDelegation = sumEffectiveDelegation.Add(effectiveDelegationAmount)
		}

		sumAllocatedToken := sdkmath.NewInt(0)
		giftTokenPerBondSatoshiFloat := new(big.Float).Quo(
			new(big.Float).SetInt(amountAllocateGiftToken.BigInt()),
			new(big.Float).SetInt(sumEffectiveDelegation.BigInt()),
		)
		if giftTokenPerBondSatoshiFloat.Sign() == 0 || giftTokenPerBondSatoshiFloat.IsInf() {
			panic("gift token per bond is zero or infinite")
		}
		for i, r := range records {
			allocateTokenAmountFloat := new(big.Float).Mul(new(big.Float).SetInt(r.effectiveDelegationAmount.BigInt()), giftTokenPerBondSatoshiFloat)
			allocateTokenAmountInt := new(big.Int)
			allocateTokenAmountInt, _ = allocateTokenAmountFloat.Int(allocateTokenAmountInt)
			r.allocateTokenAmount = sdkmath.NewIntFromBigInt(allocateTokenAmountInt)
			if r.allocateTokenAmount.GT(amountCapAllocateGiftToken) {
				r.allocateTokenAmount = amountCapAllocateGiftToken
			}
			sumAllocatedToken = sumAllocatedToken.Add(r.allocateTokenAmount)

			records[i] = r
		}

		fmt.Println("Total Delegation:", displayNumber(sumDelegation, bondDenomExponent), "exponent", bondDenomExponent)
		fmt.Println("Total Effective Delegation:", displayNumber(sumEffectiveDelegation, bondDenomExponent), "exponent", bondDenomExponent)
		fmt.Println("Total Allocate Token:", displayNumber(sumAllocatedToken, giftTokenExponent), "exponent", giftTokenExponent)
		fmt.Println("Allocate token per bond:", giftTokenPerBondSatoshiFloat)

		sort.Slice(records, func(i, j int) bool {
			return records[i].delegationAmount.LT(records[j].delegationAmount)
		})

		printTable("Delegator", "D", "Amount", "Ef. D", "Amount", "Allocate", "Token")
		for _, r := range records {
			highDelegationAmount, lowDelegationAmount := splitDisplayNumber(r.delegationAmount.String(), bondDenomExponent)
			highEffectiveDelegationAmount, lowEffectiveDelegationAmount := splitDisplayNumber(r.effectiveDelegationAmount.String(), bondDenomExponent)
			highAllocateTokenAmount, lowAllocateTokenAmount := splitDisplayNumber(r.allocateTokenAmount.String(), giftTokenExponent)
			printTable(
				r.delegatorAddress,
				highDelegationAmount, lowDelegationAmount,
				highEffectiveDelegationAmount, lowEffectiveDelegationAmount,
				highAllocateTokenAmount, lowAllocateTokenAmount,
			)
		}

		inputAssets := make([]banktypes.Input, len(records))
		outputAssets := make([]banktypes.Output, len(records))
		for i, r := range records {
			inputAssets[i] = banktypes.Input{
				Address: tokenDistributor,
				Coins:   sdk.NewCoins(sdk.NewCoin(tokenDenom, r.allocateTokenAmount)),
			}
			outputAssets[i] = banktypes.Output{
				Address: r.delegatorAddress,
				Coins:   sdk.NewCoins(sdk.NewCoin(tokenDenom, r.allocateTokenAmount)),
			}
		}

		msgMultiSend := banktypes.MsgMultiSend{
			Inputs:  inputAssets,
			Outputs: outputAssets,
		}
		bz, err := json.Marshal(msgMultiSend)
		if err != nil {
			panic(errors.Wrap(err, "failed to marshal multi-send message"))
		}

		gasLimit := 38_000 * len(records)
		if gasLimit < 400_000 {
			gasLimit = 400_000
		}
		txFee := gasPrice.Mul(sdkmath.NewInt(int64(gasLimit)))
		unsignedMsg := fmt.Sprintf(`{
  "body": {
    "messages": [
      %s%s
    ],
    "memo": "%s",
    "timeout_height": "0",
    "extension_options": [],
    "non_critical_extension_options": []
  },
  "auth_info": {
    "signer_infos": [],
    "fee": {
      "amount": [
        {
          "denom": "%s",
          "amount": "%s"
        }
      ],
      "gas_limit": "%d",
      "payer": "",
      "granter": ""
    },
    "tip": null
  },
  "signatures": []
}`, `{"@type": "/cosmos.bank.v1beta1.MsgMultiSend",`, string(bz)[1:], strings.ReplaceAll(memo, `"`, `\"`), bondDenom, txFee.String(), gasLimit)
		fmt.Println("Unsigned message:")
		fmt.Println(unsignedMsg)
	},
}

func displayNumber(num sdkmath.Int, exponent uint8) string {
	str := sdkmath.LegacyNewDecFromIntWithPrec(num, int64(exponent)).String()
	removeZero := 18 - exponent
	if removeZero > 0 {
		str = str[:len(str)-int(removeZero)]
	}
	return str
}

func splitDisplayNumber(num string, exponent uint8) (high, low string) {
	for len(num) < int(exponent) {
		num = "0" + num
	}
	if len(num) == int(exponent) {
		return "0", num
	}
	high = num[:len(num)-int(exponent)]
	low = num[len(num)-int(exponent):]

	low = strings.TrimRightFunc(low, func(r rune) bool {
		return r == '0'
	})
	if low == "" {
		low = "0"
	}
	return
}

func init() {
	snapshotCmd.Flags().String(flagValidatorOperatorAddress, constants.DrBeValidatorOperationAddress, "validator operator address")
	snapshotCmd.Flags().String(flagRestApi, constants.RestApiDymension, "rest api endpoint to query data from")
	snapshotCmd.Flags().UintP(flagTransformMaxDelegation, "m", 1_000_000, "if the individual delegator stakes more than this number, use this number")
	snapshotCmd.Flags().Uint(flagMinDelegation, 10, "minimum stake required to be included into snapshot list")
	snapshotCmd.Flags().Uint(flagAllocate, 10_000, "total gift token shares to all delegators")
	snapshotCmd.Flags().Uint8(flagIndividualMax, 20, "percent of maximum token allocate to individual delegator")
	snapshotCmd.Flags().Uint8(flagTokenExponent, 6, "gift token decimals")
	snapshotCmd.Flags().String(flagBondDenom, "adym", "bond denom")
	snapshotCmd.Flags().Uint8(flagBondDenomExponent, 18, "bond denom decimals")
	snapshotCmd.Flags().String(flagTokenDenom, constants.DrBeIbcDenom, "token denom")
	snapshotCmd.Flags().String(flagTokenDistributor, constants.DrBeTokenDistributor, "token distribution from address")
	snapshotCmd.Flags().String(flagMemo, "", "custom memo to be included in the transaction")

	rootCmd.AddCommand(snapshotCmd)
}
