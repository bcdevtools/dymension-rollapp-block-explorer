import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import IconButton from '@mui/material/IconButton';
import { QRCodeCanvas } from 'qrcode.react';
import Modal from '@mui/material/Modal';
import { useState } from 'react';

export default function QRCodeButton({ value }: Readonly<{ value: string }>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <QrCodeScannerIcon fontSize="inherit" color="secondary" />
      </IconButton>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}>
        <QRCodeCanvas value={value} size={250} />
      </Modal>
    </>
  );
}
