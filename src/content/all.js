window.CommonLib = class {
  static async runIfEnableAndLoad(storageKey, fn) {
    const [isEnable] = await Promise.all([CommonLib.isEnable(storageKey), CommonLib.domLoad()]);
    if (isEnable) {
      fn();
    }
  }

  static isEnable(storageKey) {
    return new Promise(resolve => {
      chrome.storage.sync.get([storageKey], result => {
        if (storageKey in result) {
          resolve(Boolean(result[storageKey]));
        } else {
          resolve(false);
        }
      });
    });
  }

  static domLoad() {
    return new Promise(resolve => {
      $(() => {
        resolve();
      });
    });
  }
};
