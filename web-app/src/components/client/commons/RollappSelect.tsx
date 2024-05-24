'use client';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl, { FormControlProps } from '@mui/material/FormControl';
import { useRollappStore } from '@/stores/rollappStore';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';

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
  size = 'medium',
  ...props
}: RollappSelectProps) {
  const [{ rollappInfos }] = useRollappStore(true);

  return (
    <FormControl {...props} size={size}>
      {label && (
        <InputLabel id="select-rollapp-label" size={size === 'medium' ? 'normal' : 'small'}>
          Rollapps
        </InputLabel>
      )}
      <Select
        value={value}
        onChange={onValueChange}
        labelId="select-rollapp-label"
        label={label && 'Rollapps'}
        size={size}>
        {rollappInfos.map(rollapp => {
          const isSelected = rollapp.path === value;
          return (
            <MenuItem key={rollapp.chain_id} value={rollapp.path}>
              <Typography variant="button" color={isSelected ? 'primary' : 'inherit'} marginRight={1}>
                <strong>{rollapp.name}</strong>
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {rollapp.chain_id}
              </Typography>
            </MenuItem>
          );
        })}
      </Select>
      {props.error && <FormHelperText>Required</FormHelperText>}
    </FormControl>
  );
});
