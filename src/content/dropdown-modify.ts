import * as Commonlib from './all';
import * as Betalib from './betalib';

Commonlib.runIfEnableAndLoad('dropdown-problem', async () => {
  const isHoverEnable = await Commonlib.isEnable('dropdown-hover');
  const tabs = $('#main-container .nav > li');
  for (let i = 0; i < tabs.length; ++i) {
    const $li = tabs.eq(i);
    const $a = $('a', $li);
    // Problemタブか
    if ($a.length > 0 && ($a.attr('href') as string).match(/\/tasks\/?$/)) {
      const $ul = $('<ul>')
        .addClass('dropdown-menu')
        .attr('role', 'menu');
      const problems = await Betalib.getProblems();
      if (problems.length === 0) {
        return;
      }
      for (const prob of problems) {
        $ul.append(
          $('<li>').append(
            $('<a>')
              .attr('href', prob.url)
              .html(
                `<span style='font-family: Consolas, "Courier New", monospace''>${prob.alphabet} - </span>${
                  prob.title
                }`,
              ),
          ),
        );
      }
      $li.append($ul);
      if (isHoverEnable) {
        // Hoverでdropdownできるように
        $li.addClass('dropdown-hover');
      } else {
        $a.addClass('dropdown-toggle').attr({
          href: '#',
          'data-toggle': 'dropdown',
        });
      }
      // ▽を追加
      $a.append($('<span>').addClass('caret'));
    }
  }
});

Commonlib.runIfEnableAndLoad('dropdown-hover', () => {
  // .dropdown-toggle のタブをhover設定する
  $('#main-container .nav > li > a.dropdown-toggle').each((_, elem) => {
    const $e = $(elem);
    const url = $e
      .parent()
      .find('> .dropdown-menu a:first-child')
      .attr('href');
    $e.removeClass('dropdown-toggle').attr({
      'data-toggle': '',
      href: url,
    });
    $e.parent().addClass('dropdown-hover');
  });
  // .dropdown-hover:hover 時のスタイル適用
  $(document).on('mouseenter', '.dropdown-hover', e => {
    $(e.currentTarget).addClass('open');
  });
  $(document).on('mouseleave', '.dropdown-hover', e => {
    $(e.currentTarget).removeClass('open');
  });
});
