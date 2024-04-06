import { RollappState } from '@/stores/rollappStore';
import { getRollappPathFromPathname } from './common';
import { RollappInfo } from './rollappInfo';

export function getSelectedRollappInfoByPathname(
  rollappInfos: RollappInfo[],
  pathname: string
) {
  const rollappPath = getRollappPathFromPathname(pathname);
  return (
    rollappInfos.find(rollappInfo => rollappInfo.path === rollappPath) || null
  );
}

export function getInitialRollappState(
  rollappInfos: RollappInfo[],
  pathname: string
): RollappState {
  return {
    rollappInfos,
    selectedRollappInfo: getSelectedRollappInfoByPathname(
      rollappInfos,
      pathname
    ),
  };
}
