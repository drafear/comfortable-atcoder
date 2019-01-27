export interface CreateNotificationParam {
  data: chrome.notifications.NotificationOptions;
  href: string;
}

export function createNotification({ data, href }: CreateNotificationParam) {
  console.log("notify!!:", data, href);
  let notificationId: string;
  chrome.notifications.create(data, id => {
    notificationId = id;
  });
  if (href) {
    const clickHandler = (id: string) => {
      if (id !== notificationId) {
        return;
      }
      chrome.tabs.create({ url: href });
    };
    const closeHandler = (id: string) => {
      if (id === notificationId) {
        chrome.notifications.onClosed.removeListener(closeHandler);
        chrome.notifications.clear(id);
      }
    };
    chrome.notifications.onClicked.addListener(clickHandler);
    chrome.notifications.onClosed.addListener(closeHandler);
  }
}
