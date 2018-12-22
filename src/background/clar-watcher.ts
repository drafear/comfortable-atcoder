import { createNotification } from './notification';
import * as Betalib from '../content/betalib';
import { WatchingListManager } from './watching-list-manager';

const watchingClarManager = new WatchingListManager<number>('clarification', 24 * 60 * 60 * 1000, 0);

async function getClarCount(contestId: string): Promise<number> {
  const response = await fetch(`https://atcoder.jp/contests/${contestId}/clarifications/count`);
  const curClarCount = Number(await response.text());
  return curClarCount;
}

export async function checkClarification(contest: Betalib.Contest) {
  const clarCount = await getClarCount(contest.id);
  const prevClarCount = await watchingClarManager.get(contest.id);
  if (clarCount > prevClarCount) {
    watchingClarManager.set(contest.id, clarCount);
    createNotification({
      data: {
        type: 'basic',
        iconUrl: chrome.extension.getURL('image/question.png'),
        title: 'Atcoder',
        message: 'New Clarification',
      },
      href: `https://atcoder.jp/contests/${contest.id}/clarifications`,
    });
  }
}
