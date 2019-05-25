const betaHost = 'atcoder.jp';

export class Contest {
  public readonly url: string;

  constructor(public readonly id: string) {
    this.url = `/contests/${this.id}`;
  }
}

export interface ProblemOption {
  contest: Contest;
  id: string;
  title: string;
  alphabet: string;
}

export class Problem {
  public readonly contest: Contest;

  public readonly id: string;

  public readonly title: string;

  public readonly alphabet: string;

  public readonly url: string;

  constructor({ contest, id, title, alphabet }: ProblemOption) {
    this.contest = contest;
    this.id = id;
    this.title = title;
    this.alphabet = alphabet;
    this.url = `${this.contest.url}/tasks/${this.id}`;
  }
}

export interface SubmissionOption {
  contest: Contest;
  id: string;
  probTitle: string;
  score: string;
  judgeStatus: JudgeStatus;
  execTime?: string;
  memoryUsage?: string;
}

export class Submission {
  public readonly contest: Contest;

  public readonly id: string;

  public readonly score: string;

  public readonly judgeStatus: JudgeStatus;

  public readonly execTime: string | undefined;

  public readonly memoryUsage: string | undefined;

  public readonly probTitle: string;

  public readonly detailUrl: string;

  public readonly detailAbsoluteUrl: string;

