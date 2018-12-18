export interface CreateNotificationParam {
  data: chrome.notifications.NotificationOptions;
  href: string;
}

export function createNotification({ data, href }: CreateNotificationParam) {
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
    const closeHandler = () => {
      chrome.notifications.onClicked.removeListener(clickHandler);
      chrome.notifications.onClosed.removeListener(closeHandler);
    };
    chrome.notifications.onClicked.addListener(clickHandler);
    chrome.notifications.onClosed.addListener(closeHandler);
  }
}

chrome.runtime.onMessage.addListener(({ type, data }) => {
  if (type === 'create-notification') {
    createNotification(data);
  }
});