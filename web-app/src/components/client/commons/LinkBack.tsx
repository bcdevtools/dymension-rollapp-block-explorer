'use client';

import Link from '@mui/material/Link';
import { useRouter } from 'next/navigation';

export default function LinkBack({
  title = 'Return back',
}: Readonly<{ title?: string }>): JSX.Element {
  const router = useRouter();
  return (
    <Link component="button" underline="hover" onClick={() => router.back()}>
      {title}
    </Link>
  );
}
