import { formatUnixTime, getTimeDurationDisplay } from '@/utils/datetime';
import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';
import React from 'react';

export default React.memo(function DateWithTooltip({
  showDateTime,
  unixTimestamp,
  onClick,
}: Readonly<{
  showDateTime: boolean;
  unixTimestamp: number;
  onClick: () => void;
}>) {
  const timeUtc = formatUnixTime(unixTimestamp);
  const age = getTimeDurationDisplay(dayjs.unix(unixTimestamp));
  return (
    <Tooltip
      title={!showDateTime ? timeUtc : age}
      placement="top"
      onClick={onClick}>
      <span style={{ cursor: 'pointer' }}>{showDateTime ? timeUtc : age}</span>
    </Tooltip>
  );
});