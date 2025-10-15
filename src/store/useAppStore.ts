import { create } from 'zustand';
import { AppState, UserProgress, CharactersData, ExamQuestion, Character } from '@/types';
import charactersDataJson from '@/data/characters.json';

// 默认用户进度
const defaultProgress: UserProgress = {
  currentStage: 1,
  unlockedStages: [1],
  stageRecords: {},
  totalPlayTime: 0,
  settings: {
    volume: 0.8,
    backgroundMusic: true,
    soundEffects: true,
  },
};

// 从localStorage加载进度
const loadProgressFromStorage = (): UserProgress => {
  try {
    const saved = localStorage.getItem('hanzi-racing-progress');
    if (saved) {
      return { ...defaultProgress, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
  return defaultProgress;
};

// 保存进度到localStorage
const saveProgressToStorage = (progress: UserProgress) => {
  try {
    localStorage.setItem('hanzi-racing-progress', JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

// 生成考试题目
const generateExamQuestions = (stageId: number, data: CharactersData): ExamQuestion[] => {
  // 找到对应关卡
  let targetStage = null;
  for (const level of data.levels) {
    const stage = level.stages.find(s => s.stageId === stageId);
    if (stage) {
      targetStage = stage;
      break;
    }
  }

  if (!targetStage) {
    throw new Error(`Stage ${stageId} not found`);
  }

  // 收集所有汉字作为干扰项池
  const allCharacters: Character[] = [];
  data.levels.forEach(level => {
    level.stages.forEach(stage => {
      allCharacters.push(...stage.characters);
    });
  });

  // 为每个汉字生成题目
  const questions: ExamQuestion[] = targetStage.characters.map((char, index) => {
    // 选择3个干扰项
    const distractors: Character[] = [];
    const usedIds = new Set([char.id]);

    while (distractors.length < 3) {
      const randomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];
      if (!usedIds.has(randomChar.id)) {
        distractors.push(randomChar);
        usedIds.add(randomChar.id);
      }
    }

    // 混合正确答案和干扰项
    const options = [char, ...distractors].sort(() => Math.random() - 0.5);

    return {
      questionNumber: index + 1,
      correctCharacter: char,
      options,
    };
  });

  return questions;
};

// 创建Zustand store
export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  currentPage: 'home',
  currentStageId: null,
  currentExam: null,
  currentExamIndex: 0,
  currentScore: 0,
  userProgress: loadProgressFromStorage(),
  charactersData: charactersDataJson as CharactersData,

  // 设置当前页面
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  // 设置当前关卡
  setCurrentStageId: (stageId) => {
    set({ currentStageId: stageId });
  },

  // 开始考试
  startExam: (stageId) => {
    const { charactersData } = get();
    if (!charactersData) return;

    const questions = generateExamQuestions(stageId, charactersData);
    set({
      currentPage: 'exam',
      currentStageId: stageId,
      currentExam: questions,
      currentExamIndex: 0,
      currentScore: 0,
    });
  },

  // 回答问题
  answerQuestion: (characterId) => {
    const { currentExam, currentExamIndex, currentScore } = get();
    if (!currentExam || currentExamIndex >= currentExam.length) return;

    const currentQuestion = currentExam[currentExamIndex];
    const isCorrect = characterId === currentQuestion.correctCharacter.id;

    // 更新题目
    currentQuestion.userAnswer = characterId;
    currentQuestion.isCorrect = isCorrect;

    // 更新分数（每题10分）
    const newScore = isCorrect ? currentScore + 10 : currentScore;

    // 判断是否是最后一题
    const isLastQuestion = currentExamIndex === currentExam.length - 1;

    if (isLastQuestion) {
      // 最后一题，准备显示结果
      set({
        currentExam: [...currentExam],
        currentScore: newScore,
      });
      // 延迟跳转到结果页面（给用户时间看到反馈）
      setTimeout(() => {
        get().completeExam();
      }, 1500);
    } else {
      // 还有题目，自动进入下一题
      setTimeout(() => {
        set({
          currentExam: [...currentExam],
          currentExamIndex: currentExamIndex + 1,
          currentScore: newScore,
        });
      }, 1500);
    }
  },

  // 完成考试
  completeExam: () => {
    const { currentStageId, currentScore, userProgress } = get();
    if (!currentStageId) return;

    const isPassed = currentScore >= 60; // 60分及格

    // 更新关卡记录
    const existingRecord = userProgress.stageRecords[currentStageId];
    const newRecord = {
      bestScore: Math.max(existingRecord?.bestScore || 0, currentScore),
      attempts: (existingRecord?.attempts || 0) + 1,
      lastPlayTime: new Date().toISOString(),
      isPassed: existingRecord?.isPassed || isPassed,
    };

    userProgress.stageRecords[currentStageId] = newRecord;

    // 如果通过且是新关卡，解锁下一关
    if (isPassed && currentStageId < 25) {
      if (!userProgress.unlockedStages.includes(currentStageId + 1)) {
        userProgress.unlockedStages.push(currentStageId + 1);
        userProgress.currentStage = currentStageId + 1;
      }
    }

    // 保存进度
    saveProgressToStorage(userProgress);

    // 切换到结果页面
    set({
      currentPage: 'result',
      userProgress: { ...userProgress },
    });
  },

  // 解锁下一关
  unlockNextStage: (stageId) => {
    const { userProgress } = get();
    const nextStageId = stageId + 1;

    if (nextStageId <= 25 && !userProgress.unlockedStages.includes(nextStageId)) {
      userProgress.unlockedStages.push(nextStageId);
      userProgress.currentStage = nextStageId;
      saveProgressToStorage(userProgress);
      set({ userProgress: { ...userProgress } });
    }
  },

  // 更新用户进度
  updateUserProgress: (progress) => {
    const { userProgress } = get();
    const newProgress = { ...userProgress, ...progress };
    saveProgressToStorage(newProgress);
    set({ userProgress: newProgress });
  },

  // 保存进度
  saveProgress: () => {
    const { userProgress } = get();
    saveProgressToStorage(userProgress);
  },

  // 加载进度
  loadProgress: () => {
    const progress = loadProgressFromStorage();
    set({ userProgress: progress });
  },

  // 重置进度
  resetProgress: () => {
    const confirmed = window.confirm('确定要重置所有进度吗？此操作不可恢复！');
    if (confirmed) {
      saveProgressToStorage(defaultProgress);
      set({
        userProgress: { ...defaultProgress },
        currentPage: 'home',
        currentStageId: null,
        currentExam: null,
        currentExamIndex: 0,
        currentScore: 0,
      });
    }
  },
}));

