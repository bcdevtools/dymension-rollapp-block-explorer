import _Card, { CardProps as _CardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

type CardProps = Readonly<
  _CardProps & {
    children: React.ReactNode;
  }
>;

export default function Card({ children, ...props }: CardProps) {
  return (
    <_Card {...props} variant="outlined">
      <CardContent>{children}</CardContent>
    </_Card>
  );
}
