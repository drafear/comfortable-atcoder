const beta_url = () => {
  const contest_id = $.url().attr('host').match(/^(.*).contest.atcoder.jp$/)[1];
  return `https://beta.atcoder.jp/contests/${contest_id}`;
};

const add_beta = ($ul) => {
  try {
      $ul.prepend(
          $("<li>").append(
              $("<a>").prop("href", beta_url()).append(
                  $("<img>").attr({
                      src: chrome.extension.getURL('image/beta.png'),
                      alt: "β"
                  }).css({ width: "14px", height: "14px", border: 0 })
              )
          )
      );
  }
  catch (e) {
  }
};

$(() => {
  const $ul = $(".nav-tabs").eq(0);
  add_beta($ul);
});
