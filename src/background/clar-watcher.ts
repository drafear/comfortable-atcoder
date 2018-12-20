import { createNotification } from './notification';
import * as Betalib from '../content/betalib';
import { sleep } from '../content/all';

class ContestWatcher {
  constructor(public readonly contestId: string) { }

  private async fetchClarCount(): Promise<number> {
    const response = await fetch(`https://atcoder.jp/contests/${this.contestId}/clarifications/count`);
    return Number(await response.text());
  }

  private async isContestPageOpened(): Promise<boolean> {
    const tabs: chrome.tabs.Tab[] = await new Promise((resolve, _) => {
      chrome.tabs.query({}, tabs => {
        resolve(tabs);
      });
    });
    const reg = new RegExp(`^https?://atcoder.jp/contests/${this.contestId}`);
    for (const tab of tabs) {
      if (tab.url !== undefined && reg.test(tab.url)) {
        return true;
      }
    }
    return false;
  }

  public async start() {
    let prevClarCount = await this.fetchClarCount();
    while (await this.isContestPageOpened()) {
      const curClarCount = await this.fetchClarCount();
      if (curClarCount > prevClarCount) {
        createNotification({
          data: {
            type: 'basic',
            iconUrl: chrome.extension.getURL('image/question.png'),
            title: 'Atcoder',
            message: 'New Clarification',
          },
          href: `https://atcoder.jp/contests/${this.contestId}/clarifications`,
        });
        prevClarCount = curClarCount;
      }
      await sleep(60 * 5 * 1000); // 5 min
    }
  }
}

const watchingContestList = new Set();

export async function watchClarificationRegister(contest: Betalib.Contest) {
  if (watchingContestList.has(contest.id)) {
    return;
  }
  watchingContestList.add(contest.id);
  try {
    const contestWatcher = await new ContestWatcher(contest.id);
    await contestWatcher.start();
  } catch (error) {
    throw error;
  } finally {
    watchingContestList.delete(contest.id);
  }
}
