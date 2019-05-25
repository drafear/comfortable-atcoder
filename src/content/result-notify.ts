import * as Commonlib from './all';
import * as Betalib from './betalib';

Commonlib.runIfEnableAndLoad('notify-judge-result', async () => {
  const mySubmissions = await Betalib.getMySubmissions();
  for (const submission of mySubmissions) {
    if (submission.judgeStatus.isWaiting) {
      Betalib.watchSubmission(submission);
    }
  }
});

async function getSubmission(submissionId: string) {
  const mySubmissions = await Betalib.getMySubmissions();
  for (const submission of mySubmissions) {
    if (submission.id === submissionId) {
      return submission;
    }
  }
  return null;
}

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (!('type' in message) || !('id' in message)) {
    sendResponse({ error: `result-notify: illegal format of message` });
    return;
  }
  switch (message.type) {
    case 'get-submission':
      const result = await getSubmission(message.id);
      sendResponse(result);
      break;
    default:
      sendResponse({ error: `result-notify: unknown message type: ${message.type}` });
  }
});
