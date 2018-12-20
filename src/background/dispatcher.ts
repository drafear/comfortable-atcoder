import { createNotification } from './notification'
import { watchSubmissionRegister } from './submission-watcher';
import { checkClarification } from './clar-watcher';

chrome.runtime.onMessage.addListener(({ type, data }) => {
  switch (type) {
    case 'create-notification':
      createNotification(data);
      break;
    case 'watch-submission-register':
      watchSubmissionRegister(data);
      break;
    case 'check-clarification':
      checkClarification(data);
      break;
    default:
      console.error(`unknown message: ${type}`);
  }
});
