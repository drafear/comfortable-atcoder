import { Lock } from '../lib/lock';
import { sleep } from '../content/all';

export interface CreateNotificationParam {
  data: chrome.notifications.NotificationOptions;
  href: string;
}

export async function createNotification({ data, href }: CreateNotificationParam, lock: Lock) {
  let notificationId: string;
  await lock.acquire(async () => {
    await new Promise(resolve => {
      data.requireInteraction = true;
      const clickHandler = (id: string) => {
        if (id !== notificationId) {
          return;
        }
        chrome.tabs.create({ url: href });
      };
      chrome.notifications.onClicked.addListener(clickHandler);
      chrome.notifications.create(data, async id => {
        console.log('create', id);
        notificationId = id;
        await sleep(8000);
        chrome.notifications.clear(id);
        await sleep(1000);
        resolve();
      });
    });
  });
}
