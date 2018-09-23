'use strict';

const betaHost = 'beta.atcoder.jp';

class Contest {
  constructor(id) {
    this.id = id;

    this.url = `/contests/${this.id}`;
  }
}

class Problem {
  constructor({contest, id, title, alphabet}) {
    this.contest = contest;
    this.id = id;
    this.title = title;
    this.alphabet = alphabet;

    this.url = `${this.contest.url}/tasks/${this.id}`;
  }
}

class Submission {
  constructor({contest, id, probTitle, score, judgeStatus, execTime, memoryUsage}) {
    this.contest = contest;
    this.id = id;
    this.score = score;
    this.judgeStatus = judgeStatus;
    this.execTime = execTime;
    this.memoryUsage = memoryUsage;
    this.probTitle = probTitle;

    this.detailUrl = `${contest.url}/submissions/${id}`;
    this.detailAbsoluteUrl = `https://${betaHost}${this.detailUrl}`;
  }
}

function getIndexes($items, patternObj) {
  const res = {};
  for (let i = 0; i < $items.length; ++i) {
    const content = $items.eq(i).text();
    for (const [key, patterns] of Object.entries(patternObj)) {
      for (const pattern of patterns) {
        if (content.search(pattern) >= 0) {
          res[key] = i;
          break;
        }
      }
    }
  }
  return res;
}

class JudgeStatus {
  constructor({text, now, total}) {
    this.text = text;
    this.now = now;
    this.total = total;

    this.isWaiting = text === 'WJ' || text === 'WR';
    this.rest = total !== undefined && now !== undefined ? total - now : undefined;
  }
}

function parseJudgeStatus(text) {
  const reg = /[　\s]/g;
  // WJ
  if (text.search('/') >= 0) {
    const [progress, status] = text.search(' ') >= 0 ? text.split(' ') : [text, ''];
    const [now, total] = progress.split('/');
    return new JudgeStatus({
      text: status.replace(reg, '') || 'WJ',
      now: Number(now.replace(reg, '')),
      total: Number(total.replace(reg, '')),
    });
  }
  return new JudgeStatus({text: text.replace(reg, '')});
}

window.Betalib = class {
  static getCurrentContest() {
    const contestId = location.pathname.match(/^\/contests\/([^/]+)/)[1];
    return new Contest(contestId);
  }

  static watchSubmission(submission) {
    chrome.runtime.sendMessage({type: 'watch-submission-register', data: submission});
  }

  static async getMySubmissions() {
    const contest = Betalib.getCurrentContest();
    let $html;
    // 既に自分の提出ページを開いているならfetchする必要なし
    if (location.pathname.match(new RegExp(`\\/contests\\/${contest.id}\\/submissions\\/me\\/?$`))) {
      $html = $('html');
    } else {
      const response = await fetch(`${contest.url}/submissions/me?lang=ja`);
      const html = await response.text();
      $html = $(html);
    }
    const $th = $('thead > tr > th', $html);
    const indexes = getIndexes(
      $th, {
        prob: ['問題', 'Task'],
        score: ['点', 'Score'],
        status: ['結果', 'Status'],
        time: ['実行時間', 'Exec Time'],
        memory: ['メモリ', 'Memory'],
      }
    );
    if (!('status' in indexes)) {
      throw new Error('Betalib: getMySubmissions: Can\'t get status');
    }
    if (!('score' in indexes)) {
      throw new Error('Betalib: getMySubmissions: Can\'t get score');
    }
    const res = [];
    $('tbody > tr', $html).each((idx, elem) => {
      const $tds = $(elem).children('td');
      const submissionId = $tds.eq(indexes.score)[0].dataset.id;
      const probTitle = $tds.eq(indexes.prob).children('a').text();
      const score = $tds.eq(indexes.score).text();
      const judgeStatus = parseJudgeStatus($tds.eq(indexes.status).children('span').text());
      const execTime = 'time' in indexes ? $tds.eq(indexes.time).text() : undefined;
      const memoryUsage = 'memory' in indexes ? $tds.eq(indexes.memory).text() : undefined;
      res[idx] = new Submission({contest, id: submissionId, probTitle, score, judgeStatus, execTime, memoryUsage});
    });
    return res;
  }

  static async getProblems() {
    const contest = Betalib.getCurrentContest();
    let $html;
    // 既に問題ページを開いているならfetchする必要なし
    if (location.pathname.match(new RegExp(`\\/contests\\/${contest.id}\\/tasks\\/?$`))) {
      $html = $('html');
    } else {
      const response = await fetch(`${contest.url}/tasks?lang=ja`);
      const html = await response.text();
      $html = $(html);
    }
    const $th = $('thead > tr > th', $html);
    const {prob: probColIdx} = getIndexes($th, {prob: ['Task Name', '問題']});
    if (probColIdx === undefined) {
      throw new Error('Betalib: getProblems: Can\'t get probColIdx');
    }
    const res = [];
    const reg = new RegExp(`${contest.url.replace(/\//g, '\\/')}\\/tasks\\/([^/]+)`);
    $(`tbody > tr > td:nth-child(${probColIdx + 1})`, $html).each((idx, elem) => {
      const $a = $(elem).children('a');
      const problemId = $a.attr('href').match(reg)[1];
      const title = $a.text();
      let alphabet = $a.closest('tr').children('td').eq(0).text();
      if (!alphabet.match(/^[A-Z]+$/)) {
        alphabet = 'X';
      }
      res[idx] = new Problem({contest, id: problemId, title, alphabet});
    });
    return res;
  }
};
