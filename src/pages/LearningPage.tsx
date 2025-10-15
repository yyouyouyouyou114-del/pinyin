import { useAppStore } from '@/store/useAppStore';
import { audioManager } from '@/utils/audioManager';
import { getStageById } from '@/utils/helpers';
import emojiMap from '@/data/emoji-map.json';
import { ArrowLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export const LearningPage = () => {
  const { charactersData, currentStageId, setCurrentPage, startExam } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedIndices, setLearnedIndices] = useState<Set<number>>(new Set([0])); // 记录已学习的汉字索引

  // 在页面加载时解锁音频（隐藏调试提示）
  useEffect(() => {
    // 添加点击事件监听器来解锁音频
    const unlockAudio = () => {
      audioManager.unlockAudio();
      console.log('🔓 Audio unlocked on LearningPage');
    };
    
    // 监听任何用户交互
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
    
    // 立即尝试加载语音列表
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    
    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  if (!charactersData || !currentStageId) {
    return null;
  }

  const stage = getStageById(currentStageId, charactersData);
  if (!stage) return null;

  const currentChar = stage.characters[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === stage.characters.length - 1;
  const totalChars = stage.characters.length;
  const learnedCount = learnedIndices.size;
  const allLearned = learnedCount === totalChars;

  const handleBack = () => {
    audioManager.playSound('button');
    setCurrentPage('home');
  };

  const handleStartExam = () => {
    audioManager.playSound('button');
    audioManager.playPraise('basic');
    startExam(currentStageId);
  };

  const handleCharacterClick = () => {
    console.log('Character clicked:', currentChar.char);
    // 先解锁音频
    audioManager.unlockAudio();
    // 播放按钮音效
    audioManager.playSound('button');
    // 延迟播放汉字读音，确保按钮音效播放完
    setTimeout(() => {
      audioManager.playCharacterSound(currentChar.char);
    }, 200);
  };

  const handlePrev = () => {
    if (!isFirst) {
      audioManager.playSound('button');
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      // 标记为已学习
      setLearnedIndices(prev => new Set(prev).add(newIndex));
    }
  };

  const handleNext = () => {
    if (!isLast) {
      audioManager.playSound('button');
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      // 标记为已学习
      setLearnedIndices(prev => new Set(prev).add(newIndex));
      // 自动播放新汉字的读音
      setTimeout(() => {
        audioManager.playCharacterSound(stage.characters[newIndex].char);
      }, 300);
    }
  };

  // 进入/切换时预取：当前 + 后2个
  useEffect(() => {
    const ahead1 = stage.characters[currentIndex + 1]?.char;
    const ahead2 = stage.characters[currentIndex + 2]?.char;
    audioManager.prefetchCharacters([currentChar.char, ahead1, ahead2]);
  }, [currentIndex, stage.stageId, currentChar.char, stage.characters]);

  return (
    <div className="page-container bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400">
      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="bg-white/30 backdrop-blur-sm p-3 rounded-full shadow-lg"
        >
          <ArrowLeft size={24} className="text-white" />
        </motion.button>

        <h2 className="text-2xl font-bold text-white drop-shadow-lg">
          {stage.name} - 学习模式
        </h2>

        <div className="w-12" /> {/* 占位符，保持标题居中 */}
      </div>

      {/* 进度指示器 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-24 left-0 right-0 flex flex-col items-center px-4"
      >
        {/* 学习进度提示 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            rounded-full px-4 py-1.5 text-sm font-semibold
            ${allLearned 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-400 text-gray-800'
            }
          `}
        >
          {allLearned ? '✅ 全部学完！可以考试了' : `📚 已学 ${learnedCount} / ${totalChars} 个`}
        </motion.div>
      </motion.div>

      {/* 大汉字卡片 - 居中显示 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.8, x: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: -100 }}
        transition={{ type: 'spring', duration: 0.5 }}
        onClick={handleCharacterClick}
        className="character-card w-[75%] max-w-md mx-auto cursor-pointer relative"
      >
        {/* Emoji图标 */}
        <div className="text-9xl text-center mb-4">
          {emojiMap.mappings[currentChar.char as keyof typeof emojiMap.mappings] || '📝'}
        </div>

        {/* 汉字 */}
        <div style={{ fontSize: '8rem' }} className="text-center text-gray-800 font-hanzi font-bold leading-none">
          {currentChar.char}
        </div>

        {/* 拼音 */}
        <div className="text-4xl text-center text-gray-600 mt-6 font-bold">
          {currentChar.pinyin}
        </div>

        {/* 笔画数 */}
        <div className="text-xl text-center text-gray-500 mt-3">
          {currentChar.strokes} 画
        </div>

        {/* 播放按钮指示 */}
        <motion.div
          className="absolute top-4 right-4 bg-primary-500 rounded-full p-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Play size={32} className="text-white" fill="white" />
        </motion.div>
      </motion.div>

      {/* 左右切换按钮 */}
      <div className="absolute bottom-40 left-0 right-0 flex justify-between items-center px-8">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev}
          disabled={isFirst}
          className={`
            w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl
            ${isFirst ? 'bg-gray-300 text-gray-500' : 'bg-white text-primary-600'}
          `}
        >
          ←
        </motion.button>

        <div className="w-12" />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          disabled={isLast}
          className={`
            w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl
            ${isLast ? 'bg-gray-300 text-gray-500' : 'bg-white text-primary-600'}
          `}
        >
          →
        </motion.button>
      </div>

      {/* 底部开始考试按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-0 right-0 flex flex-col items-center px-4 gap-2"
      >
        <motion.button
          onClick={handleStartExam}
          disabled={!allLearned}
          whileTap={allLearned ? { scale: 0.95 } : {}}
          className={`
            w-full max-w-md font-bold py-4 px-8 rounded-2xl shadow-2xl text-xl
            transition-all duration-200
            ${allLearned
              ? 'bg-primary-500 text-white cursor-pointer active:scale-95'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
            }
          `}
        >
          {allLearned ? '开始考试 🏁' : '🔒 学完所有汉字后开始'}
        </motion.button>
      </motion.div>

    </div>
  );
};

