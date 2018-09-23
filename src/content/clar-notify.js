CommonLib.runIfEnableAndLoad('notify-clarification', async () => {
  const contest = Betalib.getCurrentContest();
  function getNotifyCount() {
    return $('#clar-badge').text();
  }
  let prev = getNotifyCount();
  while (true) {
    const cur = getNotifyCount();
    if (prev !== cur) {
      CommonLib.createNotification({
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
    await CommonLib.sleep(1000);
  }
});
