import { MMKV } from 'react-native-mmkv'

class StorageServiceClass {
    #storage = new MMKV();

    setValue(key, value) {
        this.#storage.set(key, JSON.stringify(value));
    }

    getValue(key) {
        const value = this.#storage.getString(key);
        if (!value) return null;
        return JSON.parse(value);
    }
}

export const StorageService = new StorageServiceClass();