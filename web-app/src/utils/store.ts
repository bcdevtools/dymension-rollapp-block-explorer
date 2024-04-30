import { RollappState } from '@/stores/rollappStore';
import { getRollappPathFromPathname } from './common';
import { RollappInfo } from './rollapp';
import { RpcService } from '@/services/rpc.service';

export function getSelectedRollappInfoByPathname(
  rollappInfos: RollappInfo[],
  rollappPath: string
) {
  return (
    rollappInfos.find(rollappInfo => rollappInfo.path === rollappPath) || null
  );
}

export function getRpcServiceFromSelectedRollappInfo(
  selectedRollappInfo: RollappInfo | null
) {
  return selectedRollappInfo && selectedRollappInfo.be_json_rpc_urls.length
    ? new RpcService(selectedRollappInfo.be_json_rpc_urls[0])
    : null;
}

export function getInitialRollappState(
  rollappInfos: RollappInfo[],
  pathname: string
): RollappState {
  const rollappPath = getRollappPathFromPathname(pathname);
  const selectedRollappInfo = getSelectedRollappInfoByPathname(
    rollappInfos,
    rollappPath
  );
  console.log('selectedRollappInfo', selectedRollappInfo);
  const rpcService = getRpcServiceFromSelectedRollappInfo(selectedRollappInfo);
  return {
    rollappInfos,
    selectedRollappInfo,
    rpcService,
  };
}