  constructor({ contest, id, probTitle, score, judgeStatus, execTime, memoryUsage }: SubmissionOption) {
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

export function getIndexes(
  $items: JQuery<HTMLElement>,
  patternObj: { [key: string]: string[] },
): { [key: string]: number } {
  const res: { [key: string]: number } = {};
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

export interface JudgeStatusOption {
  text: string;
  now?: number;
  total?: number;
}

export class JudgeStatus {
  public readonly text: string;

  public readonly now: number | undefined;

  public readonly total: number | undefined;

  public readonly isWaiting: boolean;

  public readonly rest: number | undefined;

  constructor({ text, now, total }: JudgeStatusOption) {
    this.text = text;
    this.now = now;
    this.total = total;
    this.isWaiting = text === 'WJ' || text === 'WR';
    this.rest = total !== undefined && now !== undefined ? total - now : undefined;
  }
}

export abstract class ContestResult {
  constructor(
    public readonly date: Date,
    public readonly contestName: string,
    public readonly contestId: string,
    public readonly rank: number,
    public readonly diff: number,
  ) { }

  abstract isRated(): boolean;

  getRankStr(): string {
    switch (this.rank % 10) {
      case 1:
        return `${this.rank}st`;
      case 2:
        return `${this.rank}nd`;
      case 3:
        return `${this.rank}rd`;
      default:
        return `${this.rank}th`;
    }
  }

  getDiffStr(): string {
    if (this.diff > 0) {
      return `+${this.diff}`;
    }
    if (this.diff < 0) {
      return this.diff.toString();
    }
    return '±0';
  }
}
export class UnRatedContestResult extends ContestResult {
  isRated() {
    return false;
  }
}
export class RatedContestResult extends ContestResult {
  constructor(
    date: Date,
    contestName: string,
    contestId: string,
    rank: number,
    diff: number,
    public readonly performance: number,
    public readonly newRating: number,
  ) {
    super(date, contestName, contestId, rank, diff);
  }

  isRated() {
    return true;
  }
}

export function parseJudgeStatus(text: string): JudgeStatus {
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
  return new JudgeStatus({ text: text.replace(reg, '') });
}

export function parseSubmissionFromDetailPage(htmlRoot: Document, submission: Submission) {
  const $table = $(htmlRoot.querySelector('table') as HTMLTableElement);
  const $ths = $table.find('th');
  const indexes = getIndexes($ths, {
    score: ['点', 'Score'],
    status: ['結果', 'Status'],
    time: ['実行時間', 'Exec Time'],
    memory: ['メモリ', 'Memory'],
  });
  if (!('status' in indexes)) {
    throw new Error("getCurrentSubmission: Can't get status");
  }
  const $tds = $table.find('td');
  const { id: submissionId, contest, probTitle } = submission;
  const score = $tds.eq(indexes.score).text();
  const judgeStatus = parseJudgeStatus(
    $tds
      .eq(indexes.status)
      .children('span')
      .text(),
  );
  const execTime = 'time' in indexes ? $tds.eq(indexes.time).text() : undefined;
  const memoryUsage = 'memory' in indexes ? $tds.eq(indexes.memory).text() : undefined;
  return new Submission({ contest, id: submissionId, probTitle, score, judgeStatus, execTime, memoryUsage });
}

export function getCurrentContest(): Contest {
  const contestId = (location.pathname.match(/^\/contests\/([^/]+)/) as string[])[1];
  return new Contest(contestId);
}

export function watchSubmission(submission: Submission): void {
  chrome.runtime.sendMessage({ type: 'watch-submission-register', data: submission });
}

export async function getMySubmissions(): Promise<Submission[]> {
  const contest = getCurrentContest();
  let $html: JQuery<HTMLElement>;
  // 既に自分の提出ページを開いているならfetchする必要なし
  if (location.pathname.match(new RegExp(`\\/contests\\/${contest.id}\\/submissions\\/me\\/?$`))) {
    $html = $('html');
  } else {
    const response = await fetch(`${contest.url}/submissions/me?lang=ja`);
    const html = await response.text();
    $html = $(html);
  }
  const $th = $('thead > tr > th', $html);
  const indexes = getIndexes($th, {
    prob: ['問題', 'Task'],
    score: ['点', 'Score'],
    status: ['結果', 'Status'],
    time: ['実行時間', 'Exec Time'],
    memory: ['メモリ', 'Memory'],
  });
  if ($th.length === 0) {
    return [];
  }
  if (!('status' in indexes)) {
    throw new Error("Betalib: getMySubmissions: Can't get status");
  }
  if (!('score' in indexes)) {
    throw new Error("Betalib: getMySubmissions: Can't get score");
  }
  const res: Submission[] = [];
  $('tbody > tr', $html).each((idx, elem) => {
    const $tds = $(elem).children('td');
    const submissionId = $tds.eq(indexes.score)[0].dataset.id as string;
    const probTitle = $tds
      .eq(indexes.prob)
      .children('a')
      .text();
    const score = $tds.eq(indexes.score).text();
    const judgeStatus = parseJudgeStatus(
      $tds
        .eq(indexes.status)
        .children('span')
        .text(),
    );
    let execTime: string | undefined = $tds.eq(indexes.time).text();
    if (!/s$/.test(execTime)) execTime = undefined;
    let memoryUsage: string | undefined = $tds.eq(indexes.memory).text();
    if (!/B$/.test(memoryUsage)) memoryUsage = undefined;
    res[idx] = new Submission({ contest, id: submissionId, probTitle, score, judgeStatus, execTime, memoryUsage });
  });
  return res;
}

export async function getProblems(): Promise<Problem[]> {
  const contest = getCurrentContest();
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
  const { prob: probColIdx } = getIndexes($th, { prob: ['Task Name', '問題'] });
  if (probColIdx === undefined) {
    throw new Error("Betalib: getProblems: Can't get probColIdx");
  }
  const res: Problem[] = [];
  const reg = new RegExp(`${contest.url.replace(/\//g, '\\/')}\\/tasks\\/([^/]+)`);
  $(`tbody > tr > td:nth-child(${probColIdx + 1})`, $html).each((idx, elem) => {
    const $a = $(elem).children('a');
    const problemId = (($a.attr('href') as string).match(reg) as string[])[1];
    const title = $a.text();
    let alphabet = $a
      .closest('tr')
      .children('td')
      .eq(0)
      .text();
    if (!alphabet.match(/^[A-Z]+$/)) {
      alphabet = 'X';
    }
    res[idx] = new Problem({ contest, id: problemId, title, alphabet });
  });
  return res;
}

export function getContestResultsFromTable($table: JQuery<HTMLElement>): ContestResult[] {
  const res: ContestResult[] = [];
  const $th = $('thead > tr > th', $table);
  const indexes = getIndexes($th, {
    date: ['Date', '日付'],
    contest: ['Contest', 'コンテスト'],
    rank: ['Rank', '順位'],
    performance: ['Performance', 'パフォーマンス'],
    newRating: ['NewRating', '新Rating'],
    diff: ['Diff', '差分'],
  });
  $('tbody > tr', $table).each((idx, tr) => {
    const $tds = $(tr).children('td');
    const date = new Date($tds.eq(indexes.date).text());
    const $contest = $tds
      .eq(indexes.contest)
      .children('a')
      .eq(0);
    const contestName = $contest.text();
    const contestId = (($contest.prop('href') as string).match(/\/contests\/([^/]+)\/?$/) as string[])[1];
    const rank = Number($tds.eq(indexes.rank).text());
    const performanceStr = $tds.eq(indexes.performance).text();
    const newRatingStr = $tds.eq(indexes.newRating).text();
    const diff = Number(
      $tds
        .eq(indexes.diff)
        .text()
        .replace(/\D/g, ''),
    );
    const isRated = performanceStr !== '-';
    res[idx] = isRated
      ? new RatedContestResult(date, contestName, contestId, rank, diff, Number(performanceStr), Number(newRatingStr))
      : new UnRatedContestResult(date, contestName, contestId, rank, diff);
  });
  return res;
}
