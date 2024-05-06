import AddressTransactionsSection from '@/components/client/address/AddressTransactionsSection';
import {
  AddressPageSearchParams,
  AddressTransactionType,
} from '@/consts/addressPage';
import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import { RollappAddress } from '@/utils/address';
import {
  SearchParam,
  getOffsetFromPageAndPageSize,
  getPageAndPageSizeFromStringParam,
} from '@/utils/common';
import { redirect } from 'next/navigation';
import { JsonObject } from '@prisma/client/runtime/library';
import {
  ChainType,
  PAGE_PARAM_NAME,
  PAGE_SIZE_PARAM_NAME,
} from '@/consts/setting';
import {
  AccountTransactionFilterOption,
  countAccountTransactions,
  getAccount,
  getAccountTransactions,
} from '@/services/db/accounts';
import TransactionListTable from '@/components/client/transaction/TransactionListTable';
import AddressPageTitleAndSummary from '@/components/client/address/AddressPage';
import { AddressPageTitle } from '@/components/client/address/AddressPageTitle';
import ValidatorDetail from '@/components/client/address/ValidatorDetail';

type AddressProps = Readonly<{
  params: { address: string; rollappPath: string };
  searchParams: {
    [PAGE_SIZE_PARAM_NAME]: SearchParam;
    [PAGE_PARAM_NAME]: SearchParam;
    [AddressPageSearchParams.TX_TYPE]: SearchParam;
  };
}>;

function getFilterOptionsFromTxType(
  txType: SearchParam
): AccountTransactionFilterOption {
  switch (txType) {
    case AddressTransactionType.SENT_TRANSACTIONS:
      return { signer: true };
    case AddressTransactionType.ERC20_TRANSFER:
      return { erc20: true };
    case AddressTransactionType.NFT_TRANSFER:
      return { nft: true };
    case AddressTransactionType.TRANSACTIONS:
    default:
      return {};
  }
}

export default async function Address({ params, searchParams }: AddressProps) {
  const rollappInfo = (await getRollAppInfoByRollappPath(params.rollappPath))!;

  let { address } = params;
  address = address.toLowerCase();

  const isEVMChain = rollappInfo.chain_type === ChainType.EVM;

  let isValidator = false;
  let prefix = (rollappInfo.bech32 as JsonObject).addr as string;
  let rollappAddress = RollappAddress.fromString(address, prefix, isEVMChain);
  if (!rollappAddress) {
    prefix = (rollappInfo.bech32 as JsonObject).val as string;
    rollappAddress = RollappAddress.fromString(address, prefix, isEVMChain);
    isValidator = true;
  }

  if (!rollappAddress) return redirect(`/${params.rollappPath}`);

  const bech32Address = rollappAddress.toBech32();
  const evmAddress = isEVMChain ? rollappAddress.toHex() : null;

  const [accountInfo, transactionResult] = await Promise.all([
    getAccount(rollappInfo.chain_id, bech32Address),
    !isValidator
      ? (async function () {
          const filterOptions = getFilterOptionsFromTxType(
            searchParams[AddressPageSearchParams.TX_TYPE]
          );
          const totalTransactions = await countAccountTransactions(
            rollappInfo.chain_id,
            bech32Address,
            filterOptions
          );

          const [pageSize, page] = getPageAndPageSizeFromStringParam(
            searchParams[PAGE_SIZE_PARAM_NAME],
            searchParams[PAGE_PARAM_NAME],
            totalTransactions
          );

          const accountTransactions = await getAccountTransactions(
            rollappInfo.chain_id,
            bech32Address,
            filterOptions,
            {
              take: pageSize,
              skip: getOffsetFromPageAndPageSize(page, pageSize),
            }
          );

          return { accountTransactions, totalTransactions, pageSize, page };
        })()
      : null,
  ]);

  if (isValidator) {
    return (
      <>
        <AddressPageTitle
          bech32Address={bech32Address}
          evmAddress={evmAddress}
          isValidator
        />
        <ValidatorDetail bech32Address={bech32Address} />
      </>
    );
  }

  const { accountTransactions, totalTransactions, pageSize, page } =
    transactionResult!;

  return (
    <>
      <AddressPageTitleAndSummary
        bech32Address={bech32Address}
        evmAddress={evmAddress}
        accountInfo={accountInfo}
      />
      <AddressTransactionsSection
        txType={searchParams.txType as AddressTransactionType}>
        <TransactionListTable
          transactions={accountTransactions.map(i => ({
            ...i.recent_accounts_transaction,
            tx_type: 'TODO',
          }))}
          totalTransactions={totalTransactions}
          pageSize={pageSize}
          page={page}
        />
      </AddressTransactionsSection>
    </>
  );
}
