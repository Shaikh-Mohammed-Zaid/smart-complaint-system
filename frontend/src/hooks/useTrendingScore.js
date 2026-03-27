import { useMemo } from 'react';

export const useTrendingScore = (votes, createdAt) => {
  return useMemo(() => {
    if (!createdAt) return 0;
    const hoursOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const timeFactor = 1 / Math.pow(Math.max(0, hoursOld) + 2, 1.5);
    return Math.max(0, votes * timeFactor);
  }, [votes, createdAt]);
};
