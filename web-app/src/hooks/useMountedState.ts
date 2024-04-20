import { useEffect, useRef } from 'react';

export function useMountedState() {
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return mounted.current;
}
