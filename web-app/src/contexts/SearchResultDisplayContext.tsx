import React from 'react';

export type Columns = 1 | 2;

type SearchResultDisplayContextType = {
  displayColumns: Columns;
};

export default React.createContext<SearchResultDisplayContextType>({
  displayColumns: 1,
});
