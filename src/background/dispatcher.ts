import { createNotification } from './notification'
import { watchSubmissionRegister } from './submission-watcher';
import { checkClarification } from './clar-watcher';
import { Lock } from '../lib/lock';

const notifyLock = new Lock();

chrome.runtime.onMessage.addListener(({ type, data }) => {
  switch (type) {
    case 'create-notification':
      createNotification(data, notifyLock);
      break;
    case 'watch-submission-register':
      watchSubmissionRegister(data, notifyLock);
      break;
    case 'check-clarification':
      checkClarification(data, notifyLock);
      break;
    default:
      console.error(`unknown message: ${type}`);
  }
});
