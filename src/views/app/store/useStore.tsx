import Store from './Store';

interface LocalStore {
  store: Store;
}

const useStore: () => LocalStore = () => {
  return { store: Store.instance };
};

export default useStore;
