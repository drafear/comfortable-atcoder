'use strict';

class Contest {
  constructor(id) {
    this.id = id;
  }
  getUrl() {
    return `/contests/${this.id}`;
  }
}

class Problem {
  constructor({id, title, alphabet}) {
    this.id = id;
    this.title = title;
    this.alphabet = alphabet;
  }

  getUrl(contest) {
    return `${contest.getUrl()}/tasks/${this.id}`;
  }
}

window.Betalib = class {
  static getContest() {
    const contestId = location.pathname.match(/^\/contests\/([^/]+)/)[1];
    return new Contest(contestId);
  }

  static async getProblems(contest) {
    const response = await fetch(`${contest.getUrl()}/tasks?lang=ja`);
    const html = await response.text();
    const $th = $('thead > tr > th', html);
    // 問題名の列を探す
    let probColIdx = -1;
    for (let i = 0; i < $th.length; ++i) {
      if ($th.eq(i).text() === 'Task Name' || $th.eq(i).text() === '問題名') {
        probColIdx = i;
        break;
      }
    }
    const res = [];
    const reg = new RegExp(`${contest.getUrl().replace(/\//g, '\\/')}\\/tasks\\/([^/]+)`);
    $(`tbody > tr > td:nth-child(${probColIdx+1})`, html).each((idx, elem) => {
      const $a = $(elem).children('a');
      const problemId = $a.attr('href').match(reg)[1];
      const title = $a.text();
      let alphabet = $a.closest('tr').children('td').eq(0).text();
      if (!alphabet.match(/^[A-Z]+$/)) {
        alphabet = 'X';
      }
      res[idx] = new Problem({id: problemId, title, alphabet});
    });
    return res;
  }
};
