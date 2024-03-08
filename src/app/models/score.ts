export interface Score {
  createdTasks: number;
  // completed
  // ...
}

export function getDefaultScore() {
  const score: Score = {
    createdTasks: 1,
  };
  return score;
}
