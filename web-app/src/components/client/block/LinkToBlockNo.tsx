'use client';

import Link from '@/components/commons/Link';
import { Path } from '@/consts/path';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';

type LinkTopBlockNoProps = Readonly<{
  blockNo: number | string;
}>;

export default function LinkToBlockNo({ blockNo }: LinkTopBlockNoProps) {
  const pathname = usePathname();
  return (
    <Link href={`${getNewPathByRollapp(pathname, Path.BLOCKS)}/${blockNo}`}>
      {blockNo}
    </Link>
  );
}
