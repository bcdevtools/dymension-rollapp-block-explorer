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

export interface Transaction {
  hash: string;
  height: number;
  msgs: Msg[];

  result: {
    code: number;
    events: Event[];
    gas: TransactionGas;
    success: boolean;
  };
}
