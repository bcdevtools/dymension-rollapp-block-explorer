import { formatUnixTime, getTimeDurationDisplay } from '@/utils/datetime';
import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

export default React.memo(function DateWithTooltip({
  showDateTime = false,
  unixTimestamp,
  onClick = () => {},
}: Readonly<{
  showDateTime?: boolean;
  unixTimestamp: number;
  onClick?: () => void;
}>) {
  const timeUtc = formatUnixTime(unixTimestamp);
  const [age, setAge] = useState<string>('-');

  useEffect(() => {
    if (!showDateTime) {
      const getAge = function () {
        setAge(getTimeDurationDisplay(dayjs.unix(unixTimestamp)));
      };
      getAge();
      const intervalId = setInterval(getAge, 1000);
      return () => clearInterval(intervalId);
    }
  }, [unixTimestamp, showDateTime]);

  return (
    <Tooltip
      title={!showDateTime ? timeUtc : age}
      placement="top"
      onClick={onClick}>
      <span style={{ cursor: 'pointer' }}>{showDateTime ? timeUtc : age}</span>
    </Tooltip>
  );
});
