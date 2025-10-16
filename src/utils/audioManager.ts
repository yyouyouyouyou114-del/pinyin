import { Howl } from 'howler';
import praiseDataJson from '@/data/praise-voices.json';

// 音频管理器类
class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Howl> = new Map();
  private volume: number = 0.8;
  private backgroundMusic: Howl | null = null;
  private audioContext: AudioContext | null = null;
  private isAudioUnlocked: boolean = false;
  private isSpeaking: boolean = false; // 是否正在播放语音
  private speechQueue: Array<() => void> = []; // 语音队列
  private prefetchAudios: Map<string, HTMLAudioElement> = new Map(); // 预取中的音频
  
  private constructor() {
    // 私有构造函数，确保单例
    this.initAudioContext();
  }

  // 初始化音频上下文（移动端兼容）
  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('✅ AudioContext initialized');
    } catch (e) {
      console.warn('⚠️ AudioContext not supported:', e);
    }
    
    // 检测微信浏览器并设置特殊处理
    this.setupWeChatBridge();
  }

  // 微信浏览器专门处理
  private setupWeChatBridge() {
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
    if (isWeChat) {
      console.log('📱 检测到微信浏览器，启用特殊处理');
      
      // 监听微信 JS Bridge 准备完成
      if (typeof (window as any).WeixinJSBridge === 'undefined') {
        document.addEventListener('WeixinJSBridgeReady', () => {
          console.log('✅ WeixinJSBridge Ready');
          this.unlockAudioForWeChat();
        }, false);
      } else {
        this.unlockAudioForWeChat();
      }
    }
  }

  // 微信浏览器音频解锁
  private unlockAudioForWeChat() {
    const WeixinJSBridge = (window as any).WeixinJSBridge;
    if (WeixinJSBridge) {
      console.log('🔓 尝试通过 WeixinJSBridge 解锁音频');
      
      // 解锁 AudioContext
      if (this.audioContext && this.audioContext.state === 'suspended') {
        WeixinJSBridge.invoke('getNetworkType', {}, () => {
          this.audioContext?.resume().then(() => {
            console.log('✅ AudioContext resumed via WeixinJSBridge');
          });
        });
      }
    }
  }

  // 解锁音频（移动端需要用户交互）
  public unlockAudio() {
    if (this.isAudioUnlocked) return;

    console.log('🔓 Unlocking audio...');

    // 解锁 Web Audio API
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('✅ AudioContext resumed');
        }).catch(err => {
          console.error('❌ AudioContext resume failed:', err);
        });
      }
      
      // 播放一个静音音频以解锁（iOS Safari 需要）
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0; // 静音
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start(0);
        oscillator.stop(0.01);
        console.log('✅ Silent audio played for unlock');
      } catch (e) {
        console.warn('⚠️ Silent audio unlock failed:', e);
      }
    }

    // 解锁 Web Speech API（强制初始化）
    if ('speechSynthesis' in window) {
      // 先取消任何待处理的语音
      window.speechSynthesis.cancel();
      
      // 强制加载语音列表
      const voices = window.speechSynthesis.getVoices();
      console.log(`📢 Available voices: ${voices.length}`);
      
      // 播放一个静音的语音来解锁（移动端需要）
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      utterance.rate = 10; // 快速播放
      
      try {
        window.speechSynthesis.speak(utterance);
        setTimeout(() => {
          window.speechSynthesis.cancel();
          console.log('✅ Speech API unlocked');
        }, 100);
      } catch (e) {
        console.warn('⚠️ Speech API unlock failed:', e);
      }
    }

    this.isAudioUnlocked = true;
    console.log('✅ Audio unlock complete');
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // 设置音量
  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => sound.volume(this.volume));
  }

  // 播放汉字读音（优先使用 MP3，回退到 TTS）
  public playCharacterSound(character: string) {
    // 先解锁音频
    this.unlockAudio();
    
    console.log('🔊 Playing character sound:', character);
    // 移除此前对“上”的强制 TTS，改走统一 MP3 流程（下方增加缓存清洗）
    
    // 尝试使用 MP3 文件（按 DeepSeek 建议）
    this.playCharacterSoundAudio(character);
    
    // 如果以后有 MP3 文件，可以使用以下代码：
    /*
    const audioPath = `/audio/characters/${character}.mp3`;
    if (!this.sounds.has(character)) {
      const sound = new Howl({
        src: [audioPath],
        volume: this.volume,
        onload: () => console.log('✅ Audio loaded:', character),
        onloaderror: (_id, error) => {
          console.warn('⚠️ Audio load failed, falling back to TTS:', character, error);
          this.playCharacterSoundTTS(character);
        },
        onplayerror: (_id, error) => console.error('❌ Audio play error:', character, error)
      });
      this.sounds.set(character, sound);
    }
    const sound = this.sounds.get(character);
    if (sound) {
      sound.play();
    }
    */
  }

  // 检查浏览器兼容性
  private checkBrowserCompatibility(): { supported: boolean; browserName: string; reason: string } {
    const ua = navigator.userAgent;
    
    // 检测浏览器类型
    let browserName = '未知浏览器';
    if (/MicroMessenger/i.test(ua)) {
      browserName = '微信浏览器';
    } else if (/baiduboxapp|baidubrowser/i.test(ua)) {
      browserName = '百度浏览器';
    } else if (/QQBrowser/i.test(ua)) {
      browserName = 'QQ浏览器';
    } else if (/UCBrowser/i.test(ua)) {
      browserName = 'UC浏览器';
    } else if (/MiuiBrowser/i.test(ua)) {
      browserName = '小米浏览器';
    } else if (/Chrome/i.test(ua)) {
      browserName = 'Chrome';
    } else if (/Safari/i.test(ua)) {
      browserName = 'Safari';
    } else if (/Firefox/i.test(ua)) {
      browserName = 'Firefox';
    }
    
    // 检查 Speech Synthesis API
    if (!('speechSynthesis' in window)) {
      return {
        supported: false,
        browserName,
        reason: '浏览器不支持 Web Speech API'
      };
    }
    
    // 检查语音列表
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // 可能还在加载中，暂时认为支持
      console.warn('⚠️ 语音列表为空，可能还在加载');
    }
    
    // 微信和百度浏览器已知问题
    if (/MicroMessenger|baiduboxapp|baidubrowser/i.test(ua)) {
      return {
        supported: false,
        browserName,
        reason: '该浏览器对语音合成支持不完整'
      };
    }
    
    return {
      supported: true,
      browserName,
      reason: ''
    };
  }

  // 语音队列处理
  private processSpeechQueue() {
    if (this.isSpeaking || this.speechQueue.length === 0) {
      return;
    }
    
    this.isSpeaking = true;
    const nextSpeech = this.speechQueue.shift();
    if (nextSpeech) {
      nextSpeech();
    }
  }

  // 使用 HTML5 Audio 播放汉字音频（按 DeepSeek 建议）
  private playCharacterSoundAudio(character: string) {
    const urls = [
      `/audio/characters/${character}.mp3`,
      `/audio/characters/${encodeURIComponent(character)}.mp3`,
    ];

    const tryPlayUrl = (idx: number) => {
      if (idx >= urls.length) {
        console.warn('⚠️ 所有MP3路径均失败，回退到TTS:', character);
        this.playCharacterSoundTTS(character);
        return;
      }

      const url = urls[idx];
      console.log('🎵 尝试播放 MP3:', url);

      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = this.volume;
      audio.crossOrigin = 'anonymous';
      audio.load();

      let finishedOrFailed = false;
      const failAndNext = (reason: string) => {
        if (finishedOrFailed) return;
        finishedOrFailed = true;
        console.warn(`⚠️ MP3 失败（${reason}）:`, url);
        // 推入下一尝试并立即让队列继续
        tryPlayUrl(idx + 1);
        this.isSpeaking = false;
        this.processSpeechQueue();
      };

      const timeout = window.setTimeout(() => failAndNext('timeout'), 1200);
      audio.addEventListener('canplaythrough', () => window.clearTimeout(timeout), { once: true });
      audio.addEventListener('stalled', () => failAndNext('stalled'), { once: true });
      audio.addEventListener('abort', () => failAndNext('abort'), { once: true });
      audio.addEventListener('error', () => failAndNext('error'), { once: true });
      audio.addEventListener('playing', () => {
        console.log('▶️ MP3 正在播放:', character);
      }, { once: true });

      audio.addEventListener('ended', () => {
        if (finishedOrFailed) return;
        console.log('✅ MP3 播放完成:', character);
        this.isSpeaking = false;
        this.processSpeechQueue();
      });

      this.speechQueue.push(() => {
        console.log('▶️ 开始播放 MP3:', character);
        let retried = false;
        const tryPlay = () => audio.play().then(() => {
          window.clearTimeout(timeout);
        }).catch(err => {
          console.error('❌ MP3 播放失败:', err);
          if (!retried) {
            retried = true;
            // 尝试恢复音频环境后重试一次
            try { this.audioContext?.resume?.(); } catch {}
            setTimeout(() => {
              audio.load();
              tryPlay();
            }, 150);
          } else {
            failAndNext('play-reject');
          }
        });
        tryPlay();
      });

      this.processSpeechQueue();
    };

    tryPlayUrl(0);
  }

  // 预取相邻汉字的音频，减少点击等待
  public prefetchCharacters(characters: string[]) {
    const unique = Array.from(new Set(characters.filter(Boolean)));
    unique.forEach((ch) => {
      if (this.prefetchAudios.has(ch)) return;
      const url = `/audio/characters/${encodeURIComponent(ch)}.mp3`;
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'auto';
      (audio as any).crossOrigin = 'anonymous';
      // 加入内存缓存，加载失败时清理
      audio.addEventListener('canplaythrough', () => {
        this.prefetchAudios.set(ch, audio);
      }, { once: true });
      audio.addEventListener('error', () => {
        this.prefetchAudios.delete(ch);
      }, { once: true });
    });
  }

  // Web Speech API TTS 实现（针对小米/MIUI 优化）
  private playCharacterSoundTTS(character: string) {
    // 检查浏览器兼容性
    const compatibility = this.checkBrowserCompatibility();
    
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech Synthesis API 不支持');
      console.error(`   浏览器: ${compatibility.browserName}`);
      console.error(`   建议: 请使用 Chrome、Safari 或系统默认浏览器`);
      return;
    }

    if (!compatibility.supported) {
      console.error('❌ 浏览器语音功能不可用');
      console.error(`   浏览器: ${compatibility.browserName}`);
      console.error(`   原因: ${compatibility.reason}`);
      console.error(`   建议: 请复制链接到 Chrome 或系统默认浏览器中打开`);
      return;
    }

    console.log('🎤 准备播放 TTS:', character);
    console.log(`   浏览器: ${compatibility.browserName}`);
    
    // 添加到队列而不是立即播放
    this.speechQueue.push(() => {
      this.speakNow(character);
    });
    
    this.processSpeechQueue();
  }

  // 实际播放语音（内部方法）
  private speakNow(character: string) {
    // 强制取消之前的播放
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('⚠️ Cancel previous speech failed:', e);
    }
    
    // Android/MIUI 设备需要等待语音列表加载
    const speak = () => {
      try {
        const utterance = new SpeechSynthesisUtterance(character);
        
        // 获取所有可用语音
        const voices = window.speechSynthesis.getVoices();
        console.log('📢 总共可用语音:', voices.length);
        
        if (voices.length === 0) {
          console.warn('⚠️ 没有可用语音，将使用系统默认');
        } else {
          // 打印所有语音供调试
          voices.forEach(v => {
            console.log(`  - ${v.name} (${v.lang}) ${v.localService ? '[本地]' : '[远程]'}`);
          });
        }
        
        // 优先级查找中文语音（针对小米优化）
        let chineseVoice = null;
        
        // 1. 首选：标准普通话
        chineseVoice = voices.find(v => v.lang === 'zh-CN' && v.localService);
        
        // 2. 备选：任何 zh-CN
        if (!chineseVoice) {
          chineseVoice = voices.find(v => v.lang === 'zh-CN');
        }
        
        // 3. 备选：简体中文
        if (!chineseVoice) {
          chineseVoice = voices.find(v => v.lang.startsWith('zh-Hans'));
        }
        
        // 4. 备选：任何中文
        if (!chineseVoice) {
          chineseVoice = voices.find(v => v.lang.startsWith('zh') || v.lang.includes('CN'));
        }
        
        // 5. 备选：名称包含中文
        if (!chineseVoice) {
          chineseVoice = voices.find(v => 
            v.name.includes('Chinese') || 
            v.name.includes('中文') || 
            v.name.includes('普通话')
          );
        }
        
        if (chineseVoice) {
          utterance.voice = chineseVoice;
          console.log('✅ 使用语音:', chineseVoice.name, '(', chineseVoice.lang, ')', 
            chineseVoice.localService ? '[本地]' : '[需要网络]');
        } else {
          console.warn('⚠️ 未找到中文语音，使用系统默认');
        }
        
        // 设置语音参数（针对小米优化）
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;  // 更慢，更清晰
        utterance.pitch = 1.0; // 标准音调
        utterance.volume = 1.0; // 最大音量
        
        // 事件监听
        utterance.onerror = (event) => {
          console.error('❌ 语音播放错误:', event.error);
          console.error('   错误详情:', event);
          
          // 针对常见错误的提示
          if (event.error === 'network') {
            console.error('   -> 需要网络连接，请检查网络');
          } else if (event.error === 'synthesis-unavailable') {
            console.error('   -> 语音引擎不可用，请重启浏览器');
          } else if (event.error === 'not-allowed') {
            console.error('   -> 浏览器禁止自动播放，请用户手动触发');
          } else if (event.error === 'interrupted') {
            console.warn('   -> 语音被中断（通常是新语音覆盖）');
          }
          
          // 标记播放完成，处理队列
          this.isSpeaking = false;
          setTimeout(() => this.processSpeechQueue(), 100);
        };
        
        utterance.onstart = () => {
          console.log('🗣️ 开始播放:', character);
        };
        
        utterance.onend = () => {
          console.log('✅ 播放结束:', character);
          // 标记播放完成，处理队列
          this.isSpeaking = false;
          setTimeout(() => this.processSpeechQueue(), 100);
        };
        
        utterance.onpause = () => {
          console.log('⏸️ 播放暂停:', character);
        };
        
        utterance.onresume = () => {
          console.log('▶️ 播放恢复:', character);
        };
        
        // 小米手机需要更长的延迟
        const delay = /Xiaomi|Mi|Redmi|MIUI/i.test(navigator.userAgent) ? 150 : 50;
        console.log('⏱️ 延迟', delay, 'ms 后播放...');
        
        setTimeout(() => {
          try {
            console.log('▶️ 执行播放命令...');
            window.speechSynthesis.speak(utterance);
            
            // 确保播放（某些设备需要）
            if (window.speechSynthesis.paused) {
              console.log('⚠️ 检测到暂停状态，尝试恢复...');
              window.speechSynthesis.resume();
            }
          } catch (e) {
            console.error('❌ 播放失败:', e);
            alert(`语音播放失败: ${e}`);
          }
        }, delay);
      } catch (e) {
        console.error('❌ TTS 初始化失败:', e);
        alert(`语音初始化失败: ${e}`);
      }
    };
    
    // 获取语音列表（小米手机可能需要多次尝试）
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      console.log('⏳ 语音列表未加载，等待中...');
      
      // 设置超时保护
      const timeout = setTimeout(() => {
        console.warn('⚠️ 语音加载超时，使用默认语音');
        speak();
      }, 2000);
      
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        clearTimeout(timeout);
        console.log('✅ 语音列表已加载');
        speak();
      }, { once: true });
      
      // 强制触发语音列表加载
      window.speechSynthesis.getVoices();
    } else {
      // 语音已加载，直接播放
      speak();
    }
  }

  // 播放表扬语音（使用队列）
  public playPraise(type: 'basic' | 'combo' | 'perfect' = 'basic') {
    // 先解锁音频
    this.unlockAudio();
    
    // 若当前环境对 TTS 支持不佳（如微信/百度系），优先使用本地 MP3 兜底
    const compatibility = this.checkBrowserCompatibility();
    if (!compatibility.supported) {
      this.playPraiseMp3Fallback(type);
      return;
    }

    const praiseData = praiseDataJson.praiseVoices[type];
    // 仅使用不超过8个字，且不含顿号/逗号/句号的单句
    const filtered = praiseData.phrases
      .map(p => (p.text || '').trim())
      .filter(t => t.length > 0 && t.length <= 8)
      .filter(t => !(/[，、。；]/.test(t)));
    // 兜底的简短表扬词（可重复）
    const fallbacks = ['真棒！','太棒了！','做得好！','很厉害！','不错哦！','答对了！'];
    const candidates = filtered.length > 0 ? filtered : fallbacks;
    const text = candidates[Math.floor(Math.random() * candidates.length)];
    
    console.log('🎉 准备播放表扬:', text);
    
    // 添加到队列
    if ('speechSynthesis' in window) {
      this.speechQueue.push(() => {
        this.speakPraiseNow(text);
      });
      this.processSpeechQueue();
    }
  }

  // 表扬语音 MP3 兜底（移动端/微信）
  private playPraiseMp3Fallback(type: 'basic' | 'combo' | 'perfect') {
    // 预设少量候选文件名，存在即播，不存在自动换下一个
    const candidates = [
      `/audio/praise/praise_${type}_01.mp3`,
      `/audio/praise/praise_${type}_02.mp3`,
      `/audio/praise/praise_${type}_03.mp3`,
    ];

    const tryIdx = (idx: number) => {
      if (idx >= candidates.length) {
        console.warn('⚠️ 未找到可用的表扬 MP3，跳过');
        return;
      }
      const url = candidates[idx];
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = this.volume;
      (audio as any).crossOrigin = 'anonymous';

      let done = false;
      const fail = () => {
        if (done) return;
        done = true;
        console.warn('⚠️ 表扬 MP3 加载失败，尝试下一个：', url);
        tryIdx(idx + 1);
      };

      audio.addEventListener('canplaythrough', () => {
        // 使用播放队列，避免与其他音频重叠
        this.speechQueue.push(() => {
          audio.play().then(() => {
            console.log('▶️ 播放表扬 MP3:', url);
          }).catch(err => {
            console.error('❌ 表扬 MP3 播放失败:', err);
            fail();
            this.isSpeaking = false;
            this.processSpeechQueue();
          });
        });
        this.processSpeechQueue();
      }, { once: true });

      audio.addEventListener('error', fail, { once: true });
      audio.addEventListener('ended', () => {
        this.isSpeaking = false;
        this.processSpeechQueue();
      }, { once: true });
    };

    tryIdx(0);
  }

  // 实际播放表扬语音（更稳健：等待语音列表、优先童声、必要时恢复播放）
  private speakPraiseNow(text: string) {
    window.speechSynthesis.cancel();

    const createUtterance = () => {
      const utterance = new SpeechSynthesisUtterance(text);

      // 选择中文语音（优先童声/女声）
      const voices = window.speechSynthesis.getVoices();
      let chineseVoice = voices.find(v =>
        (v.lang === 'zh-CN' || v.lang.startsWith('zh')) &&
        (v.name.includes('小') || v.name.includes('Child') || v.name.includes('Kid'))
      );
      if (!chineseVoice) {
        chineseVoice = voices.find(v =>
          (v.lang === 'zh-CN' || v.lang.startsWith('zh')) &&
          (v.name.includes('Female') || v.name.includes('女'))
        );
      }
      if (!chineseVoice) {
        chineseVoice = voices.find(v => v.lang === 'zh-CN' || v.lang.startsWith('zh'));
      }
      if (chineseVoice) {
        utterance.voice = chineseVoice;
        console.log('🎤 使用语音:', chineseVoice.name);
      }

      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.5; // 童音效果
      utterance.volume = this.volume;

      utterance.onerror = (event) => {
        console.error('❌ Praise speech error:', event.error);
        this.isSpeaking = false;
        setTimeout(() => this.processSpeechQueue(), 100);
      };
      utterance.onend = () => {
        console.log('✅ 表扬播放完成');
        this.isSpeaking = false;
        setTimeout(() => this.processSpeechQueue(), 100);
      };

      // 小米/MIUI 延迟更长一点
      const delay = /Xiaomi|Mi|Redmi|MIUI/i.test(navigator.userAgent) ? 150 : 50;
      setTimeout(() => {
        try {
          console.log('🎉 播放表扬:', text);
          window.speechSynthesis.speak(utterance);
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (e) {
          console.error('❌ Failed to speak praise:', e);
          this.isSpeaking = false;
          this.processSpeechQueue();
        }
      }, delay);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('⏳ 语音列表未加载，等待中（表扬）...');
      const timeout = setTimeout(() => {
        console.warn('⚠️ 语音加载超时（表扬），使用默认语音');
        createUtterance();
      }, 2000);
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        clearTimeout(timeout);
        console.log('✅ 语音列表已加载（表扬）');
        createUtterance();
      }, { once: true });
      window.speechSynthesis.getVoices();
    } else {
      createUtterance();
    }
  }

  // 播放鼓励语音（答错时，使用队列）
  public playEncouragement() {
    // 先解锁音频
    this.unlockAudio();
    const compatibility = this.checkBrowserCompatibility();
    if (!compatibility.supported) {
      this.playEncouragementMp3Fallback();
      return;
    }
    
    // 使用固定的简短单句鼓励词（<=8字，可重复）
    const candidates = ['加油！','再试试！','别灰心！','你可以！','别担心！','继续加油！'];
    const text = candidates[Math.floor(Math.random() * candidates.length)];
    
    console.log('💪 准备播放鼓励:', text);
    
    // 添加到队列
    if ('speechSynthesis' in window) {
      this.speechQueue.push(() => {
        this.speakEncouragementNow(text);
      });
      this.processSpeechQueue();
    }
  }

  // 鼓励语音 MP3 兜底（移动端/微信）
  private playEncouragementMp3Fallback() {
    const candidates = [
      '/audio/praise/encouragement_01.mp3',
      '/audio/praise/encouragement_02.mp3',
      '/audio/praise/encouragement_03.mp3',
    ];

    const tryIdx = (idx: number) => {
      if (idx >= candidates.length) {
        console.warn('⚠️ 未找到可用的鼓励 MP3，跳过');
        return;
      }
      const url = candidates[idx];
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = this.volume;
      (audio as any).crossOrigin = 'anonymous';

      let done = false;
      const fail = () => {
        if (done) return;
        done = true;
        console.warn('⚠️ 鼓励 MP3 加载失败，尝试下一个：', url);
        tryIdx(idx + 1);
      };

      audio.addEventListener('canplaythrough', () => {
        this.speechQueue.push(() => {
          audio.play().then(() => {
            console.log('▶️ 播放鼓励 MP3:', url);
          }).catch(err => {
            console.error('❌ 鼓励 MP3 播放失败:', err);
            fail();
            this.isSpeaking = false;
            this.processSpeechQueue();
          });
        });
        this.processSpeechQueue();
      }, { once: true });

      audio.addEventListener('error', fail, { once: true });
      audio.addEventListener('ended', () => {
        this.isSpeaking = false;
        this.processSpeechQueue();
      }, { once: true });
    };

    tryIdx(0);
  }

  // 实际播放鼓励语音（同样稳健）
  private speakEncouragementNow(text: string) {
    window.speechSynthesis.cancel();

    const createUtterance = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      let chineseVoice = voices.find(v =>
        (v.lang === 'zh-CN' || v.lang.startsWith('zh')) &&
        (v.name.includes('小') || v.name.includes('Child') || v.name.includes('Kid'))
      );
      if (!chineseVoice) {
        chineseVoice = voices.find(v =>
          (v.lang === 'zh-CN' || v.lang.startsWith('zh')) &&
          (v.name.includes('Female') || v.name.includes('女'))
        );
      }
      if (!chineseVoice) {
        chineseVoice = voices.find(v => v.lang === 'zh-CN' || v.lang.startsWith('zh'));
      }
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;  // 温柔
      utterance.pitch = 1.4; // 童声
      utterance.volume = this.volume;

      utterance.onerror = (event) => {
        console.error('❌ Encouragement speech error:', event.error);
        this.isSpeaking = false;
        setTimeout(() => this.processSpeechQueue(), 100);
      };
      utterance.onend = () => {
        console.log('✅ 鼓励播放完成');
        this.isSpeaking = false;
        setTimeout(() => this.processSpeechQueue(), 100);
      };

      const delay = /Xiaomi|Mi|Redmi|MIUI/i.test(navigator.userAgent) ? 150 : 50;
      setTimeout(() => {
        try {
          console.log('💪 播放鼓励:', text);
          window.speechSynthesis.speak(utterance);
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (e) {
          console.error('❌ Failed to speak encouragement:', e);
          this.isSpeaking = false;
          this.processSpeechQueue();
        }
      }, delay);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('⏳ 语音列表未加载，等待中（鼓励）...');
      const timeout = setTimeout(() => {
        console.warn('⚠️ 语音加载超时（鼓励），使用默认语音');
        createUtterance();
      }, 2000);
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        clearTimeout(timeout);
        console.log('✅ 语音列表已加载（鼓励）');
        createUtterance();
      }, { once: true });
      window.speechSynthesis.getVoices();
    } else {
      createUtterance();
    }
  }

  // 播放音效（简单的提示音）
  public playSound(type: 'correct' | 'wrong' | 'button') {
    // 先解锁音频
    this.unlockAudio();
    
    // 使用Web Audio API生成简单的提示音
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    switch (type) {
      case 'correct':
        // 答对：愉快的上升音调
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(783.99, this.audioContext.currentTime + 0.1); // G5
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
        break;

      case 'wrong':
        // 答错：温和的低音
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
        break;

      case 'button':
        // 按钮：轻快的点击声
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
        break;
    }
  }

  // 停止所有音频
  public stopAll() {
    window.speechSynthesis.cancel();
    this.sounds.forEach(sound => sound.stop());
    // 清空语音队列
    this.speechQueue = [];
    this.isSpeaking = false;
  }

  // 暂停背景音乐
  public pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  // 恢复背景音乐
  public resumeBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.play();
    }
  }
}

// 导出单例实例
export const audioManager = AudioManager.getInstance();

