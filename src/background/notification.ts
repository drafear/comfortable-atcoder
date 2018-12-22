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
    chrome.notifications.onClicked.addListener(clickHandler);
  }
}
