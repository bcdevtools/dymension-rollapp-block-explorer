import {
  Account,
  AccountBalances,
  Block,
  ChainInfo,
  Cw20Balances,
  DenomsMetadata,
  Erc20Balances,
  Erc20ContractInfo,
  GovProposal,
  GovProposals,
  LatestBlockNumber,
  RpcResponse,
  Transaction,
  Validator,
  ValidatorList,
} from '@/consts/rpcResTypes';
import {
  CallRpcOptions,
  RpcClient,
  getAccountBalancesParam,
  getAccountParam,
  getBlockByNumberParam,
  getChainInfoParam,
  getCw20BalanceParam,
  getDenomsMetadataParam,
  getErc20BalanceParam,
  getErc20ContractInfo,
  getGovProposalParam,
  getGovProposalsParam,
  getLatestBlockNumber,
  getTransactionByHashParam,
  getValidatorParam,
  getValidatorsParam,
} from '@/utils/rpc';

export function getResponseResult<T>(
  rpcPromise: Promise<RpcResponse<T>>,
  throwError?: boolean
): Promise<T>;
export function getResponseResult<T>(
  rpcPromise: Promise<RpcResponse<any>[]>,
  throwError?: boolean
): Promise<any[]>;
export async function getResponseResult<T>(
  rpcPromise: Promise<RpcResponse<T> | RpcResponse<any>[]>,
  throwError = true
) {
  const response = await rpcPromise;
  if (Array.isArray(response)) {
    if (response.some(res => res.error) && throwError)
      throw new Error(
        JSON.stringify(response.filter(res => res.error).map(res => res.error))
      );
    const result = response.map(res => res.result || { error: res.error });
    return result;
  } else {
    if (response.error) {
      if (throwError) throw new Error(JSON.stringify(response.error));
      return { error: response.error };
    }
    return response.result;
  }
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

  getDenomsMetadata(fetchOptions?: CallRpcOptions): RpcResult<DenomsMetadata> {
    return this._rpcClient.callRpc(getDenomsMetadataParam(), fetchOptions);
  }

  getAccount(
    address: string,
    callRpcOptions?: CallRpcOptions
  ): RpcResult<Account>;
  getAccount(
    addresses: string[],
    callRpcOptions?: CallRpcOptions
  ): RpcResult<Account[]>;
  getAccount(address: string | string[], callRpcOptions?: CallRpcOptions) {
    if (Array.isArray(address))
      return this._rpcClient.callRpc(
        address.map(a => getAccountParam(a)),
        callRpcOptions
      );
    else
      return this._rpcClient.callRpc(getAccountParam(address), callRpcOptions);
  }

  getValidator(
    address: string,
    callRpcOptions?: CallRpcOptions
  ): RpcResult<Validator> {
    return this._rpcClient.callRpc(getValidatorParam(address), callRpcOptions);
  }

  getValidators(callRpcOptions?: CallRpcOptions): RpcResult<ValidatorList> {
    return this._rpcClient.callRpc(getValidatorsParam(), callRpcOptions);
  }

  getGovProposals(
    page: number,
    callRpcOptions?: CallRpcOptions
  ): RpcResult<GovProposals> {
    return this._rpcClient.callRpc(getGovProposalsParam(page), callRpcOptions);
  }

  getGovProposal(
    id: number,
    callRpcOptions?: CallRpcOptions
  ): RpcResult<GovProposal> {
    return this._rpcClient.callRpc(getGovProposalParam(id), callRpcOptions);
  }

  getErc20Balance(
    address: string,
    tokenAddresses: string[],
    fetchOptions?: CallRpcOptions
  ): RpcResult<Erc20Balances> {
    return this._rpcClient.callRpc(
      getErc20BalanceParam(address, tokenAddresses),
      fetchOptions
    );
  }

  getCw20Balance(
    address: string,
    tokenAddresses: string[],
    fetchOptions?: CallRpcOptions
  ): RpcResult<Cw20Balances> {
    return this._rpcClient.callRpc(
      getCw20BalanceParam(address, tokenAddresses),
      fetchOptions
    );
  }
}
