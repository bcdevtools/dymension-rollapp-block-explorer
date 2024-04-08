import {
  Block,
  ChainInfo,
  LatestBlockNumber,
  RpcResponse,
} from '@/consts/rpcResTypes';
import {
  FetchOptions,
  RpcClient,
  getBlockByNumberParam,
  getChainInfoParam,
  getLatestBlockNumber,
} from '@/utils/rpc';

function getResponseResult<T>(response: RpcResponse<T>): T;
function getResponseResult<T>(response: RpcResponse<any>[]): any[];
function getResponseResult<T>(response: RpcResponse<T> | RpcResponse<any>[]) {
  return Array.isArray(response)
    ? response.map(res => res.result)
    : response.result;
}

export class RpcService {
  private _rpcClient: RpcClient;

  constructor(rpcUrl: string) {
    this._rpcClient = new RpcClient(rpcUrl);
  }

  async getChainInfo(fetchOptions?: FetchOptions): Promise<ChainInfo> {
    const response: RpcResponse<ChainInfo> = await this._rpcClient.callRpc(
      getChainInfoParam(),
      fetchOptions
    );
    return getResponseResult(response);
  }

  async getLatestBlockNumber(
    fetchOptions?: FetchOptions
  ): Promise<LatestBlockNumber> {
    const response: RpcResponse<LatestBlockNumber> =
      await this._rpcClient.callRpc(getLatestBlockNumber(), fetchOptions);
    return getResponseResult(response);
  }

  getBlockByNumber(
    blockNumber: number,
    fetchOptions?: FetchOptions
  ): Promise<Block>;
  getBlockByNumber(
    blockNumber: number[],
    fetchOptions?: FetchOptions
  ): Promise<Block[]>;
  async getBlockByNumber(
    blockNumbers: number | number[],
    fetchOptions?: FetchOptions
  ) {
    if (Array.isArray(blockNumbers)) {
      const response: RpcResponse<Block>[] = await this._rpcClient.callRpc(
        blockNumbers.map(blockNo => getBlockByNumberParam(blockNo)),
        fetchOptions
      );
      return getResponseResult(response);
    } else {
      const response: RpcResponse<Block> = await this._rpcClient.callRpc(
        getBlockByNumberParam(blockNumbers),
        fetchOptions
      );
      return getResponseResult(response);
    }
  }
}
