const judgeResultImageStyle = {
  AC: {backColor: '#5cb85c'},
  WA: {backColor: 'hsl(0, 84%, 62%)'},
  default: {foreColor: 'white', backColor: '#f0ad4e'},
};

function makeJudgeStatusImageUrl(judgeResult) {
  let {foreColor, backColor} = judgeResultImageStyle.default;
  if (judgeResult in judgeResultImageStyle) {
    const newStyle = judgeResultImageStyle[judgeResult];
    if ('foreColor' in newStyle) {
      foreColor = newStyle.foreColor;
    }
    if ('backColor' in newStyle) {
      backColor = newStyle.backColor;
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = backColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "80px 'Lato','Helvetica Neue',arial,sans-serif";
  ctx.fillStyle = foreColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(judgeResult, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL('image/png');
}

const watchingSubmissionList = new Set();

class SubmissionWatcher {
  constructor(submission) {
    this.submission = submission;
  }

  async start(timeout = 30 * 60 * 1000) {
    const startTime = Date.now();
    let prevTime = this.startTime;
    let prevStatus = this.submission.judgeStatus;
    await CommonLib.sleep(100); // Rejudge用
    while (true) {
      const submission = await this.getCurrentSubmission();
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
        createNotification({
          data: {
            type: 'basic',
            iconUrl: makeJudgeStatusImageUrl(submission.judgeStatus.text),
            title: submission.probTitle,
            message,
          },
          href: submission.detailAbsoluteUrl,
        });
        break;
      }
      const curTime = Date.now();
      if (curTime - startTime >= timeout) {
        break;
      }
      const dt = curTime - prevTime;
      let sleepMilliseconds = 5 * 1000;
      if (prevStatus.now !== undefined) {
        const diff = submission.judgeStatus.now - prevStatus.now;
        const estimated = dt === 0 ? 0 : submission.judgeStatus.rest * dt / (diff + 1);
        sleepMilliseconds = Math.min(sleepMilliseconds, Math.max(estimated, 1 * 1000));
      }
      prevTime = curTime;
      prevStatus = submission.judgeStatus;
      await CommonLib.sleep(sleepMilliseconds);
    }
  }

  async getCurrentSubmission() {
    const response = await fetch(this.submission.detailAbsoluteUrl, {cache: 'no-cache'});
    const html = await response.text();
    const root = new DOMParser().parseFromString(html, 'text/html');
    const $table = $(root.querySelector('table'));
    const $ths = $table.find('th');
    const indexes = getIndexes($ths, {
      score: ['点', 'Score'],
      status: ['結果', 'Status'],
      time: ['実行時間', 'Exec Time'],
      memory: ['メモリ', 'Memory'],
    });
    if (!('status' in indexes)) {
      throw new Error('getCurrentSubmission: Can\'t get status');
    }
    const $tds = $table.find('td');
    const {id: submissionId, contest, probTitle} = this.submission;
    const score = $tds.eq(indexes.score).text();
    const judgeStatus = parseJudgeStatus($tds.eq(indexes.status).children('span').text());
    const execTime = 'time' in indexes ? $tds.eq(indexes.time).text() : undefined;
    const memoryUsage = 'memory' in indexes ? $tds.eq(indexes.memory).text() : undefined;
    return new Submission({contest, id: submissionId, probTitle, score, judgeStatus, execTime, memoryUsage});
  }
}

async function watchSubmissionRegister(submission) {
  if (watchingSubmissionList.has(submission.id)) {
    return;
  }
  watchingSubmissionList.add(submission.id);
  try {
    await new SubmissionWatcher(submission).start();
  } catch (error) {
    throw error;
  } finally {
    setTimeout(() => {
      watchingSubmissionList.delete(submission.id);
    }, 1000);
  }
}

chrome.runtime.onMessage.addListener(({type, data}) => {
  if (type === 'watch-submission-register') {
    watchSubmissionRegister(data);
  }
});
