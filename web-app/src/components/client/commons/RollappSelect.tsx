'use client';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl, { FormControlProps } from '@mui/material/FormControl';
import { useRollappStore } from '@/stores/rollappStore';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

type RollappSelectProps = Readonly<
  FormControlProps & {
    value: string;
    label?: string;
    onValueChange: (e: SelectChangeEvent) => void;
  }
>;

export default React.memo(function RollappSelect({
  value,
  label,
  onValueChange,
  ...props
}: RollappSelectProps) {
  const [{ rollappInfos }] = useRollappStore(true);

  return (
    <FormControl {...props}>
      {label && (
        <InputLabel id="select-rollapp-label" size="small">
          Rollapp
        </InputLabel>
      )}
      <Select
        value={value}
        onChange={onValueChange}
        labelId="select-rollapp-label"
        label={label && 'Rollapp'}
        size="small">
        {rollappInfos.map(rollapp => (
          <MenuItem key={rollapp.chainId} value={rollapp.path}>
            {rollapp.name}
          </MenuItem>
        ))}
      </Select>
      {props.error && <FormHelperText>Required</FormHelperText>}
    </FormControl>
  );
});
