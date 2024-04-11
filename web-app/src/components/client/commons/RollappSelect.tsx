'use client';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { useRollappStore } from '@/stores/rollappStore';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import InputLabel from '@mui/material/InputLabel';

type RollappSelectProps = Readonly<{
  fullWidth?: boolean;
  value: string;
  label?: string;
  onChange: (e: SelectChangeEvent) => void;
}>;

export default React.memo(function RollappSelect({
  fullWidth,
  value,
  label,
  onChange,
}: RollappSelectProps) {
  const [{ rollappInfos }] = useRollappStore(true);

  return (
    <FormControl fullWidth={fullWidth || false}>
      {label && (
        <InputLabel id="select-rollapp-label" size="small">
          Rollapp
        </InputLabel>
      )}
      <Select
        value={value}
        onChange={onChange}
        labelId="select-rollapp-label"
        label={label && 'Rollapp'}
        size="small">
        {rollappInfos.map(rollapp => (
          <MenuItem key={rollapp.chainId} value={rollapp.path}>
            {rollapp.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
