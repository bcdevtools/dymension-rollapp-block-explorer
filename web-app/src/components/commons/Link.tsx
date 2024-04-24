import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link';

type LinkProps = Readonly<
  MuiLinkProps & {
    children: React.ReactNode;
  }
>;

export default function Link({
  children,
  fontWeight,
  underline,
  ...props
}: LinkProps) {
  return (
    <MuiLink
      fontWeight={fontWeight || 700}
      underline={underline || 'hover'}
      {...props}>
      {children}
    </MuiLink>
  );
}
