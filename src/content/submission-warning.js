CommonLib.runIfEnableAndLoad('submission-warning', async () => {
  while (true) {
    const $selects = $('#select-lang select:visible');
    for (const select of $selects) {
      const $select = $(select);
      const $span = $select.next().find('.select2-selection');
      const langId = $select.val();
      const isWarning = await CommonLib.isEnable(`warn-${langId}`);
      if (langId === $select.val()) {
        if (isWarning) {
          $span.css('background-color', 'hsl(40, 90%, 85%)');
        } else {
          $span.css('background-color', '');
        }
      }
    }
    await CommonLib.sleep(100);
  }
});
