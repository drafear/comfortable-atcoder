'use strict';

$(() => {
  const contest = Betalib.getContest();
  const tabs = $('#main-container .nav > li');
  for (let i = 0; i < tabs.length; ++i) {
    const $li = tabs.eq(i);
    const $a = $('a', $li);
    // Problemタブか
    if ($a.length > 0 && $a.attr('href').match(/\/tasks\/?$/)) {
      const $ul = $('<ul>').addClass('dropdown-menu').attr('role', 'menu');
      Betalib.getProblems(contest).then(problems => {
        if (problems.length === 0) {
          return;
        }
        for (const prob of problems) {
          $ul.append(
            $('<li>').append(
              $('<a>').attr('href', prob.getUrl(contest)).text(
                `${prob.alphabet}. ${prob.title}`
              )
            )
          );
        }
        // Hoverでdropdownできるように
        $li.addClass('dropdown-hover').append($ul);
        // ▽を追加
        $a.append($('<span>').addClass('caret'));
      });
    }
  }
});
