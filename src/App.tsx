import { useAppStore } from '@/store/useAppStore';
import { HomePage } from '@/pages/HomePage';
import { LearningPage } from '@/pages/LearningPage';
import { ExamPage } from '@/pages/ExamPage';
import { ResultPage } from '@/pages/ResultPage';
import { AnimatePresence, motion } from 'framer-motion';
import { audioManager } from '@/utils/audioManager';
import { useEffect } from 'react';

function App() {
  const { currentPage } = useAppStore();

  // 全局解锁音频（移动端必需）
  useEffect(() => {
    const unlockAudio = () => {
      audioManager.unlockAudio();
      console.log('🔓 Audio unlocked globally');
    };

    // 监听任何用户交互来解锁音频
    const events = ['touchstart', 'touchend', 'mousedown', 'click'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, []);

  // 页面切换动画配置
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const pageTransition = {
    type: 'tween',
    duration: 0.3,
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="w-full h-full"
        >
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'learning' && <LearningPage />}
          {currentPage === 'exam' && <ExamPage />}
          {currentPage === 'result' && <ResultPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;

