'use client';

import ErrorPage, { ErrorProps } from 'next/error';

export default function Error(props: ErrorProps) {
  return <ErrorPage {...props} />;
}
