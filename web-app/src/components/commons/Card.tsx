import _Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

type CardProps = Readonly<{
  children: React.ReactNode;
}>;

export default function Card({ children }: CardProps) {
  return (
    <_Card variant="outlined">
      <CardContent>{children}</CardContent>
    </_Card>
  );
}
