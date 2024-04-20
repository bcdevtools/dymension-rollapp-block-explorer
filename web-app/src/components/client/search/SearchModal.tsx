import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import Search from './Search';

type SearchModalProps = Readonly<{
  open: boolean;
  handleClose: () => void;
}>;

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  maxHeight: '100vh',
  [theme.breakpoints.up('sm')]: {
    width: 600,
    height: 650,
  },
}));

export default function SearchModal({ open, handleClose }: SearchModalProps) {
  return (
    <Modal
      open={open}
      onClose={() => handleClose()}
      sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
      <StyledCard>
        <CardContent sx={{ p: 0, height: '100%' }}>
          <Search onClear={handleClose} />
        </CardContent>
      </StyledCard>
    </Modal>
  );
}
