$(async () => {
  const mySubmissions = await Betalib.getMySubmissions();
  for (const submission of mySubmissions) {
    if (submission.judgeStatus.isWaiting) {
      Betalib.watchSubmission(submission);
    }
  }
});
