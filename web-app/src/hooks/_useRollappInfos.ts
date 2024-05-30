import { useRollappStore } from '@/stores/rollappStore';
import { RollappInfo, getFavoriteRollapps } from '@/utils/rollapp';
import { useCallback, useEffect, useState } from 'react';

export function useRollappInfos(): [RollappInfo[], () => void] {
  const [{ rollappInfos }] = useRollappStore();
  const [sortedRollappInfos, setSortedRollappInfos] = useState<RollappInfo[]>(rollappInfos);

  const updateSortedRollappInfos = useCallback(() => {
    const favoriteRollapp = getFavoriteRollapps();
    setSortedRollappInfos(
      rollappInfos
        .map(rollappInfo => ({ ...rollappInfo, isFavorite: !!favoriteRollapp[rollappInfo.chain_id] }))
        .sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (b.isFavorite && !a.isFavorite) return 1;
          return a.name.localeCompare(b.name);
        }),
    );
  }, [rollappInfos]);

  useEffect(() => updateSortedRollappInfos(), [rollappInfos, updateSortedRollappInfos]);

  return [sortedRollappInfos, updateSortedRollappInfos];
}
