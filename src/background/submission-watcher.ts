import { Lock } from '../lib/lock';
import { sleep } from '../content/all';
import * as Betalib from '../content/betalib';
import { createNotification } from './notification';
import { WatchingSetManager } from './watching-list-manager';

interface JudgeResultImageStyle {
  foreColor?: string;
  backColor?: string;
}

const judgeResultImageStyle: { [key: string]: JudgeResultImageStyle } = {
  AC: { backColor: '#5cb85c' },
  WA: { backColor: 'hsl(0, 84%, 62%)' },
};

function makeJudgeStatusImageUrl(judgeResult: string): string {
  let foreColor = 'white';
  let backColor = '#f0ad4e';
  if (judgeResult in judgeResultImageStyle) {
    const newStyle = judgeResultImageStyle[judgeResult];
    if (newStyle.foreColor !== undefined) {
      foreColor = newStyle.foreColor;
    }
    if (newStyle.backColor !== undefined) {
      backColor = newStyle.backColor;
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error("canvas.getContext('2d') was failed");
  ctx.fillStyle = backColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "80px 'Lato','Helvetica Neue',arial,sans-serif";
  ctx.fillStyle = foreColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(judgeResult, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL('image/png');
}

const watchingSubmissionManager = new WatchingSetManager('submission');

class SubmissionWatcher {
  private maxSleepMilliseconds: number;

  constructor(readonly submission: Betalib.Submission, private notifyLock: Lock) {
    this.maxSleepMilliseconds = 5 * 1000;
  }

  async start(timeout = 30 * 60 * 1000) {
    console.log('SubmissionWatcher: start:', this.submission);
    const startTime = Date.now();
    let prevTime = startTime;
    let prevStatus = this.submission.judgeStatus;
    await sleep(100); // Rejudge用
    while (true) {
      const submission = await this.getCurrentSubmission();
      console.log('SubmissionWatcher: in progress:', this.submission, submission);
      if (!submission.judgeStatus.isWaiting) {
        let message = '';
        // ジャッジ中か
        if (submission.judgeStatus.now !== undefined) {
          message += 'Judging...';
        } else {
          message += `Score: ${submission.score} points`;
        }
        // 結果が取得できたなら表示
        if (submission.execTime) {
          message += `\n${submission.execTime}`;
        }
        if (submission.memoryUsage) {
          message += `\n${submission.memoryUsage}`;
        }
        console.log('SubmissionWatcher: notification:', this.submission, submission);
        createNotification({
          data: {
            type: 'basic',
            iconUrl: makeJudgeStatusImageUrl(submission.judgeStatus.text),
            title: submission.probTitle,
            message,
          },
          href: submission.detailAbsoluteUrl,
        }, this.notifyLock);
        break;
      }
      const curTime = Date.now();
      if (curTime - startTime >= timeout) {
        break;
      }
      const dt = curTime - prevTime;
      let sleepMilliseconds = this.maxSleepMilliseconds;
      if (prevStatus.now !== undefined) {
        const diff = (submission.judgeStatus.now as number) - prevStatus.now;
        const estimated = dt === 0 ? 0 : Math.floor(((submission.judgeStatus.rest as number) * dt) / (diff + 1));
        sleepMilliseconds = Math.min(sleepMilliseconds, Math.max(estimated, 1 * 1000));
        // ジャッジが進まないなら頻度を下げる
        if (diff === 0) {
          this.maxSleepMilliseconds = Math.floor(this.maxSleepMilliseconds * 1.2);
        }
      }
      prevTime = curTime;
      prevStatus = submission.judgeStatus;
      await sleep(sleepMilliseconds);
    }
  }

  async getCurrentSubmission() {
    const response = await fetch(this.submission.detailAbsoluteUrl, { cache: 'no-cache' });
    const html = await response.text();
    const root = new DOMParser().parseFromString(html, 'text/html');
    const $table = $(root.querySelector('table') as HTMLTableElement);
    const $ths = $table.find('th');
    const indexes = Betalib.getIndexes($ths, {
      score: ['点', 'Score'],
      status: ['結果', 'Status'],
      time: ['実行時間', 'Exec Time'],
      memory: ['メモリ', 'Memory'],
    });
    if (!('status' in indexes)) {
      throw new Error("getCurrentSubmission: Can't get status");
    }
    const $tds = $table.find('td');
    const { id: submissionId, contest, probTitle } = this.submission;
    const score = $tds.eq(indexes.score).text();
    const judgeStatus = Betalib.parseJudgeStatus(
      $tds
        .eq(indexes.status)
        .children('span')
        .text(),
    );
    const execTime = 'time' in indexes ? $tds.eq(indexes.time).text() : undefined;
    const memoryUsage = 'memory' in indexes ? $tds.eq(indexes.memory).text() : undefined;
    return new Betalib.Submission({ contest, id: submissionId, probTitle, score, judgeStatus, execTime, memoryUsage });
  }
}

const lock = new Lock();

export async function watchSubmissionRegister(submission: Betalib.Submission, notifyLock: Lock): Promise<void> {
  let has = false;
  await lock.acquire(async () => {
    if (await watchingSubmissionManager.has(submission.id)) {
      has = true;
      return;
    }
    await watchingSubmissionManager.add(submission.id);
  });
  if (has) return;
  try {
    await new SubmissionWatcher(submission, notifyLock).start();
  } catch (error) {
    throw error;
  } finally {
    await sleep(1000 * 10);
    await watchingSubmissionManager.delete(submission.id);
  }
}
