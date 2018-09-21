async function setupProblemTab() {
  const tabs = $('#main-container .nav > li');
  for (let i = 0; i < tabs.length; ++i) {
    const $li = tabs.eq(i);
    const $a = $('a', $li);
    // Problemタブか
    if ($a.length > 0 && $a.attr('href').match(/\/tasks\/?$/)) {
      const $ul = $('<ul>').addClass('dropdown-menu').attr('role', 'menu');
      const problems = await Betalib.getProblems();
      if (problems.length === 0) {
        return;
      }
      for (const prob of problems) {
        $ul.append(
          $('<li>').append(
            $('<a>').attr('href', prob.url).html(
              `<span style='font-family: Consolas, "Courier New", monospace''>${prob.alphabet} - </span>${prob.title}`
            )
          )
        );
      }
      // Hoverでdropdownできるように
      $li.addClass('dropdown-hover').append($ul);
      // ▽を追加
      $a.append($('<span>').addClass('caret'));
    }
  }
}

function setupDropdownHover() {
  // .dropdown-toggle のタブをhover設定する
  $('#main-container .nav > li > a.dropdown-toggle').each((_, elem) => {
    const $e = $(elem);
    const url = $e.parent().find('> .dropdown-menu a:first-child').attr('href');
    $e.removeClass('dropdown-toggle').attr({
      'data-toggle': '',
      href: url,
    });
    $e.parent().addClass('dropdown-hover');
  });
  // .dropdown-hover:hover 時のスタイル適用
  $('.dropdown-hover').hover(
    e => {
      $(e.currentTarget).addClass('open');
    },
    e => {
      $(e.currentTarget).removeClass('open');
    }
  );
}

$(() => {
  setupProblemTab();
  setupDropdownHover();
});
