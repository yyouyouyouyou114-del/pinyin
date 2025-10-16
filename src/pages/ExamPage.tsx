import { useAppStore } from '@/store/useAppStore';
import { audioManager } from '@/utils/audioManager';
import emojiMap from '@/data/emoji-map.json';
import { Volume2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export const ExamPage = () => {
  const { currentExam, currentExamIndex, currentScore, answerQuestion } = useAppStore();
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQuestion = currentExam?.[currentExamIndex];

  // 页面加载时解锁音频
  useEffect(() => {
    const unlockAudio = () => {
      audioManager.unlockAudio();
      console.log('🔓 Audio unlocked on ExamPage');
    };
    
    // 监听任何用户交互
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
    
    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  useEffect(() => {
    // 每道新题目开始时播放读音
    if (currentQuestion && !showFeedback) {
      // 先解锁音频，再播放
      audioManager.unlockAudio();
      // 预取本题正确答案与下一题的正确答案
      const nextQuestion = currentExam?.[currentExamIndex + 1];
      const charsToPrefetch = [
        currentQuestion.correctCharacter.char,
        nextQuestion?.correctCharacter.char,
        ...currentQuestion.options.map(o => o.char).slice(0, 2),
      ];
      audioManager.prefetchCharacters(charsToPrefetch);
      setTimeout(() => {
        audioManager.playCharacterSound(currentQuestion.correctCharacter.char);
      }, 500);
    }
  }, [currentExamIndex, currentQuestion, showFeedback]);

  if (!currentExam || !currentQuestion) {
    return null;
  }

  const handleOptionClick = (characterId: number) => {
    if (showFeedback || selectedOption !== null) return; // 防止重复点击

    audioManager.playSound('button');
    setSelectedOption(characterId);
    setShowFeedback(true);

    const isCorrect = characterId === currentQuestion.correctCharacter.id;

    // 播放反馈音效和语音
    setTimeout(() => {
      if (isCorrect) {
        audioManager.playSound('correct');
        
        // 延迟播放表扬语音，确保音效播放完
        setTimeout(() => {
          const praiseType = Math.random() > 0.5 ? 'combo' : 'basic';
          audioManager.playPraise(praiseType);
          console.log('🎉 触发表扬语音:', praiseType);
        }, 300);
      } else {
        audioManager.playSound('wrong');
        
        // 延迟播放鼓励语音
        setTimeout(() => {
          audioManager.playEncouragement();
          console.log('💪 触发鼓励语音');
        }, 300);
      }
    }, 100);

    // 提交答案（会自动跳转到下一题或结果页）
    setTimeout(() => {
      answerQuestion(characterId);
      setShowFeedback(false);
      setSelectedOption(null);
    }, 1500);
  };

  const handleReplaySound = () => {
    audioManager.playSound('button');
    audioManager.playCharacterSound(currentQuestion.correctCharacter.char);
  };

  const progress = ((currentExamIndex + 1) / currentExam.length) * 100;

  return (
    <div className="page-container bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 flex flex-col">
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        {/* 进度条 */}
        <div className="bg-white/30 rounded-full h-3 mb-4 overflow-hidden">
          <motion.div
            className="bg-white h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* 题号和分数 */}
        <div className="flex justify-between items-center">
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl px-4 py-2">
            <span className="text-white font-bold text-lg">
              第 {currentExamIndex + 1} 题 / 共 {currentExam.length} 题
            </span>
          </div>

          <div className="bg-white/30 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-300" />
            <span className="text-white font-bold text-lg">
              {currentScore} 分
            </span>
          </div>
        </div>

      </div>

      {/* 主内容区域 - 垂直居中，减少顶部空白 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-8">
        {/* 播放按钮 - 放大 */}
        <div className="flex flex-col items-center justify-center mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleReplaySound}
            className="bg-white rounded-full p-8 shadow-2xl active:shadow-lg transition-shadow"
          >
            <Volume2 size={56} className="text-primary-500" />
          </motion.button>
          <p className="text-white text-xl mt-4 drop-shadow-lg font-medium">
            点击播放读音
          </p>
        </div>

        {/* 选项区域 - 增大卡片宽度 */}
        <div className="w-full max-w-xl px-2">
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const emoji = emojiMap.mappings[option.char as keyof typeof emojiMap.mappings] || '📝';
            const isSelected = selectedOption === option.id;
            const isCorrect = option.id === currentQuestion.correctCharacter.id;
            const showResult = showFeedback && isSelected;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: showFeedback ? 1 : 0.95 }}
                onClick={() => handleOptionClick(option.id)}
                disabled={showFeedback}
                className={`
                  bg-white rounded-3xl p-6 shadow-xl
                  aspect-square
                  transition-all duration-300 relative
                  flex flex-col items-center justify-center
                  ${showResult && isCorrect ? 'ring-4 ring-green-400 bg-green-50' : ''}
                  ${showResult && !isCorrect ? 'ring-4 ring-red-400 bg-red-50' : ''}
                  ${!showFeedback ? 'hover:shadow-2xl active:shadow-lg' : ''}
                  ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Emoji图标 */}
                <div className="text-center mb-3">
                  <span className={
                    // 检测是否为纯文本（如"1000"），使用较小字体
                    /^[0-9a-zA-Z]+$/.test(emoji)
                      ? 'text-3xl font-bold'
                      : 'text-5xl'
                  }>
                    {emoji}
                  </span>
                </div>

                {/* 汉字 */}
                <div className="text-6xl text-center text-gray-800 font-bold">
                  {option.char}
                </div>

                {/* 反馈图标 */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {isCorrect ? (
                        <div className="text-7xl celebrate">✅</div>
                      ) : (
                        <div className="text-7xl">❌</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
        </div>
      </div>

      {/* 显示正确答案（答错时） */}
      <AnimatePresence>
        {showFeedback && selectedOption !== currentQuestion.correctCharacter.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 left-0 right-0 text-center px-4"
          >
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto">
              <p className="text-white text-lg">
                正确答案是：
                <span className="font-bold text-2xl ml-2">
                  {currentQuestion.correctCharacter.char}
                </span>
                <span className="ml-2">
                  ({currentQuestion.correctCharacter.pinyin})
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

