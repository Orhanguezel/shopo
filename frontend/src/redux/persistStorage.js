"use client";

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const createLocalStorage = () => {
  return {
    getItem(key) {
      try {
        if (typeof window === "undefined") {
          return Promise.resolve(null);
        }
        const item = window.localStorage.getItem(key);
        return Promise.resolve(item);
      } catch (error) {
        console.log(`Error getting item ${key} from localStorage:`, error);
        return Promise.resolve(null);
      }
    },
    setItem(key, value) {
      try {
        if (typeof window === "undefined") {
          return Promise.resolve(value);
        }
        window.localStorage.setItem(key, value);
        return Promise.resolve(value);
      } catch (error) {
        console.log(`Error setting item ${key} to localStorage:`, error);
        return Promise.resolve(value);
      }
    },
    removeItem(key) {
      try {
        if (typeof window === "undefined") {
          return Promise.resolve();
        }
        window.localStorage.removeItem(key);
        return Promise.resolve();
      } catch (error) {
        console.log(`Error removing item ${key} from localStorage:`, error);
        return Promise.resolve();
      }
    },
  };
};

const persistStorage =
  typeof window !== "undefined" ? createLocalStorage() : createNoopStorage();

export default persistStorage;
