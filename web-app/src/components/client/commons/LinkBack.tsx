'use client';

import Link from '@/components/commons/Link';
import { useRouter } from 'next/navigation';

export default function LinkBack({
  title = 'Return back',
}: Readonly<{ title?: string }>): JSX.Element {
  const router = useRouter();
  return (
    <Link component="button" onClick={() => router.back()}>
      {title}
    </Link>
  );
}
