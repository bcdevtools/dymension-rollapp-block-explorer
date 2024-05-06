'use client';

import useValidator from '@/hooks/useValidator';

type ValidatorProps = Readonly<{ bech32Address: string }>;

export default function Validator({ bech32Address }: ValidatorProps) {
  const [validator, loading] = useValidator(bech32Address);
  return <></>;
}
