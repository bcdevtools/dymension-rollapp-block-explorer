import MuiCard, { CardProps as MuiCardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

type CardProps = Readonly<
  MuiCardProps & {
    children: React.ReactNode;
  }
>;

export default function Card({ children, ...props }: CardProps) {
  return (
    <MuiCard {...props} variant="outlined">
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
}
