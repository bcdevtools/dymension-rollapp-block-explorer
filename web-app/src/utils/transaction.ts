import { Erc20ContractInfo, Transaction, TxMode } from '@/consts/rpcResTypes';
import { TransactionType } from '@/consts/transaction';
import { divideAmountByDecimals, hexToDec } from './number';

export function getMessageName(messageType: string) {
  if (/^([a-z\d]+\.)+Msg/.test(messageType)) {
    messageType = '/' + messageType;
  }
  switch (messageType) {
    case '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward':
      return 'Withdraw Reward';
    case '/cosmos.staking.v1beta1.MsgDelegate':
      return 'Delegate';
    case '/ethermint.evm.v1.MsgEthereumTx':
      return 'EVM';
    case '/evmos.erc20.v1.MsgConvertERC20':
      return 'Convert ERC20 token to IBC coin';
    case '/evmos.erc20.v1.MsgConvertCoin':
      return 'Convert IBC coin to ERC20 token';
    case '/cosmos.bank.v1beta1.MsgSend':
      return 'Send';
    case '/cosmos.bank.v1beta1.MsgMultiSend':
      return 'Multi Send';
    case '/ibc.applications.transfer.v1.MsgTransfer':
      return 'IBC Transfer';
    case '/cosmos.authz.v1beta1.MsgExec':
      return 'Exec';
    case '/ibc.core.channel.v1.MsgAcknowledgement':
      return 'IBC Acknowledgement';
    case '/ibc.core.client.v1.MsgUpdateClient':
      return 'IBC Update Client';
    case '/ibc.core.channel.v1.MsgRecvPacket':
      return 'IBC Receive';
    case '/cosmos.staking.v1beta1.MsgBeginRedelegate':
      return 'Re-Delegate';
    case '/cosmos.gov.v1beta1.MsgVote' || 'cosmos.gov.v1.MsgVote':
      return 'Vote';
    case '/cosmos.staking.v1beta1.MsgUndelegate':
      return 'Un-Stake';
    case '/cosmos.authz.v1beta1.MsgGrant':
      return 'Grant Permission';
    case '/cosmos.authz.v1beta1.MsgRevoke':
      return 'Revoke Permission';
    case '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission':
      return 'Withdraw Commission';
    case '/ibc.core.channel.v1.MsgTimeout':
      return 'IBC Msg Timeout';
    case '/cosmos.gov.v1beta1.MsgDeposit':
      return 'Gov Deposit';
    case '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress':
      return 'Set Withdrawal Address';
    case '/cosmos.staking.v1beta1.MsgCreateValidator':
      return 'Create Validator';
    case '/cosmos.staking.v1beta1.MsgEditValidator':
      return 'Edit Validator';
    case '/cosmos.gov.v1beta1.MsgSubmitProposal' ||
      'cosmos.gov.v1.MsgSubmitProposal':
      return 'Submit Proposal';
    case '/cosmos.slashing.v1beta1.MsgUnjail':
      return 'Unjail';
    case '/ibc.core.client.v1.MsgCreateClient':
      return 'IBC Create Client';
    case '/dymensionxyz.dymension.rollapp.MsgCreateRollapp':
      return 'Create RollApp';
    case '/dymensionxyz.dymension.rollapp.MsgUpdateState':
      return 'Update RollApp State';
    case '/dymensionxyz.dymension.sequencer.MsgCreateSequencer':
      return 'Create Sequencer RA';
    case '/dymensionxyz.dymension.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool':
      return 'Create Balancer Pool';
    case '/dymensionxyz.dymension.gamm.v1beta1.MsgJoinPool':
      return 'Join Pool';
    case '/dymensionxyz.dymension.gamm.v1beta1.MsgExitPool':
      return 'Exit Pool';
    case '/dymensionxyz.dymension.gamm.v1beta1.MsgSwapExactAmountIn':
      return 'Swap Exact Amt In';
    case '/dymensionxyz.dymension.gamm.v1beta1.MsgSwapExactAmountOut':
      return 'Swap Exact Amt Out';
    case '/dymensionxyz.dymension.gamm.v1beta1.MsgJoinSwapExternAmountIn':
      return 'Join Swap Exact Amt In';
    case '/dymensionxyz.dymension.gamm.v1beta1.MsgJoinSwapShareAmountOut':
      return 'Join Swap Share Amt Out';
    case '/dymensionxyz.dymension.gamm.v1beta1.MsgExitSwapShareAmountIn':
      return 'Exit Swap Share Amt In';
    case '/dymensionxyz.dymension.gamm.v1beta1.MsgExitSwapExternAmountOut':
      return 'Exit Swap Share Amt Out';
    case '/osmosis.incentives.MsgCreateGauge':
      return 'Create Gauge';
    case '/osmosis.incentives.MsgAddToGauge':
      return 'Add To Gauge';
    case '/osmosis.lockup.MsgLockTokens':
      return 'Lock Tokens';
    case '/osmosis.lockup.MsgBeginUnlockingAll':
      return 'Begin Unlocking ALL';
    case '/osmosis.lockup.MsgBeginUnlocking':
      return 'Begin Unlocking';
    case '/osmosis.lockup.MsgExtendLockup':
      return 'Extend Lockup';
    case '/osmosis.lockup.MsgForceUnlock':
      return 'Force Unlock';
    default:
      const matched = messageType.match(/[^.]+$/);
      return matched ? matched[0] : '';
  }
}

