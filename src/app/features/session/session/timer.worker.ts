addEventListener('message', ({ data }) => {
  const { duration } = data;
  let remainingTime = duration;

  const timerInterval = setInterval(() => {
    remainingTime--;
    postMessage({ remainingTime });

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      postMessage({ done: true });
    }
  }, 1000);
});
