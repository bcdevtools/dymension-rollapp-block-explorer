import { useState, useEffect } from 'react';

export type StoreActions<S> = {
  [key: string]: (
    globalState: S,
    payload?: any
  ) => Promise<Partial<S>> | Partial<S>;
};

export class Store<S, A extends StoreActions<S>> {
  state: S;
  listeners: Array<React.Dispatch<S>> = [];
  actions: A;

  constructor(state: S, actions: A) {
    this.state = state;
    this.actions = actions;
  }
}

type Dispatch<A> = (actionIdentifier: keyof A, payload?: any) => Promise<void>;

export const useStore = <S, A extends StoreActions<S>>(
  store: Store<S, A>,
  shouldListen: boolean = true
): [S, Dispatch<A>] => {
  const [, setState] = useState(store.state);

  const dispatch: Dispatch<A> = async function (actionIdentifier, payload) {
    const newState = await store.actions[actionIdentifier](
      store.state,
      payload
    );
    store.state = { ...store.state, ...newState };

    store.listeners.forEach(listener => listener(store.state));
  };

  useEffect(() => {
    if (shouldListen) {
      store.listeners.push(setState);
    }

    return () => {
      if (shouldListen) {
        store.listeners = store.listeners.filter(li => li !== setState);
      }
    };
  }, [store, setState, shouldListen]);

  return [store.state, dispatch];
};
