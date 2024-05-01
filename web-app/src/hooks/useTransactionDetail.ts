import { Erc20ContractInfo, Transaction, TxMode } from '@/consts/rpcResTypes';
import ErrorContext from '@/contexts/ErrorContext';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useContext, useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export default function useTransactionDetail(
  txHash: string
): [Transaction | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [{ rpcService }] = useRollappStore();
  const { showErrorSnackbar } = useContext(ErrorContext);
  const mounted = useMountedState();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Cannot find Rpc Service');

    if (txHash) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getTransactionByHash(txHash);
          ac = result[1];

          const _transaction = await getResponseResult(result[0]);
          if (_transaction) {
            _transaction.mode = TxMode.COSMOS;

            const evmTxInfo = _transaction.evmTx;
            const evmTxReceipt = _transaction.evmReceipt;
            if (evmTxInfo && evmTxReceipt) {
              const hasInput = evmTxInfo.input && evmTxInfo.input.length >= 10;
              const hasEvmLogs =
                evmTxReceipt.logs && evmTxReceipt.logs.length > 0;
              const uniqueContractAddresses = new Set<string>();
              if (evmTxInfo.to) {
                if (evmTxInfo.value && !hasInput && !hasEvmLogs) {
                  _transaction.mode = TxMode.EVM_GENERAL_TRANSFER;
                } else {
                  _transaction.mode = TxMode.EVM_CONTRACT_CALL;
                  uniqueContractAddresses.add(evmTxInfo.to);
                }
              } else {
                _transaction.mode = TxMode.EVM_CONTRACT_DEPLOY;
                if (
                  evmTxReceipt.contractAddress &&
                  evmTxReceipt.contractAddress.length > 0
                ) {
                  uniqueContractAddresses.add(evmTxReceipt.contractAddress);
                }
              }

              if (evmTxReceipt.logs.length > 0) {
                evmTxReceipt.logs.forEach(log => {
                  uniqueContractAddresses.add(log.address);
                });
              }

              if (
                _transaction.result?.success &&
                uniqueContractAddresses.size > 0
              ) {
                const contractAddressToErc20ContractInfo = new Map<
                  string,
                  Erc20ContractInfo
                >();
                const contractsAddress = Array.from(uniqueContractAddresses);

                const result2 =
                  rpcService.getErc20ContractInfo(contractsAddress);
                ac = result2[1];
                const _erc20ContractsInfo = await getResponseResult(result2[0]);

                for (let i = 0; i < _erc20ContractsInfo.length; i++) {
                  const erc20ContractInfo = _erc20ContractsInfo[i];
                  if (!erc20ContractInfo) {
                    continue;
                  }
                  contractAddressToErc20ContractInfo.set(
                    contractsAddress[i],
                    erc20ContractInfo
                  );
                }
                _transaction.evmContractAddressToErc20ContractInfo =
                  contractAddressToErc20ContractInfo;
              }
            }
          }

          setTransaction(_transaction);
          setLoading(false);
        } catch (e) {
          console.log(e);
          if (mounted.current)
            showErrorSnackbar('Failed to fetch Transaction Detail');
        } finally {
          ac = null;
          if (mounted.current) setLoading(false);
        }
      })();
    } else setTransaction(null);

    return () => {
      if (ac) ac.abort('useTransactionDetail cleanup');
    };
  }, [txHash, rpcService, showErrorSnackbar, mounted]);

  return [transaction, loading];
}
