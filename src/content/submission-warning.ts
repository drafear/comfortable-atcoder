import * as Commonlib from './all';

Commonlib.runIfEnableAndLoad('submission-warning', async () => {
  let cnt = 5;
  const event = new Event('watch.count.update');
  $(document).on('mouseup touchend keyup', () => {
    cnt = 5;
    document.dispatchEvent(event);
  });
  function waitForSelect(): Promise<void> {
    return new Promise(resolve => {
      document.addEventListener(
        event.type,
        () => {
          resolve();
        },
        { once: true },
      );
    });
  }
  while (true) {
    const $selects = $('#select-lang select:visible');
    for (const select of $selects) {
      const $select = $(select);
      const $span = $select.next().find('.select2-selection');
      const langId = $select.val();
      const isWarning = await Commonlib.isEnable(`warn-${langId}`);
      if (langId === $select.val()) {
        if (isWarning) {
          $span.css('background-color', 'hsl(40, 90%, 85%)');
        } else {
          $span.css('background-color', '');
        }
      }
    }
    --cnt;
    if (cnt === 0) {
      await waitForSelect();
    }
    await Commonlib.sleep(100);
  }
});
