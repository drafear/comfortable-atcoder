import * as Commonlib from './all';
import * as Betalib from './betalib';

function getNotifyCount(): number {
  const text = $('#clar-badge').text();
  const res = /\d+/.test(text) ? Number(text) : 0;
  return res;
}

Commonlib.runIfEnableAndLoad('notify-clarification', async () => {
  const contest = Betalib.getCurrentContest();

  function updateBackground() {
    chrome.runtime.sendMessage({ type: 'check-clarification', data: contest });
  }

  let prev = getNotifyCount();
  while (true) {
    const cur = getNotifyCount();
    if (cur > prev) {
      updateBackground();
      prev = cur;
    }
    await Commonlib.sleep(1000);
  }
});
