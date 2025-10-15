// 汉字数据类型
export interface Character {
  id: number;
  char: string;
  pinyin: string;
  strokes: number;
  icon: string;
  category: string;
}

// 关卡数据类型
export interface Stage {
  stageId: number;
  level: number;
  stageInLevel: number;
  name: string;
  characters: Character[];
}

// 大级数据类型
export interface Level {
  level: number;
  name: string;
  strokeRange: string;
  stages: Stage[];
}

// 汉字数据库类型
export interface CharactersData {
  metadata: {
    version: string;
    totalCharacters: number;
    totalStages: number;
    levels: number;
    source: string;
    createdAt: string;
  };
  levels: Level[];
}

// 表扬语音类型
export interface PraisePhrase {
  id: number;
  text: string;
  duration: string;
}

export interface PraiseCategory {
  description: string;
  playCondition: string;
  phrases: PraisePhrase[];
}

export interface PraiseData {
  metadata: {
    version: string;
    totalPhrases: number;
    categories: string[];
  };
  praiseVoices: {
    basic: PraiseCategory;
    combo: PraiseCategory;
    perfect: PraiseCategory;
    encouragement: PraiseCategory;
  };
}

// 考试题目类型
export interface ExamQuestion {
  questionNumber: number;
  correctCharacter: Character;
  options: Character[]; // 4个选项（1个正确，3个干扰）
  userAnswer?: number; // 用户选择的汉字ID
  isCorrect?: boolean;
}

// 考试结果类型
export interface ExamResult {
  stageId: number;
  score: number; // 0-100
  correctCount: number;
  totalQuestions: number;
  isPerfect: boolean;
  completedAt: string;
}

// 用户进度类型
export interface UserProgress {
  currentStage: number;
  unlockedStages: number[];
  stageRecords: {
    [stageId: number]: {
      bestScore: number;
      attempts: number;
      lastPlayTime: string;
      isPassed: boolean;
    };
  };
  totalPlayTime: number; // 秒
  settings: {
    volume: number; // 0-1
    backgroundMusic: boolean;
    soundEffects: boolean;
  };
}

// 路由页面类型
export type PageType = 'home' | 'learning' | 'exam' | 'result';

// 应用状态类型
export interface AppState {
  // 当前状态
  currentPage: PageType;
  currentStageId: number | null;
  currentExam: ExamQuestion[] | null;
  currentExamIndex: number;
  currentScore: number;
  
  // 用户进度
  userProgress: UserProgress;
  
  // 数据
  charactersData: CharactersData | null;
  
  // 方法
  setCurrentPage: (page: PageType) => void;
  setCurrentStageId: (stageId: number | null) => void;
  startExam: (stageId: number) => void;
  answerQuestion: (characterId: number) => void;
  completeExam: () => void;
  unlockNextStage: (stageId: number) => void;
  updateUserProgress: (progress: Partial<UserProgress>) => void;
  saveProgress: () => void;
  loadProgress: () => void;
  resetProgress: () => void;
}

