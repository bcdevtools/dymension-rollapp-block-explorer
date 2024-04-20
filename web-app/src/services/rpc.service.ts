import {
  Block,
  ChainInfo,
  LatestBlockNumber,
  RpcResponse,
  Transaction,
} from '@/consts/rpcResTypes';
import {
  CallRpcOptions,
  RpcClient,
  getBlockByNumberParam,
  getChainInfoParam,
  getLatestBlockNumber,
  getTransactionByHashParam,
} from '@/utils/rpc';

export function getResponseResult<T>(
  rpcPromise: Promise<RpcResponse<T>>
): Promise<T>;
export function getResponseResult<T>(
  rpcPromise: Promise<RpcResponse<any>[]>
): Promise<any[]>;
export async function getResponseResult<T>(
  rpcPromise: Promise<RpcResponse<T> | RpcResponse<any>[]>
) {
  const response = await rpcPromise;
  return Array.isArray(response)
    ? response.map(res => res.result)
    : response.result;
}

type RpcResult<T> = [Promise<RpcResponse<T>>, AbortController];

export class RpcService {
  private _rpcClient: RpcClient;

  constructor(rpcUrl: string) {
    this._rpcClient = new RpcClient(rpcUrl);
  }

  getChainInfo(callRpcOptions?: CallRpcOptions): RpcResult<ChainInfo> {
    return this._rpcClient.callRpc(getChainInfoParam(), callRpcOptions);
  }

  getLatestBlockNumber(
    callRpcOptions?: CallRpcOptions
  ): RpcResult<LatestBlockNumber> {
    return this._rpcClient.callRpc(getLatestBlockNumber(), callRpcOptions);
  }

  getBlockByNumber(
    blockNumber: number,
    callRpcOptions?: CallRpcOptions
  ): RpcResult<Block>;
  getBlockByNumber(
    blockNumber: number[],
    callRpcOptions?: CallRpcOptions
  ): RpcResult<Block[]>;
  getBlockByNumber(
    blockNumbers: number | number[],
    callRpcOptions?: CallRpcOptions
  ) {
    if (Array.isArray(blockNumbers))
      return this._rpcClient.callRpc(
        blockNumbers.map(blockNo => getBlockByNumberParam(blockNo)),
        callRpcOptions
      );
    else
      return this._rpcClient.callRpc(
        getBlockByNumberParam(blockNumbers),
        callRpcOptions
      );
  }

  getTransactionByHash(
    txHash: string,
    callRpcOptions?: CallRpcOptions
  ): RpcResult<Transaction> {
    return this._rpcClient.callRpc(
      getTransactionByHashParam(txHash),
      callRpcOptions
    );
  }
}
