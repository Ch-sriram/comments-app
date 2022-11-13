interface Storable<T = string> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  remove(key: string): T | null;
  purge(): void;
}

class Store implements Storable {
  private store = localStorage;

  // cannot instantiate this store -- Singleton
  private constructor() {}
  
  public static instance = new Store();
  
  get(key: string) {
    return this.store.getItem(key);
  }

  set(key: string, value: string) {
    this.store.setItem(key, value);
  }

  remove(key: string) {
    const itemValue = this.get(key);
    this.store.removeItem(key);
    return itemValue;
  }

  purge() {
    this.store.clear();
  }
}

export default Store;
