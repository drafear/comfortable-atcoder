import * as Commonlib from './all';
import * as Betalib from './betalib';

function getNotifyCount(): number {
  const text = $('#clar-badge').text();
  const res = /\d+/.test(text) ? Number(text) : 0;
  return res;
}

Commonlib.runIfEnableAndLoad('notify-clarification', async () => {
  const contest = Betalib.getCurrentContest();
  let prev = getNotifyCount();
  while (true) {
    const cur = getNotifyCount();
    if (cur > prev) {
      Commonlib.createNotification({
        data: {
          type: 'basic',
          iconUrl: chrome.extension.getURL('image/question.png'),
          title: 'Atcoder',
          message: 'New Clarification',
        },
        href: `https://beta.atcoder.jp/contests/${contest.id}/clarifications`,
      });
      prev = cur;
    }
    await Commonlib.sleep(1000);
  }
});
