type RpcCallParam = {
  method: string;
  params: any[];
  jsonrpc: string;
};

type RpcCallParamFull = RpcCallParam & { id: number };

export type FetchOptions = {
  cache?: RequestCache;
  signal?: AbortSignal;
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

  callRpc(param: RpcCallParam, fetchOptions?: FetchOptions): Promise<any>;
  callRpc(params: RpcCallParam[], fetchOptions?: FetchOptions): Promise<any[]>;
  callRpc(params: RpcCallParam | RpcCallParam[], fetchOptions?: FetchOptions) {
    const paramFulls = !Array.isArray(params)
      ? { ...params, id: 1 }
      : params.map((param, i) => ({ ...param, id: i + 1 }));

    return this._callRpc(fetchOptions, paramFulls);
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
