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
