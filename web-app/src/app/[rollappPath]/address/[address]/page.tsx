import AddressTransactionsSection from '@/components/client/address/AddressTransactionsSection';
import AddressSummary from '@/components/client/address/AddressSummary';
import CopyButton from '@/components/client/commons/CopyButton';
import PageTitle from '@/components/commons/PageTitle';
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
import { permanentRedirect } from 'next/navigation';
import { JsonObject } from '@prisma/client/runtime/library';
import {
  ChainType,
  PAGE_PARAM_NAME,
  PAGE_SIZE_PARAM_NAME,
} from '@/consts/setting';
import {
  AccountTransactionFilterOption,
  countAccountTransactions,
  getAccountTransactions,
} from '@/services/db/accounts';
import TransactionListTable from '@/components/client/transaction/TransactionListTable';

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

  const { address } = params;

  const prefix = (rollappInfo.bech32 as JsonObject).addr as string;
  const rollappAddress = RollappAddress.fromString(
    address.toLowerCase(),
    prefix,
    rollappInfo.chain_type === ChainType.EVM
  );
  if (!rollappAddress) return permanentRedirect(`/${params.rollappPath}`);

  const isEVMChain = rollappInfo.chain_type === ChainType.EVM;
  const bech32Address = rollappAddress.toBech32();
  const evmAddress = isEVMChain ? rollappAddress.toHex() : null;

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
    { take: pageSize, skip: getOffsetFromPageAndPageSize(page, pageSize) }
  );

  return (
    <>
      <PageTitle
        title="Account"
        subtitle={
          <>
            {bech32Address}
            <CopyButton size="small" textToCopy={bech32Address} />
            {isEVMChain && (
              <>
                <br />
                {evmAddress}
                <CopyButton size="small" textToCopy={evmAddress!} />
              </>
            )}
          </>
        }
      />
      <AddressSummary address={bech32Address} />
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
