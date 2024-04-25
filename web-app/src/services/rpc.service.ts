import {
  Account,
  AccountBalances,
  Block,
  ChainInfo,
  Erc20ContractInfo,
  LatestBlockNumber,
  RpcResponse,
  Transaction,
} from '@/consts/rpcResTypes';
import {
  CallRpcOptions,
  RpcClient,
  getAccountBalancesParam,
  getAccountParam,
  getBlockByNumberParam,
  getChainInfoParam,
  getErc20ContractInfo,
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

  getErc20ContractInfo(
    contractAddress: string,
    callRpcOptions?: CallRpcOptions
  ): RpcResult<Erc20ContractInfo>;
  getErc20ContractInfo(
    contractAddress: string[],
    callRpcOptions?: CallRpcOptions
  ): RpcResult<Erc20ContractInfo[]>;
  getErc20ContractInfo(
    contractsAddress: string | string[],
    callRpcOptions?: CallRpcOptions
  ) {
    if (Array.isArray(contractsAddress))
      return this._rpcClient.callRpc(
        contractsAddress.map(contractAddress =>
          getErc20ContractInfo(contractAddress)
        ),
        callRpcOptions
      );
    else
      return this._rpcClient.callRpc(
        getErc20ContractInfo(contractsAddress),
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

  getAccountBalances(
    address: string,
    fetchOptions?: CallRpcOptions
  ): RpcResult<AccountBalances> {
    return this._rpcClient.callRpc(
      getAccountBalancesParam(address),
      fetchOptions
    );
  }

  getAccount(
    address: string,
    fetchOptions?: CallRpcOptions
  ): RpcResult<Account> {
    return this._rpcClient.callRpc(getAccountParam(address), fetchOptions);
  }
}
