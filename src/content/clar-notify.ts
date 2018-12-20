import * as Commonlib from './all';
import * as Betalib from './betalib';

Commonlib.runIfEnableAndLoad('notify-clarification', async () => {
  const contest = Betalib.getCurrentContest();
  chrome.runtime.sendMessage({ type: 'watch-clarification-register', data: contest });
});
