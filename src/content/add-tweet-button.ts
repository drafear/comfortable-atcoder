import * as Commonlib from './all';
import * as Betalib from './betalib';

Commonlib.runIfEnableAndLoad('add-tweet-button', async () => {
  const isMyPage = $('#user-nav-tabs .glyphicon-cog').length >= 1;
  if (!isMyPage) {
    return;
  }

  const isDetailPage = /^\/users\/[^/]+\/history\/?$/.test(location.pathname);
  const userId = (location.pathname.match(/^\/users\/([^/]+)/) as string[])[1];

  async function getTable(): Promise<JQuery<HTMLElement>> {
    // if (isDetailPage) {
    //   return $('#history');
    // }
    // else {
    const html = await (await fetch(`/users/${userId}/history`)).text();
    return $(html).find('#history');
    // }
  }

  function getLatestContestResult(contestResults: Betalib.ContestResult[]): Betalib.ContestResult | null {
    if (contestResults.length === 0) {
      return null;
    }
    let res = contestResults[0];
    for (const result of contestResults) {
      if (result.date > res.date) {
        res = result;
      }
    }
    return res;
  }

  function makeTweetText(contestResult: Betalib.ContestResult, isHighest = false): string {
    const r = contestResult;
    if (r instanceof Betalib.RatedContestResult) {
      const highestStr = isHighest ? ', Highest!!' : '';
      return `I took ${r.getRankStr()} place in ${r.contestName}\n\nRating: ${r.newRating - r.diff} -> ${r.newRating} (${r.getDiffStr()}${highestStr})\nPerformance: ${r.performance}\n#${r.contestId}`;
    }
    else {
      return `I took ${r.getRankStr()} place in ${r.contestName}\n#${r.contestId}`;
    }
  }

  function isHighest(targetContestResult: Betalib.ContestResult, contestResults: Betalib.ContestResult[]) {
    if (!(targetContestResult instanceof Betalib.RatedContestResult)) {
      return false;
    }
    for (const result of contestResults) {
      if (result.contestId === targetContestResult.contestId) {
        continue;
      }
      if (!(result instanceof Betalib.RatedContestResult)) {
        continue;
      }
      if (result.newRating >= targetContestResult.newRating) {
        return false;
      }
    }
    return true;
  }

  const $table = await getTable();
  const contestResults = Betalib.GetContestResultsFromTable($table);
  const latestContestResult = getLatestContestResult(contestResults);
  // 一度も参加したことがない
  if (latestContestResult === null) {
    return;
  }
  const tweetContent = makeTweetText(latestContestResult, isHighest(latestContestResult, contestResults));
  const text = navigator.language === 'ja' ? '最新のコンテスト結果をツイート' : 'Tweet the result of the latest contest';
  const $tweetButton = $('<a>').addClass('tweet').text(text)
    .prop('href', `https://twitter.com/share?url=''&text=${encodeURIComponent(tweetContent)}`)
    .prop('target', '_blank');
  if (isDetailPage) {
    $('#history_wrapper > div.row:first-child > .col-sm-6:first-child').eq(0).prepend($tweetButton);
  }
});
