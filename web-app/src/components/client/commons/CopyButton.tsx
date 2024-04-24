'use client';

import IconButton from '@mui/material/IconButton';
import DoneIcon from '@mui/icons-material/Done';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import copy from 'copy-to-clipboard';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';

type CopyButtonProps = Readonly<{
  size: 'small' | 'medium' | 'large';
  textToCopy: string;
}>;

export default function CopyButton({ textToCopy, size }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = function () {
    copy(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Tooltip title={isCopied ? 'Copied' : 'Copy'} placement="top">
      <IconButton onClick={handleCopy} size={size}>
        {isCopied ? (
          <DoneIcon fontSize="inherit" color="secondary" />
        ) : (
          <ContentCopyIcon fontSize="inherit" color="secondary" />
        )}
      </IconButton>
    </Tooltip>
  );
}
