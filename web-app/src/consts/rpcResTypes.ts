export interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
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

export interface Transaction {
  code: number;
  fee: Fee;
  gasLimit: number;
  gasUsed: number;
  hash: string;
  messages: string[];
  type: string;
}

export interface ChainInfo {
  bech32: Bech32;
  chainId: string;
  chainType: string;
  denoms: object;
  latestBlock: number;
  latestBlockTimeEpochUTC: number;
}

export interface LatestBlockNumber {
  latestBlock: number;
  latestBlockTimeEpochUTC: number;
}

export interface Block {
  hash: string;
  height: number;
  timeEpochUTC: number;
  txs: Transaction[];
}
