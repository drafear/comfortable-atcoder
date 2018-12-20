import { createNotification } from './notification'
import { watchSubmissionRegister } from './submission-watcher';
import { watchClarificationRegister } from './clar-watcher';

chrome.runtime.onMessage.addListener(({ type, data }) => {
  switch (type) {
    case 'create-notification':
      createNotification(data);
      break;
    case 'watch-submission-register':
      watchSubmissionRegister(data);
      break;
    case 'watch-clarification-register':
      watchClarificationRegister(data);
      break;
    default:
      console.error(`unknown message: ${type}`);
  }
});
