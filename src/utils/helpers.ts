import { Character, Stage, CharactersData } from '@/types';

// 根据关卡ID获取关卡数据
export const getStageById = (stageId: number, data: CharactersData): Stage | null => {
  for (const level of data.levels) {
    const stage = level.stages.find(s => s.stageId === stageId);
    if (stage) return stage;
  }
  return null;
};

// 根据汉字ID获取汉字数据
export const getCharacterById = (id: number, data: CharactersData): Character | null => {
  for (const level of data.levels) {
    for (const stage of level.stages) {
      const char = stage.characters.find(c => c.id === id);
      if (char) return char;
    }
  }
  return null;
};

// 格式化分数（加上分数后缀）
export const formatScore = (score: number): string => {
  return `${score}分`;
};

// 格式化时间（秒转为分钟）
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}分${secs}秒`;
};

// 根据分数获取评价
export const getScoreRating = (score: number): string => {
  if (score === 100) return '完美通关！🌟';
  if (score >= 90) return '真棒！⭐';
  if (score >= 80) return '很好！👍';
  if (score >= 70) return '不错！😊';
  if (score >= 60) return '及格了！💪';
  return '再接再厉！加油！';
};

// 洗牌算法（Fisher-Yates）
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

