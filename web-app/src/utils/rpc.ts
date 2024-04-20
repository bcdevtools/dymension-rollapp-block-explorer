type RpcCallParam = {
  method: string;
  params: any[];
  jsonrpc: string;
};

type RpcCallParamFull = RpcCallParam & { id: number };

type FetchOptions = {
  signal?: AbortSignal;
} & CallRpcOptions;

export type CallRpcOptions = {
  cache?: RequestCache;
};

export class RpcClient {
  protected _rpcUrl: string;
  constructor(rpcUrl: string) {
    this._rpcUrl = rpcUrl;
  }
  protected async _callRpc(
    fetchOptions: FetchOptions = {},
    body: RpcCallParamFull | RpcCallParamFull[]
  ) {
    const res = await fetch(this._rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      ...fetchOptions,
    });
    return res.json();
  }

  callRpc(
    param: RpcCallParam,
    callRpcOptions?: CallRpcOptions
  ): [Promise<any>, AbortController];
  callRpc(
    params: RpcCallParam[],
    callRpcOptions?: CallRpcOptions
  ): [Promise<any[]>, AbortController];
  callRpc(
    params: RpcCallParam | RpcCallParam[],
    callRpcOptions?: CallRpcOptions
  ) {
    const ac = new AbortController();
    const paramFulls = !Array.isArray(params)
      ? { ...params, id: 1 }
      : params.map((param, i) => ({ ...param, id: i + 1 }));

    return [
      this._callRpc({ ...callRpcOptions, signal: ac.signal }, paramFulls),
      ac,
    ];
  }
}

export function getChainInfoParam() {
  return {
    method: 'be_getChainInfo',
    params: [],
    jsonrpc: '2.0',
  };
}

export function getLatestBlockNumber() {
  return {
    method: 'be_getLatestBlockNumber',
    params: [],
    jsonrpc: '2.0',
  };
}

export function getBlockByNumberParam(blockNo: number): RpcCallParam {
  return {
    method: 'be_getBlockByNumber',
    params: [blockNo],
    jsonrpc: '2.0',
  };
}

export function getTransactionByHashParam(txHash: string): RpcCallParam {
  return {
    method: 'be_getTransactionByHash',
    params: [txHash],
    jsonrpc: '2.0',
  };
}

export function getAccountBalancesParam(address: string): RpcCallParam {
  return {
    method: 'be_getAccountBalances',
    params: [address],
    jsonrpc: '2.0',
  };
}
