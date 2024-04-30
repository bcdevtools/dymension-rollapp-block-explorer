import { BalancesWithMetadata } from '@/utils/address';
import React from 'react';

type AccountContextType = {
  balancesWithMetadata: BalancesWithMetadata | null;
  loading: boolean;
};

export default React.createContext<AccountContextType>({
  balancesWithMetadata: null,
  loading: true,
});
