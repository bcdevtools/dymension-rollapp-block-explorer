import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

type BlockProps = Readonly<{
  params: { blockNo: string };
}>;

export default function Block({ params }: BlockProps) {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/blocks">
          Block
        </Link>
        <Typography color="text.primary">{params.blockNo}</Typography>
      </Breadcrumbs>
    </>
  );
}
