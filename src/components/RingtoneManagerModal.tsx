import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  Music, 
  Play, 
  Square, 
  Trash2, 
  Check, 
  Smartphone, 
  Laptop, 
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { CustomRingtone } from '../types';
import { soundManager } from '../utils/audio';

interface RingtoneManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customRingtones: CustomRingtone[];
  onAddRingtone: (ringtone: CustomRingtone) => void;
  onDeleteRingtone: (id: string) => void;
  selectedRingtoneId?: string;
  onSelectRingtone?: (id: string) => void;
}

export const RingtoneManagerModal: React.FC<RingtoneManagerModalProps> = ({
  isOpen,
  onClose,
  customRingtones,
  onAddRingtone,
  onDeleteRingtone,
  selectedRingtoneId,
  onSelectRingtone
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleStopPlaying = () => {
    soundManager.stopAlarm();
    setPlayingId(null);
  };

  const handlePlayPreview = (ringtone: CustomRingtone) => {
    if (playingId === ringtone.id) {
      handleStopPlaying();
    } else {
      setPlayingId(ringtone.id);
      soundManager.playCustomAudio(ringtone.dataUrl, false);
      // Auto-reset playing state after preview
      setTimeout(() => {
        setPlayingId((curr) => (curr === ringtone.id ? null : curr));
      }, (ringtone.duration || 10) * 1000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Limit size to ~5MB for smooth localStorage storage and mobile memory preservation
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Audio file size exceeds 5MB. Please choose a smaller ringtone or snippet.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (!dataUrl) {
        setErrorMessage('Failed to read audio file.');
        setIsProcessing(false);
        return;
      }

      // Check audio duration
      const tempAudio = new Audio(dataUrl);
      tempAudio.onloadedmetadata = () => {
        const duration = Math.round(tempAudio.duration) || 5;
        const newRingtone: CustomRingtone = {
          id: `ringtone-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name.replace(/\.[^/.]+$/, ''), // Clean extension
          dataUrl,
          duration,
          addedAt: new Date().toISOString()
        };

        onAddRingtone(newRingtone);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      tempAudio.onerror = () => {
        // Still add if format can be parsed by system
        const newRingtone: CustomRingtone = {
          id: `ringtone-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl,
          addedAt: new Date().toISOString()
        };
        onAddRingtone(newRingtone);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
    };

    reader.onerror = () => {
      setErrorMessage('Error reading audio file.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleModalClose = () => {
    handleStopPlaying();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Custom Ringtones
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Upload audio from your iPhone, Android, or local computer
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleModalClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Cross-device Compatibility Banner */}
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="leading-relaxed text-[11px]">
                <strong>Universal Mobile & Desktop Support:</strong> Works on <strong>iPhone (Files app & iCloud Drive)</strong>, <strong>Android</strong> (Internal Storage / Audio files), and <strong>Laptops/PCs</strong>. Supported formats: <strong>MP3, M4A, WAV, AAC, OGG</strong> (up to 5MB).
              </p>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {isProcessing ? 'Processing Audio...' : 'Choose Audio File from Your Device'}
                </span>
                <span className="text-[11px] text-zinc-400">
                  Select from iPhone Files/iCloud, Android, or PC (MP3, M4A, WAV, AAC - Max 5MB)
                </span>
              </div>
            </div>

            {/* Saved Custom Ringtones List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Your Saved Ringtones ({customRingtones.length})</span>
                {customRingtones.length > 0 && (
                  <span className="text-[10px] text-zinc-400 font-normal">
                    Stored securely in your browser
                  </span>
                )}
              </h4>

              {customRingtones.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80">
                  <FileAudio className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    No custom ringtones uploaded yet
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Select an audio file above to assign it to any task deadline.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {customRingtones.map((item) => {
                    const isSelected = selectedRingtoneId === item.id;
                    const isPlaying = playingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/30'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handlePlayPreview(item)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                              isPlaying
                                ? 'bg-indigo-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                            title={isPlaying ? 'Stop audio' : 'Preview audio'}
                          >
                            {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                              {item.duration ? <span>{item.duration}s</span> : <span>Audio file</span>}
                              <span>•</span>
                              <span>{new Date(item.addedAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-2">
                          {onSelectRingtone && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectRingtone(item.id);
                                handleModalClose();
                              }}
                              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{isSelected ? 'Selected' : 'Use'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (playingId === item.id) handleStopPlaying();
                              onDeleteRingtone(item.id);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete ringtone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