export const ctsRegex = /{\[{\s.\[address].\[([a-z\d]+)].\s}]}/g;

export const translateCts = (
  ctm: string,
  convertAddressToLink: (address: string, idx: number) => React.ReactNode
): React.ReactNode[] => {
  const splitted = ctm.split(ctsRegex);

  if (splitted.length === 1) return [ctm];
  if (splitted[0] === '') splitted.shift();

  return splitted.map((part, idx) => {
    if (idx % 2 === 1) return part;
    return convertAddressToLink(part, idx);
  });
};

export function getTransactionType(transaction: Transaction): TransactionType {
  switch (transaction.mode) {
    case TxMode.EVM_GENERAL_TRANSFER:
    case TxMode.EVM_CONTRACT_CALL:
    case TxMode.EVM_CONTRACT_DEPLOY:
      return 'evm';
    default:
      return 'cosmos';
  }
}

export function fromHexStringToEthereumValue(hexStr: string) {
  return divideAmountByDecimals(hexToDec(hexStr), 18).toString();
}

export function fromHexStringToEthereumGasPriceValue(hexStr: string) {
  return divideAmountByDecimals(hexToDec(hexStr), 9).toString();
}

export interface Erc20TransferEvent {
  type: 'Erc20TransferEvent';
  emiter: 'Transfer (ERC-20)';
  from: string;
  to: string;
  amount: string;
  rawAmount: boolean;
}

export function translateEvmLogIfPossible(
  topics: string[],
  data: string,
  emitter: string,
  contractAddressToErc20ContractInfo: Map<string, Erc20ContractInfo> | undefined
) {
  if (
    topics.length === 3 &&
    topics[0] ===
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' &&
    isTopicEvmAddress(topics[1]) &&
    isTopicEvmAddress(topics[2]) &&
    data.length === 66
  ) {
    const from = '0x' + topics[1].substring(26);
    const to = '0x' + topics[2].substring(26);
    const erc20ContractInfo = contractAddressToErc20ContractInfo?.get(emitter);
    const decimals = erc20ContractInfo?.decimals;
    return {
      type: 'Erc20TransferEvent',
      action: 'Transfer (ERC-20)',
      from: from,
      to: to,
      amount:
        erc20ContractInfo && decimals
          ? divideAmountByDecimals(hexToDec(data), decimals).toString()
          : data,
      rawAmount: !decimals,
    };
  }
  return null;
}

function isTopicEvmAddress(topic: string) {
  return topic.startsWith('0x000000000000000000000000');
}

export function getTxHashesQueryValue(txHash: string) {
  return txHash.startsWith('0x')
    ? [txHash.toLowerCase(), txHash.substring(2).toUpperCase()]
    : [`0x${txHash.toLowerCase()}`, txHash.toUpperCase()];
}
