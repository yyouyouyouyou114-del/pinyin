import { useAppStore } from '@/store/useAppStore';
import { audioManager } from '@/utils/audioManager';
import { getScoreRating } from '@/utils/helpers';
import { Home, RotateCcw, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export const ResultPage = () => {
  const {
    currentScore,
    currentStageId,
    currentExam,
    userProgress,
    setCurrentPage,
    setCurrentStageId,
    startExam,
  } = useAppStore();

  const isPerfect = currentScore === 100;
  const isPassed = currentScore >= 60;
  const rating = getScoreRating(currentScore);

  const correctCount = currentExam?.filter(q => q.isCorrect).length || 0;
  const totalQuestions = currentExam?.length || 10;

  useEffect(() => {
    // 根据分数播放表扬
    setTimeout(() => {
      if (isPerfect) {
        audioManager.playPraise('perfect');
      } else if (currentScore >= 80) {
        audioManager.playPraise('combo');
      } else if (isPassed) {
        audioManager.playPraise('basic');
      } else {
        audioManager.playEncouragement();
      }
    }, 500);
  }, [currentScore, isPerfect, isPassed]);

  const handleBackHome = () => {
    audioManager.playSound('button');
    setCurrentPage('home');
    setCurrentStageId(null);
  };

  const handleRetry = () => {
    audioManager.playSound('button');
    if (currentStageId) {
      startExam(currentStageId);
    }
  };

  const handleNextStage = () => {
    audioManager.playSound('button');
    if (currentStageId && currentStageId < 25) {
      const nextStageId = currentStageId + 1;
      if (userProgress.unlockedStages.includes(nextStageId)) {
        setCurrentStageId(nextStageId);
        setCurrentPage('learning');
      }
    }
  };

  const canGoNext = currentStageId && currentStageId < 25 && userProgress.unlockedStages.includes(currentStageId + 1);

  return (
    <div className="page-container bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
      {/* 庆祝动画 */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="flex flex-col items-center"
      >
        {/* 分数显示 */}
        <motion.div
          className={`
            text-9xl font-bold mb-4
            ${isPerfect ? 'text-yellow-300' : isPassed ? 'text-white' : 'text-white/80'}
          `}
          animate={isPerfect ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {currentScore}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-2"
        >
          {rating}
        </motion.div>

        {/* 详细信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/30 backdrop-blur-sm rounded-3xl p-6 mt-8 max-w-md"
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-white/80 text-sm mb-1">答对题数</div>
              <div className="text-white text-3xl font-bold">
                {correctCount} / {totalQuestions}
              </div>
            </div>
            <div>
              <div className="text-white/80 text-sm mb-1">正确率</div>
              <div className="text-white text-3xl font-bold">
                {Math.round((correctCount / totalQuestions) * 100)}%
              </div>
            </div>
          </div>

          {/* 状态提示 */}
          <div className="mt-4 pt-4 border-t border-white/30">
            {isPerfect && (
              <p className="text-white text-lg text-center">
                🌟 完美通关！你真是太厉害了！
              </p>
            )}
            {isPassed && !isPerfect && (
              <p className="text-white text-lg text-center">
                ✅ 通过考试！继续加油！
              </p>
            )}
            {!isPassed && (
              <p className="text-white text-lg text-center">
                💪 再试一次，你一定可以的！
              </p>
            )}
          </div>
        </motion.div>

        {/* 按钮组 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-4 mt-8 w-full max-w-md px-4"
        >
          {/* 下一关按钮（仅当解锁了下一关时显示） */}
          {canGoNext && isPassed && (
            <button
              onClick={handleNextStage}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <span>下一关</span>
              <ArrowRight size={24} />
            </button>
          )}

          {/* 重新挑战 */}
          <button
            onClick={handleRetry}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RotateCcw size={24} />
            <span>重新挑战</span>
          </button>

          {/* 返回主页 */}
          <button
            onClick={handleBackHome}
            className="bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-2xl shadow-lg active:scale-95 transition-transform duration-150 text-xl flex items-center justify-center gap-2"
          >
            <Home size={24} />
            <span>返回主页</span>
          </button>
        </motion.div>
      </motion.div>

      {/* 烟花效果（满分时） */}
      {isPerfect && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl"
              initial={{
                x: '50vw',
                y: '50vh',
                opacity: 0,
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

