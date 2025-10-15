import { useAppStore } from '@/store/useAppStore';
import { audioManager } from '@/utils/audioManager';
import { Lock, Star, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

// 25辆不同颜色的炫酷赛车
const carColors = [
  { gradient: 'from-red-500 to-pink-500', emoji: '🏎️', glow: 'shadow-red-500/50' },
  { gradient: 'from-orange-500 to-red-500', emoji: '🚗', glow: 'shadow-orange-500/50' },
  { gradient: 'from-yellow-500 to-orange-500', emoji: '🚙', glow: 'shadow-yellow-500/50' },
  { gradient: 'from-green-500 to-emerald-500', emoji: '🚕', glow: 'shadow-green-500/50' },
  { gradient: 'from-teal-500 to-cyan-500', emoji: '🚓', glow: 'shadow-teal-500/50' },
  { gradient: 'from-blue-500 to-indigo-500', emoji: '🚐', glow: 'shadow-blue-500/50' },
  { gradient: 'from-indigo-500 to-purple-500', emoji: '🚑', glow: 'shadow-indigo-500/50' },
  { gradient: 'from-purple-500 to-pink-500', emoji: '🚒', glow: 'shadow-purple-500/50' },
  { gradient: 'from-pink-500 to-rose-500', emoji: '🚐', glow: 'shadow-pink-500/50' },
  { gradient: 'from-rose-500 to-red-500', emoji: '🚙', glow: 'shadow-rose-500/50' },
  { gradient: 'from-red-400 to-orange-400', emoji: '🏎️', glow: 'shadow-red-400/50' },
  { gradient: 'from-amber-500 to-yellow-500', emoji: '🚗', glow: 'shadow-amber-500/50' },
  { gradient: 'from-lime-500 to-green-500', emoji: '🚕', glow: 'shadow-lime-500/50' },
  { gradient: 'from-emerald-500 to-teal-500', emoji: '🚙', glow: 'shadow-emerald-500/50' },
  { gradient: 'from-cyan-500 to-blue-500', emoji: '🚓', glow: 'shadow-cyan-500/50' },
  { gradient: 'from-sky-500 to-blue-500', emoji: '🚐', glow: 'shadow-sky-500/50' },
  { gradient: 'from-blue-600 to-indigo-600', emoji: '🚑', glow: 'shadow-blue-600/50' },
  { gradient: 'from-violet-500 to-purple-500', emoji: '🚒', glow: 'shadow-violet-500/50' },
  { gradient: 'from-fuchsia-500 to-pink-500', emoji: '🏎️', glow: 'shadow-fuchsia-500/50' },
  { gradient: 'from-rose-400 to-pink-400', emoji: '🚗', glow: 'shadow-rose-400/50' },
  { gradient: 'from-red-600 to-orange-600', emoji: '🚕', glow: 'shadow-red-600/50' },
  { gradient: 'from-yellow-400 to-amber-400', emoji: '🚙', glow: 'shadow-yellow-400/50' },
  { gradient: 'from-green-600 to-teal-600', emoji: '🚓', glow: 'shadow-green-600/50' },
  { gradient: 'from-blue-500 to-purple-500', emoji: '🚐', glow: 'shadow-blue-500/50' },
  { gradient: 'from-pink-600 to-purple-600', emoji: '🏎️', glow: 'shadow-pink-600/50' },
];

export const HomePage = () => {
  const { charactersData, userProgress, setCurrentPage, setCurrentStageId } = useAppStore();

  if (!charactersData) return null;

  // （去除测试提示与诊断入口，保持简洁首页）

  const handleStageClick = (stageId: number) => {
    audioManager.unlockAudio(); // 先解锁音频（移动端需要）
    audioManager.playSound('button');
    setCurrentStageId(stageId);
    setCurrentPage('learning');
  };

  const handleSettingsClick = () => {
    audioManager.playSound('button');
    // TODO: 打开设置弹窗
    alert('设置功能开发中...');
  };

  return (
    <div className="page-container bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center mb-8`}
      >
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
          汉字赛车总动员
        </h1>
        <p className="text-xl text-white/90">选择关卡开始学习吧！</p>
      </motion.div>

      {/* 设置按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSettingsClick}
        className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm p-3 rounded-full shadow-lg"
      >
        <Settings size={24} className="text-white" />
      </motion.button>

      {/* 关卡列表 */}
      <div className="w-full max-w-md overflow-y-auto max-h-[60vh] px-4">
        <div className="grid grid-cols-5 gap-3">
          {charactersData.levels.map(level =>
            level.stages.map(stage => {
              const isUnlocked = userProgress.unlockedStages.includes(stage.stageId);
              const record = userProgress.stageRecords[stage.stageId];
              const isPassed = record?.isPassed || false;
              const carStyle = carColors[stage.stageId - 1];

              return (
                <motion.button
                  key={stage.stageId}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    delay: stage.stageId * 0.03,
                    type: 'spring',
                    stiffness: 200
                  }}
                  whileTap={{ scale: isUnlocked ? 0.9 : 1 }}
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                  onClick={() => isUnlocked && handleStageClick(stage.stageId)}
                  disabled={!isUnlocked}
                  className={`
                    relative aspect-square rounded-3xl flex flex-col items-center justify-center
                    transition-all duration-300
                    ${isUnlocked
                      ? `bg-gradient-to-br ${carStyle.gradient} shadow-2xl ${carStyle.glow} cursor-pointer`
                      : 'bg-gray-400 cursor-not-allowed opacity-50 shadow-lg'
                    }
                  `}
                >
                  {/* 关卡图标 */}
                  <div className="relative">
                    {isUnlocked ? (
                      <motion.div
                        animate={isPassed ? { 
                          rotate: [0, -10, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                        className="text-5xl"
                      >
                        {carStyle.emoji}
                      </motion.div>
                    ) : (
                      <Lock size={28} className="text-gray-600" />
                    )}
                    
                    {/* 通过徽章 */}
                    {isPassed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.5 }}
                        className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"
                      >
                        <Star
                          size={14}
                          className="text-white fill-white"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* 关卡号 */}
                  <span className={`
                    text-sm font-bold mt-1
                    ${isUnlocked ? 'text-white drop-shadow-lg' : 'text-gray-600'}
                  `}>
                    {stage.stageId}
                  </span>

                  {/* 最佳成绩 */}
                  {record && record.bestScore > 0 && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-1 text-xs font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full"
                    >
                      {record.bestScore}分
                    </motion.span>
                  )}

                  {/* 发光效果 */}
                  {isUnlocked && isPassed && (
                    <motion.div
                      className="absolute inset-0 rounded-3xl bg-white/20"
                      animate={{
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* 当前进度提示 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-white/30 backdrop-blur-sm rounded-2xl p-4 max-w-md"
      >
        <p className="text-white text-center text-lg">
          当前进度：第 {userProgress.currentStage} 关 / 共 25 关
        </p>
        <p className="text-white/80 text-center text-sm mt-1">
          已解锁 {userProgress.unlockedStages.length} 关
        </p>
      </motion.div>
      
    </div>
  );
};

