const convertRules = [
  {from: '/', to: '/'},
  {from: '/assignments', to: '/tasks'},
  {from: '/tasks/*', to: '/tasks/$1'},
  {from: '/submit', to: '/submit'},
  {from: '/clarifications', to: '/clarifications'},
  {from: '/clarifications/update/*', to: '/clarifications/update/$1'},
  {from: '/users/*', to: '/users/$1'},
  {from: '/standings', to: '/standings'},
  {from: '/custom_test', to: '/custom_test'},
  {from: '/submissions/me', to: '/submissions/me'},
  {from: '/submissions/all', to: '/submissions'},
  {from: '/submissions/*', to: '/submissions/$1'},
  {from: '/clarifications/insert', to: '/clarifications/insert'},
];

const getBetaUrl = () => {
  const contestId = location.host.match(/^(.*).contest.atcoder.jp$/)[1];
  const prefix = `https://beta.atcoder.jp/contests/${contestId}`;
  for (const rule of convertRules) {
    const reg = new RegExp('^' + rule.from.replace(/\*/g, '([^\\/]+)') + '\\/?$');
    if (location.pathname.match(reg)) {
      const pathName = location.pathname.replace(reg, rule.to);
      return prefix + pathName;
    }
  }
  return prefix;
};

const addBetaButton = $ul => {
  try {
    $ul.prepend(
      $('<li>').append(
        $('<a>')
          .prop('href', getBetaUrl())
          .append(
            $('<img>')
              .attr({
                src: chrome.extension.getURL('image/beta.png'),
                alt: 'β',
              })
              .css({width: '14px', height: '14px', border: 0})
          )
      )
    );
  } catch (error) {}
};

$(() => {
  const $ul = $('.nav-tabs').eq(0);
  addBetaButton($ul);
});
