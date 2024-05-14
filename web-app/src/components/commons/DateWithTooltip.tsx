import { formatUnixTime, getTimeDurationDisplay } from '@/utils/datetime';
import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';
import React from 'react';

export default React.memo(function DateWithTooltip({
  showDateTime,
  unixTimestamp,
}: Readonly<{ showDateTime: boolean; unixTimestamp: number }>) {
  const timeUtc = formatUnixTime(unixTimestamp);
  const age = getTimeDurationDisplay(dayjs.unix(unixTimestamp));
  return (
    <Tooltip title={!showDateTime ? timeUtc : age} placement="top">
      <span>{showDateTime ? timeUtc : age}</span>
    </Tooltip>
  );
});
