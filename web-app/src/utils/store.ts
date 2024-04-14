import { RollappState } from '@/stores/rollappStore';
import { getRollappPathFromPathname } from './common';
import { RollappInfo } from './rollapp';
import { RpcService } from '@/services/rpc.service';

export function getSelectedRollappInfoByPathname(
  rollappInfos: RollappInfo[],
  pathname: string
) {
  const rollappPath = getRollappPathFromPathname(pathname);
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
  const selectedRollappInfo = getSelectedRollappInfoByPathname(
    rollappInfos,
    pathname
  );
  const rpcService = getRpcServiceFromSelectedRollappInfo(selectedRollappInfo);
  return {
    rollappInfos,
    selectedRollappInfo,
    rpcService,
  };
}
