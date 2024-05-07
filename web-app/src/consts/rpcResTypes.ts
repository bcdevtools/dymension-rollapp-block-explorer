export interface RpcError {
  code: number;
  message: string;
}

export interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: RpcError;
}

export interface Bech32 {
  addr: string;
  cons: string;
  val: string;
}

export interface Fee {
  amount: { [key: string]: string };
  gasLimit: number;
}

// export interface Transaction {
//   code: number;
//   fee: Fee;
//   gasLimit: number;
//   gasUsed: number;
//   hash: string;
//   messages: string[];
//   type: string;
// }

export interface ChainInfo {
  bech32: Bech32;
  chainId: string;
  chainType: string;
  denoms: { [denom: string]: string };
  latestBlock: number;
  latestBlockTimeEpochUTC: number;
}

export interface LatestBlockNumber {
  latestBlock: number;
  latestBlockTimeEpochUTC: number;
}

export interface TransactionInBlock {
  code: number;
  fee: Fee;
  gasLimit: number;
  gasUsed: number;
  hash: string;
  messages: string[];
  type: string;
}

export interface Block {
  hash: string;
  height: number;
  timeEpochUTC: number;
  txs: TransactionInBlock[];
  proposer: {
    consensusAddress: string;
    moniker: string;
  };
}

export interface TransactionGas {
  limit: number;
  used: number;
}
export interface Event {
  type: string;
  attributes: { key: string; value: string }[];
}

export interface Msg {
  content: any;
  idx: number;
  type: string;
  protoContent: any;
}

export interface EvmTx {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  hash: string;
  input?: string;
  nonce: string;
  to?: string;
  transactionIndex: string;
  value?: string;
  type: string;
  accessList?: string[];
  chainId: string;
  v: string;
  r: string;
  s: string;
}

export interface EvmReceipt {
  blockHash: string;
  blockNumber: string;
  contractAddress?: string;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: EvmLog[];
  logsBloom: string;
  status: string;
  to?: string;
  transactionHash: string;
  transactionIndex: string;
  type: string;
}

export interface EvmLog {
  address: string;
  topics: string[];
  data: string;
  logIndex: string;
}

export const enum TxMode {
  COSMOS = 0,
  EVM_GENERAL_TRANSFER = 1,
  EVM_CONTRACT_CALL = 2,
  EVM_CONTRACT_DEPLOY = 3,
}

export interface Transaction {
  hash: string;
  height: number;
  msgs?: Msg[];
  evmTx?: EvmTx;
  evmReceipt?: EvmReceipt;
  mode: TxMode;
  evmContractAddressToErc20ContractInfo?: Map<string, Erc20ContractInfo>;

  result: {
    code: number;
    events: Event[];
    gas: TransactionGas;
    success: boolean;
  };
}

export interface AccountBalances {
  [denom: string]: string;
}

export interface DenomMetadata {
  denomUnits: { denom: string; exponent: number }[];
  base: string;
  name: string;
  symbol: string;
  highestExponent: number;
}

export interface DenomsMetadata {
  [denom: string]: DenomMetadata;
}

export interface Staking {
  [validator: string]: string;
}

export interface AccountStaking {
  rewards: string;
  staking: Staking | {};
}
export interface Account {
  address: { cosmos: string; evm: string };
  balances: AccountBalances;
  staking: AccountStaking;
  txsCount: number;
  typeUrl: string;
  contract?: ContractAccountInfo;
}

export interface Erc20ContractInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export interface ContractAccountInfo {
  name?: string;
  symbol?: string;
  decimals?: number;
}

export interface Erc20Balance {
  balance: string;
  contract: string;
  decimals: number;
  display: string;
}

export interface Erc20Balances {
  account: string;
  erc20Balances: Erc20Balance[];
}

export interface Cw20Balances {
  account: string;
  cw20Balances: Erc20Balance[];
}

export interface Validator {
  address: {
    consensusAddress: string;
    validatorAddress: string;
  };
  staking: {
    rewards: string;
    staking: Staking;
    validatorCommission: string;
    validatorOutstandingRewards: string;
  };
  validator: {
    commission: {
      commission_rates: {
        rate: string;
        max_rate: string;
        max_change_rate: string;
      };
      update_time: string;
    };
    consensusPubkey: { '@type': string; key: string };
    delegatorShares: string;
    description: {
      details: string;
      identity: string;
      moniker: string;
      securityContract: string;
      website: string;
    };
    jailed: boolean;
    minSelfDelegation: string;
    status: string;
    tokens: string;
    unbondingHeight: number;
    unbondingTime: string;
    votingPower: number;
  };
}

export interface ValidatorList {
  [validator: string]: {
    consAddress: string;
    pubKeyType: string;
    valAddress: string;
    votingPower: number;
    moniker: string;
    commission: string;
    tokens: string;
    tokensDecimals: number;
  };
}
