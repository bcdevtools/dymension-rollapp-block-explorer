import Typography from '@mui/material/Typography';

type PageTitleProps = Readonly<{
  title: string;
}>;

export default function PageTitle({ title }: PageTitleProps) {
  return (
    <Typography variant="h5">
      <b>{title}</b>
    </Typography>
  );
}
