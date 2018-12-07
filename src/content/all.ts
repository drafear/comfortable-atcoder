export function isEnable(storageKey: string): Promise<boolean> {
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

export async function domLoad(): Promise<void> {
  await new Promise(resolve => {
    $(() => {
      resolve();
    });
  });
}

export async function runIfEnableAndLoad(storageKey: string, fn: Function): Promise<void> {
  const [enable] = await Promise.all([isEnable(storageKey), domLoad()]);
  if (enable) {
    fn();
  }
}

export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export function createNotification(params: any): void {
  chrome.runtime.sendMessage({ type: 'create-notification', data: params });
}
