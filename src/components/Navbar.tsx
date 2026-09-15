import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  BellRing,
  Clock
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activeAlarmsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleTheme,
  activeAlarmsCount
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    soundManager.setMuted(nextMute);
    setIsMuted(nextMute);
  };

  const handleTestChime = () => {
    setIsTestingAudio(true);
    soundManager.playChime();
    setTimeout(() => setIsTestingAudio(false), 800);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-white/90 dark:bg-zinc-950/90 border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
              Task Priority & Alarm
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Focus on what matters most
            </p>
          </div>
        </div>

        {/* Right tools: Clock, Audio Test, Sound toggle, Dark Mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live clock badge */}
          <div 
            id="nav-clock"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-xs font-mono border border-zinc-200/80 dark:border-zinc-800"
            title="Current Local Time"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Active Alarms indicator */}
          {activeAlarmsCount > 0 && (
            <div 
              id="active-alarms-badge"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/30 animate-pulse"
              title={`${activeAlarmsCount} scheduled alarm${activeAlarmsCount > 1 ? 's' : ''}`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{activeAlarmsCount} Alarm{activeAlarmsCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Test Sound Button */}
          <button
            id="btn-test-sound"
            onClick={handleTestChime}
            type="button"
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isTestingAudio 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 scale-95' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
            }`}
            title="Preview alarm chime"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Sound</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={handleToggleMute}
            type="button"
            aria-label={isMuted ? 'Unmute alarm sound' : 'Mute alarm sound'}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted 
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title={isMuted ? 'Alarms muted (Click to unmute)' : 'Alarms active (Click to mute)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
