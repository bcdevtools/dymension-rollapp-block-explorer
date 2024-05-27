import { useEffect, useState } from 'react';

export function useThrowError(): (error: Error) => void {
  const [error, throwError] = useState<Error | null>(null);
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return throwError;
}
