import { Lock } from '../lib/lock';
import { sleep } from '../content/all';

export interface CreateNotificationParam {
  data: chrome.notifications.NotificationOptions;
  href: string;
}

export async function createNotification({ data, href }: CreateNotificationParam, lock: Lock) {
  let notificationId: string;
  await lock.acquire(async () => {
    data.requireInteraction = true;
    const clickHandler = (id: string) => {
      if (id === notificationId) {
        chrome.tabs.create({ url: href });
      }
    };
    chrome.notifications.onClicked.addListener(clickHandler);
    // create notification and get notification id
    await new Promise(resolve => {
      chrome.notifications.create(data, async id => {
        notificationId = id;
        resolve();
      });
    });
    await sleep(8000);
    chrome.notifications.clear(notificationId);
    chrome.notifications.onClicked.removeListener(clickHandler);
    await sleep(1000);
  });
}
