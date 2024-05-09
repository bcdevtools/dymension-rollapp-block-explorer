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

export function getDenomsMetadataParam(): RpcCallParam {
  return {
    method: 'be_getDenomsMetadata',
    params: [],
    jsonrpc: '2.0',
  };
}

export function getAccountParam(address: string): RpcCallParam {
  return {
    method: 'be_getAccount',
    params: [address],
    jsonrpc: '2.0',
  };
}

export function getValidatorParam(address: string): RpcCallParam {
  return {
    method: 'be_getValidatorAccount',
    params: [address],
    jsonrpc: '2.0',
  };
}

export function getValidatorsParam(): RpcCallParam {
  return {
    method: 'be_getValidators',
    params: [],
    jsonrpc: '2.0',
  };
}

export function getGovProposalsParam(page: number): RpcCallParam {
  return {
    method: 'be_getGovProposals',
    params: [page],
    jsonrpc: '2.0',
  };
}

export function getErc20BalanceParam(
  address: string,
  tokenAddresses: string[]
): RpcCallParam {
  return {
    method: 'evm_getErc20Balance',
    params: [address, tokenAddresses],
    jsonrpc: '2.0',
  };
}

export function getCw20BalanceParam(
  address: string,
  tokenAddresses: string[]
): RpcCallParam {
  return {
    method: 'evm_getCw20Balance',
    params: [address, tokenAddresses],
    jsonrpc: '2.0',
  };
}

export function getErc20ContractInfo(contractAddress: string): RpcCallParam {
  return {
    method: 'evm_getErc20ContractInfo',
    params: [contractAddress],
    jsonrpc: '2.0',
  };
}
