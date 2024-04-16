# Delegation Snapshot helper

```bash
dessd snapshot [block number] \
  [--valoper dymvaloper1s3fpgacm368dfyn4rmg2qv3h07cmdhr63e59yk] \ -- validator address to capture snapshot
  [--rest https://dymension-api.polkachu.com] \ -- rest server to query data
  [--transform-max 1000000] \ -- if the individual delegator stakes more than this number, use this number
  [--individual-max 20] \ -- percent of maximum token allocate to individual delegator
  [--min 10] \ -- minimum stake required to be included into snapshot list
  [--allocate 10000] \ -- total gift-token shares to all delegators
  [--token-exponent 6] \ -- decimals of the gift-token
  [--token-denom ibc/5620289B0E1106C8A2421F212FEC4EB19E3CBA964662DB61754CCDE8FAAC29FF] \ -- gift-token denom to distribute
  [--bond-denom adym] \
  [--bond-exponent 18] \
  [--from dym1s3fpgacm368dfyn4rmg2qv3h07cmdhr6jjg86v] \ -- account address to distribute gift-token
  [--memo "Gift token distribution"] -- custom memo for the tx
```