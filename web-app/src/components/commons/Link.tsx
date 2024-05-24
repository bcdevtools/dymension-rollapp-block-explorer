import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link';
import { LinkProps as NextLinkProps } from 'next/link';

type LinkProps = Readonly<
  MuiLinkProps &
    NextLinkProps & {
      children: React.ReactNode;
    }
>;

export default function Link({
  children,
  fontWeight = 700,
  underline = 'hover',
  prefetch = false,
  ...props
}: LinkProps) {
  return <MuiLink {...{ ...props, fontWeight, underline, prefetch }}>{children}</MuiLink>;
}
