
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Icon from './Icon';

// --- 타입 정의 ---
interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  duration: number; // 초 단위
}

interface ClipEffects {
  volume: number; // 0 to 2 (0% to 200%)
  fadeIn: number; // duration in seconds
  fadeOut: number; // duration in seconds
}

interface Clip {
  id:string;
  mediaId: string;
  trackId: string;
  start: number; // 트랙에서의 시작 시간 (초)
  duration: number; // 클립의 길이 (초)
  mediaStart: number; // 원본 미디어에서 사용하는 시작 시간 (초)
  x: number; // 미리보기에서의 X 위치
  y: number; // 미리보기에서의 Y 위치
  scale: number; // 미리보기에서의 크기
  effects: ClipEffects;
}

interface Track {
  id: string;
  type: 'video' | 'audio';
  name: string;
  isMuted: boolean;
  isLocked: boolean;
}

type EditorState = {
  media: MediaItem[];
  tracks: Track[];
  clips: Clip[];
};

const PIXELS_PER_SECOND = 60;
const FRAME_RATE = 30;

// --- 유틸리티 함수 ---
const formatTime = (timeInSeconds: number) => {
  const totalFrames = Math.round(timeInSeconds * FRAME_RATE);
  const frames = totalFrames % FRAME_RATE;
  const totalSeconds = Math.floor(totalFrames / FRAME_RATE);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
};

const parseTime = (timeString: string) => {
  const parts = timeString.split(':');
  if (parts.length !== 3) return null;
  const [min, sec, fra] = parts.map(Number);
  if (isNaN(min) || isNaN(sec) || isNaN(fra)) return null;
  return min * 60 + sec + fra / FRAME_RATE;
};


// --- 커스텀 훅: 실행 취소/다시 실행 ---
const useHistoryState = <T,>(initialState: T): [T, (newState: T | ((prevState: T) => T), skipHistory?: boolean) => void, () => void, () => void, boolean, boolean] => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setState = (newStateOrFn: T | ((prevState: T) => T), skipHistory = false) => {
    const newState = typeof newStateOrFn === 'function'
      ? (newStateOrFn as (prevState: T) => T)(history[currentIndex])
      : newStateOrFn;

    if (skipHistory) {
      const newHistory = [...history];
      newHistory[currentIndex] = newState;
      setHistory(newHistory);
    } else {
      // Avoid adding duplicate state to history
      if (JSON.stringify(newState) === JSON.stringify(history[currentIndex])) {
        return;
      }
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newState);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
  };
  
  const state = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const undo = () => canUndo && setCurrentIndex(prev => prev - 1);
  const redo = () => canRedo && setCurrentIndex(prev => prev - 1);

  return [state, setState, undo, redo, canUndo, canRedo];
};


// --- 자식 컴포넌트들 ---
const MediaLibrary: React.FC<{
  media: MediaItem[];
  onImport: (files: FileList) => void;
}> = ({ media, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState('all');

  const filteredMedia = useMemo(() => {
    if (filter === 'all') return media;
    return media.filter(item => item.type === filter);
  }, [media, filter]);
  
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, item: MediaItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };
  
  return (
    <div className="bg-gray-800/50 p-4 flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <h3 className="text-lg font-bold">미디어 라이브러리</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-2"
        >
          <Icon name="upload" className="w-4 h-4" />
          <span>가져오기</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => e.target.files && onImport(e.target.files)}
          accept="video/*,audio/*,image/*"
        />
      </div>
       <div className="mb-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full bg-gray-700 text-sm rounded-md px-2 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter media type"
        >
          <option value="all">모두</option>
          <option value="video">비디오</option>
          <option value="audio">음성</option>
          <option value="image">이미지</option>
        </select>
      </div>
      <ul className="flex-grow overflow-y-auto space-y-2 pr-2">
        {filteredMedia.map(item => (
          <li
            key={item.id}
            className="bg-gray-700/60 p-2 rounded-md flex items-center space-x-3 cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          >
            <div className="w-10 h-10 bg-gray-600 rounded flex-shrink-0 flex items-center justify-center">
              <span className="text-xl">
                {item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '🖼️'}
              </span>
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-sm font-semibold truncate">{item.name}</p>
              <p className="text-xs text-gray-400">{formatTime(item.duration)}</p>
            </div>
          </li>
        ))}
        {media.length === 0 && (
          <div className="text-center text-gray-500 pt-10">
            <p>라이브러리가 비었습니다.</p>
            <p className="text-xs">'가져오기'를 눌러 파일을 추가하세요.</p>
          </div>
        )}
      </ul>
    </div>
  );
};

const PropertiesPanel: React.FC<{
    selectedClip: Clip | null;
    mediaItem: MediaItem | null;
    onUpdate: (id: string, updates: Partial<Clip>, skipHistory: boolean) => void;
    onDelete: (id: string) => void;
}> = ({ selectedClip, mediaItem, onUpdate, onDelete }) => {
    type EditFields = {
      name: string; start: string; duration: string;
      x: string; y: string; scale: string;
      volume: string; fadeIn: string; fadeOut: string;
    };

    const [editFields, setEditFields] = useState<EditFields | null>(null);
    const [timeErrors, setTimeErrors] = useState({ start: false, duration: false, fadeIn: false, fadeOut: false });

    useEffect(() => {
        if (selectedClip && mediaItem) {
            setEditFields({
                name: mediaItem.name,
                start: formatTime(selectedClip.start),
                duration: formatTime(selectedClip.duration),
                x: String(selectedClip.x),
                y: String(selectedClip.y),
                scale: String(selectedClip.scale),
                volume: String(selectedClip.effects.volume * 100),
                fadeIn: String(selectedClip.effects.fadeIn),
                fadeOut: String(selectedClip.effects.fadeOut),
            });
            setTimeErrors({ start: false, duration: false, fadeIn: false, fadeOut: false });
        } else {
            setEditFields(null);
        }
    }, [selectedClip, mediaItem]);

    const handleInputChange = (field: keyof EditFields, value: string) => {
        if (!editFields) return;
        setEditFields({ ...editFields, [field]: value });
    };

    const handleTimeBlur = (field: 'start' | 'duration') => {
        if (!editFields || !selectedClip) return;
        const parsedTime = parseTime(editFields[field]);
        if (parsedTime === null) {
            setTimeErrors(prev => ({ ...prev, [field]: true }));
        } else {
            setTimeErrors(prev => ({ ...prev, [field]: false }));
            onUpdate(selectedClip.id, { [field]: parsedTime }, false);
        }
    };
    
    const handleTransformBlur = (field: 'x' | 'y' | 'scale') => {
        if (!editFields || !selectedClip) return;
        const value = parseFloat(editFields[field]);
        if (!isNaN(value)) {
            onUpdate(selectedClip.id, { [field]: value }, false);
        }
    };
    
    const handleEffectBlur = (field: 'fadeIn' | 'fadeOut') => {
        if (!editFields || !selectedClip) return;
        const value = parseFloat(editFields[field]);
        if (!isNaN(value) && value >= 0) {
            // Ensure fades don't overlap or exceed clip duration
            const validatedValue = Math.min(value, selectedClip.duration / 2);
            setTimeErrors(prev => ({...prev, [field]: false }));
            onUpdate(selectedClip.id, { effects: { ...selectedClip.effects, [field]: validatedValue } }, false);
        } else {
            setTimeErrors(prev => ({...prev, [field]: true }));
        }
    };

    const handleVolumeChange = (value: string) => {
        if (!editFields || !selectedClip) return;
        const volumeValue = parseFloat(value);
        if (!isNaN(volumeValue)) {
            handleInputChange('volume', value);
            onUpdate(selectedClip.id, { effects: { ...selectedClip.effects, volume: volumeValue / 100 } }, true);
        }
    };

    const handleVolumeFinalize = () => {
        if (!editFields || !selectedClip) return;
        onUpdate(selectedClip.id, { effects: { ...selectedClip.effects } }, false);
    };


    if (!selectedClip || !mediaItem || !editFields) {
        return (
            <div className="bg-gray-800/50 p-4 h-full text-center text-gray-500 flex items-center justify-center">
                <p>속성을 보려면 클립을 선택하세요.</p>
            </div>
        );
    }
    
    const endTime = formatTime(selectedClip.start + selectedClip.duration);

    return (
        <div className="bg-gray-800/50 p-4 h-full overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">속성</h3>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm text-gray-400 block mb-1">클립 이름</label>
                    <input
                      type="text"
                      value={editFields.name}
                      readOnly // 이름은 미디어 아이템에 귀속되므로 편집 불가
                      className="w-full bg-gray-700/50 p-2 rounded-md text-sm border border-transparent focus:outline-none cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-1">시작</label>
                    <input
                        type="text"
                        value={editFields.start}
                        onChange={(e) => handleInputChange('start', e.target.value)}
                        onBlur={() => handleTimeBlur('start')}
                        className={`w-full bg-gray-700 p-2 rounded-md text-sm border ${timeErrors.start ? 'border-red-500' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                </div>
                 <div>
                    <label className="text-sm text-gray-400 block mb-1">종료</label>
                    <input type="text" value={endTime} readOnly className="w-full bg-gray-700/50 p-2 rounded-md text-sm border border-transparent focus:outline-none cursor-not-allowed" />
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-1">길이</label>
                     <input
                        type="text"
                        value={editFields.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        onBlur={() => handleTimeBlur('duration')}
                        className={`w-full bg-gray-700 p-2 rounded-md text-sm border ${timeErrors.duration ? 'border-red-500' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                </div>
                
                {mediaItem.type !== 'audio' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">X 위치</label>
                            <input type="number" value={editFields.x} onChange={(e) => handleInputChange('x', e.target.value)} onBlur={() => handleTransformBlur('x')} className="w-full bg-gray-700 p-2 rounded-md text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Y 위치</label>
                            <input type="number" value={editFields.y} onChange={(e) => handleInputChange('y', e.target.value)} onBlur={() => handleTransformBlur('y')} className="w-full bg-gray-700 p-2 rounded-md text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">크기 (%)</label>
                        <input type="number" value={Math.round(parseFloat(editFields.scale) * 100)} onChange={(e) => handleInputChange('scale', String(parseInt(e.target.value, 10) / 100))} onBlur={() => handleTransformBlur('scale')} className="w-full bg-gray-700 p-2 rounded-md text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}

                {mediaItem.type === 'audio' && (
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <h4 className="text-md font-semibold mb-3">오디오 효과</h4>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">볼륨 ({Math.round(parseFloat(editFields.volume))}%)</label>
                            <input type="range" min="0" max="200" value={editFields.volume} 
                                onChange={(e) => handleVolumeChange(e.target.value)}
                                onMouseUp={handleVolumeFinalize}
                                onTouchEnd={handleVolumeFinalize}
                                className="w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                             <div>
                                <label className="text-sm text-gray-400 block mb-1">페이드 인 (초)</label>
                                <input type="number" step="0.1" value={editFields.fadeIn}
                                    onChange={(e) => handleInputChange('fadeIn', e.target.value)}
                                    onBlur={() => handleEffectBlur('fadeIn')}
                                    className={`w-full bg-gray-700 p-2 rounded-md text-sm border ${timeErrors.fadeIn ? 'border-red-500' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                             </div>
                              <div>
                                <label className="text-sm text-gray-400 block mb-1">페이드 아웃 (초)</label>
                                <input type="number" step="0.1" value={editFields.fadeOut}
                                    onChange={(e) => handleInputChange('fadeOut', e.target.value)}
                                    onBlur={() => handleEffectBlur('fadeOut')}
                                    className={`w-full bg-gray-700 p-2 rounded-md text-sm border ${timeErrors.fadeOut ? 'border-red-500' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                             </div>
                        </div>
                    </div>
                )}


                <button onClick={() => onDelete(selectedClip.id)} className="w-full mt-6 bg-red-600/80 hover:bg-red-600 text-white py-2 rounded-md flex items-center justify-center space-x-2">
                    <Icon name="trash" className="w-4 h-4" />
                    <span>클립 삭제</span>
                </button>
            </div>
        </div>
    );
};

const VideoPreview: React.FC<{
    state: EditorState;
    playheadTime: number;
    isPlaying: boolean;
    selectedClipId: string | null;
    onSelectClip: (clipId: string | null) => void;
    onUpdateClip: (id: string, updates: Partial<Clip>, skipHistory: boolean) => void;
}> = ({ state, playheadTime, isPlaying, selectedClipId, onSelectClip, onUpdateClip }) => {
    const { clips, tracks, media } = state;
    const previewRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
    const [dragState, setDragState] = useState<{ clipId: string; mode: 'move' | 'scale'; startX: number; startY: number; initialClip: Clip } | null>(null);

    const videoTracks = useMemo(() => tracks.filter(t => t.type === 'video').reverse(), [tracks]); // Reverse for correct z-index
    
    const activeClips = useMemo(() => {
        return videoTracks.flatMap((track, trackIndex) => {
            if (track.isMuted) return [];
            return clips
                .filter(clip => clip.trackId === track.id && playheadTime >= clip.start && playheadTime < clip.start + clip.duration)
                .map(clip => ({
                    ...clip,
                    media: media.find(m => m.id === clip.mediaId),
                    zIndex: trackIndex + 1, // Higher index = higher z-index
                }))
                .filter(item => !!item.media);
        });
    }, [clips, videoTracks, media, playheadTime]);

    // Video playback synchronization
    useEffect(() => {
        activeClips.forEach(clip => {
            if (clip.media?.type === 'video') {
                const videoElement = videoRefs.current[clip.id];
                if (videoElement) {
                    const mediaTime = clip.mediaStart + (playheadTime - clip.start);
                    if (Math.abs(videoElement.currentTime - mediaTime) > 0.1) {
                        videoElement.currentTime = mediaTime;
                    }
                    if (isPlaying) {
                        videoElement.play().catch(() => {});
                    } else {
                        videoElement.pause();
                    }
                }
            }
        });
    }, [activeClips, isPlaying, playheadTime]);
    
    // --- Interactive transform handlers ---
    const handleMouseDown = (e: React.MouseEvent, clip: Clip, mode: 'move' | 'scale') => {
        e.preventDefault();
        e.stopPropagation();
        if (previewRef.current) {
            setDragState({
                clipId: clip.id,
                mode,
                startX: e.clientX,
                startY: e.clientY,
                initialClip: { ...clip },
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragState || !previewRef.current) return;
            
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            
            if (dragState.mode === 'move') {
                 onUpdateClip(dragState.clipId, {
                    x: dragState.initialClip.x + dx,
                    y: dragState.initialClip.y + dy
                }, true);
            } else { // 'scale'
                const initialWidth = 500 * dragState.initialClip.scale; // Assuming preview width
                const newWidth = initialWidth + dx;
                onUpdateClip(dragState.clipId, {
                    scale: Math.max(0.1, newWidth / 500),
                }, true);
            }
        };

        const handleMouseUp = () => {
            if (dragState) {
                // Finalize the update for history
                const finalClipState = clips.find(c => c.id === dragState.clipId);
                if (finalClipState) {
                    onUpdateClip(dragState.clipId, { ...finalClipState }, false);
                }
                setDragState(null);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, onUpdateClip, clips]);

    return (
        <div 
          ref={previewRef} 
          className="w-full h-full bg-black relative overflow-hidden" 
          onClick={() => onSelectClip(null)}
          role="application"
        >
            {activeClips.map(clip => {
                const isSelected = clip.id === selectedClipId;
                const mediaItem = clip.media;
                if (!mediaItem) return null;
                
                return (
                    <div
                        key={clip.id}
                        className="absolute"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: `translate(calc(-50% + ${clip.x}px), calc(-50% + ${clip.y}px)) scale(${clip.scale})`,
                            zIndex: clip.zIndex,
                            width: '100%',
                            height: '100%',
                        }}
                        onClick={(e) => { e.stopPropagation(); onSelectClip(clip.id); }}
                    >
                       <div className="w-full h-full relative" style={{ pointerEvents: isSelected ? 'auto' : 'none' }}>
                         {mediaItem.type === 'image' && (
                              <img src={mediaItem.url} className="w-full h-full object-contain" alt={mediaItem.name} />
                          )}
                          {mediaItem.type === 'video' && (
                              <video
                                  ref={el => { if (el) videoRefs.current[clip.id] = el; }}
                                  src={mediaItem.url}
                                  className="w-full h-full object-contain"
                                  muted
                              />
                          )}
                        
                          {/* Transform Controls */}
                          {isSelected && (
                              <>
                                <div 
                                    className="absolute inset-0 border-2 border-blue-500 cursor-move"
                                    onMouseDown={(e) => handleMouseDown(e, clip, 'move')}
                                />
                                <div 
                                    className="absolute -right-1 -bottom-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize"
                                    onMouseDown={(e) => handleMouseDown(e, clip, 'scale')}
                                />
                              </>
                          )}
                       </div>
                    </div>
                );
            })}
        </div>
    );
};


// --- 메인 컴포넌트 ---
const VideoEditor: React.FC = () => {
  const [state, setState, undo, redo, canUndo, canRedo] = useHistoryState<EditorState>({
    media: [],
    tracks: [
      { id: 'v1', type: 'video', name: '🎬 V1', isMuted: false, isLocked: false },
      { id: 'a1', type: 'audio', name: '🔊 A1', isMuted: false, isLocked: false },
    ],
    clips: [],
  });
  
  const [projectDuration, setProjectDuration] = useState(300); // 5 minutes default
  const [durationInput, setDurationInput] = useState(formatTime(projectDuration));

  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const playbackFrameRef = useRef<number | null>(null);

  const [draggingTrackId, setDraggingTrackId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ index: number } | null>(null);
  const [snapLine, setSnapLine] = useState<number | null>(null);
  
  const [draggingClipInfo, setDraggingClipInfo] = useState<{
    clipId: string;
    mode: 'move' | 'resize-left' | 'resize-right';
    initialMouseX: number;
    initialClip: Clip;
  } | null>(null);
  
  const [draggingMediaOverTrack, setDraggingMediaOverTrack] = useState<string | null>(null);

  const timelineScrollContainerRef = useRef<HTMLDivElement>(null);
  const rulerContentRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    setDurationInput(formatTime(projectDuration));
  }, [projectDuration]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDurationInput(e.target.value);
  };

  const handleDurationBlur = () => {
      const newDuration = parseTime(durationInput);
      if (newDuration !== null && newDuration > 0) {
          setProjectDuration(newDuration);
      } else {
          setDurationInput(formatTime(projectDuration));
      }
  };

  const handleDurationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDurationBlur();
      e.currentTarget.blur();
    }
  };


  // --- 미디어 임포트 핸들러 ---
  const handleImportMedia = async (files: FileList) => {
    const newMediaItems: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);
      let duration = 0;
      let type: 'video' | 'audio' | 'image' = 'image';

      if (file.type.startsWith('video/')) type = 'video';
      if (file.type.startsWith('audio/')) type = 'audio';

      if (type === 'video' || type === 'audio') {
        try {
          duration = await new Promise<number>((resolve, reject) => {
            const mediaElement = document.createElement(type);
            mediaElement.src = url;
            mediaElement.onloadedmetadata = () => resolve(mediaElement.duration);
            mediaElement.onerror = reject;
          });
        } catch (error) {
          console.error("Error getting media duration:", error);
        }
      }
      
      newMediaItems.push({
        id: `media_${Date.now()}_${Math.random()}`,
        name: file.name,
        type,
        url,
        duration: type === 'image' ? 5 : duration, // 이미지는 기본 5초
      });
    }

    setState(prev => ({ ...prev, media: [...prev.media, ...newMediaItems] }));
  };

  // --- 재생 관련 로직 ---
  const handlePlayback = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // If playhead is at or after the end, reset to 0 before playing
      if (playheadTime >= projectDuration - (1 / FRAME_RATE)) {
        setPlayheadTime(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, playheadTime, projectDuration]);

  useEffect(() => {
    if (!isPlaying) {
      if (playbackFrameRef.current) {
        cancelAnimationFrame(playbackFrameRef.current);
        playbackFrameRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      setPlayheadTime(prev => {
        const nextTime = prev + deltaTime;
        if (nextTime >= projectDuration) {
          setIsPlaying(false); // Stop playing
          return projectDuration;
        }
        return nextTime;
      });
      playbackFrameRef.current = requestAnimationFrame(animate);
    };

    playbackFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (playbackFrameRef.current) {
        cancelAnimationFrame(playbackFrameRef.current);
        playbackFrameRef.current = null;
      }
    };
  }, [isPlaying, projectDuration]);

  // --- 타임라인 스크러빙 로직 ---
  const getScrubTime = useCallback((clientX: number): number => {
    if (!rulerContentRef.current || !timelineScrollContainerRef.current) return 0;

    const rulerRect = rulerContentRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollContainerRef.current.scrollLeft;
    const mouseXOnRuler = clientX - rulerRect.left;
    const absoluteX = mouseXOnRuler + scrollLeft;
    
    const newTime = absoluteX / (PIXELS_PER_SECOND * zoom);
    return Math.max(0, Math.min(newTime, projectDuration));
  }, [zoom, projectDuration]);

  const handleTimelineScrub = useCallback((e: MouseEvent) => {
    const newTime = getScrubTime(e.clientX);
    setPlayheadTime(newTime);
  }, [getScrubTime]);

  const handleTimelineScrubStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsScrubbing(true);
    if (isPlaying) {
      setIsPlaying(false);
    }
    const newTime = getScrubTime(e.clientX);
    setPlayheadTime(newTime);
  }, [isPlaying, getScrubTime]);

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMouseUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', handleTimelineScrub);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';

    return () => {
      window.removeEventListener('mousemove', handleTimelineScrub);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isScrubbing, handleTimelineScrub]);

  // --- 키보드 단축키 핸들러 ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if (e.key === ' ') {
        e.preventDefault();
        handlePlayback();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
        e.preventDefault();
        handleDeleteClip(selectedClipId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedClipId, handlePlayback]);

  // --- 클립 조작 핸들러 ---
  const handleUpdateClip = useCallback((id: string, updates: Partial<Clip>, skipHistory = false) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(c => c.id === id ? { ...c, ...updates } : c)
    }), skipHistory);
  }, [setState]);

  const handleDeleteClip = (id: string) => {
    setState(prev => ({
        ...prev,
        clips: prev.clips.filter(c => c.id !== id),
    }));
    setSelectedClipId(null);
  };

  const handleSplitClip = () => {
    if (!selectedClipId) return;
    const clip = state.clips.find(c => c.id === selectedClipId);
    if (!clip || playheadTime <= clip.start || playheadTime >= clip.start + clip.duration) return;

    const splitPoint = playheadTime - clip.start;
    const newClip: Clip = {
        ...clip,
        id: `clip_${Date.now()}_${Math.random()}`,
        start: playheadTime,
        duration: clip.duration - splitPoint,
        mediaStart: clip.mediaStart + splitPoint,
        effects: { ...clip.effects, fadeIn: 0 } // Reset fade-in on the new part
    };
    const updatedClips = state.clips.map(c => 
        c.id === selectedClipId ? { ...c, duration: splitPoint, effects: { ...c.effects, fadeOut: 0 } } : c // Reset fade-out on the original part
    );
    
    setState(prev => ({ ...prev, clips: [...updatedClips, newClip] }));
  };
  
  // --- Timeline Clip Drag & Resize Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingClipInfo) return;

        const { clipId, mode, initialMouseX, initialClip } = draggingClipInfo;
        const dx = e.clientX - initialMouseX;
        const timeDelta = dx / (PIXELS_PER_SECOND * zoom);

        let newClipProps: Partial<Clip> = {};

        if (mode === 'move') {
            const newStart = Math.max(0, initialClip.start + timeDelta);
            newClipProps.start = Math.min(newStart, projectDuration - initialClip.duration);
        } else if (mode === 'resize-right') {
            let newDuration = initialClip.duration + timeDelta;
            if (newDuration >= 1 / FRAME_RATE) {
                newDuration = Math.min(newDuration, projectDuration - initialClip.start);
                const mediaItem = state.media.find(m => m.id === initialClip.mediaId);
                if (!mediaItem || initialClip.mediaStart + newDuration <= mediaItem.duration) {
                    newClipProps.duration = newDuration;
                }
            }
        } else if (mode === 'resize-left') {
            const timeChange = timeDelta;
            const newStart = initialClip.start + timeChange;
            const newDuration = initialClip.duration - timeChange;
            const newMediaStart = initialClip.mediaStart + timeChange;
            if (newStart >= 0 && newDuration >= 1 / FRAME_RATE && newMediaStart >= 0) {
                const mediaItem = state.media.find(m => m.id === initialClip.mediaId);
                if (!mediaItem || newMediaStart + newDuration <= mediaItem.duration) {
                    newClipProps = { start: newStart, duration: newDuration, mediaStart: newMediaStart };
                }
            }
        }

        // --- Snapping Logic ---
        let finalProps = { ...newClipProps };
        const snapThreshold = 5 / (PIXELS_PER_SECOND * zoom);
        setSnapLine(null);

        const otherClips = state.clips.filter(c => c.id !== clipId);
        const potentialSnapPoints = [playheadTime, ...otherClips.flatMap(c => [c.start, c.start + c.duration])];
        
        const currentStart = 'start' in finalProps ? finalProps.start! : initialClip.start;
        const currentDuration = 'duration' in finalProps ? finalProps.duration! : initialClip.duration;
        const currentEnd = currentStart + currentDuration;

        for (const point of potentialSnapPoints) {
            let snapped = false;
            if (mode === 'move') {
                if (Math.abs(currentStart - point) < snapThreshold) { finalProps.start = point; snapped = true; } 
                else if (Math.abs(currentEnd - point) < snapThreshold) { finalProps.start = point - currentDuration; snapped = true; }
            } else if (mode === 'resize-right' && Math.abs(currentEnd - point) < snapThreshold) {
                finalProps.duration = point - currentStart;
                snapped = true;
            } else if (mode === 'resize-left' && Math.abs(currentStart - point) < snapThreshold) {
                const oldEnd = initialClip.start + initialClip.duration;
                finalProps = { start: point, duration: oldEnd - point, mediaStart: initialClip.mediaStart + (initialClip.start - point) };
                snapped = true;
            }

            if (snapped) {
                setSnapLine(point * PIXELS_PER_SECOND * zoom);
                break;
            }
        }

        if (Object.keys(finalProps).length > 0) {
            handleUpdateClip(clipId, finalProps, true);
        }
    };

    const handleMouseUp = () => {
        if (draggingClipInfo) {
            const { clipId } = draggingClipInfo;
            const finalClip = state.clips.find(c => c.id === clipId);
            if (finalClip) {
                handleUpdateClip(clipId, { ...finalClip }, false);
            }
            setDraggingClipInfo(null);
            setSnapLine(null);
        }
    };

    if (draggingClipInfo) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = draggingClipInfo.mode === 'move' ? 'grabbing' : 'ew-resize';
    } else {
        document.body.style.cursor = 'default';
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
    };
}, [draggingClipInfo, state.clips, state.media, playheadTime, zoom, projectDuration, handleUpdateClip]);


  // --- 트랙 조작 핸들러 ---
  const handleAddTrack = (type: 'video' | 'audio') => {
    const count = state.tracks.filter(t => t.type === type).length + 1;
    const newTrack: Track = {
      id: `${type[0]}${Date.now()}`,
      type,
      name: `${type === 'video' ? '🎬 V' : '🔊 A'}${count}`,
      isMuted: false,
      isLocked: false,
    };
    setState(prev => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
  };

  const handleDeleteTrack = (id: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== id),
      clips: prev.clips.filter(c => c.trackId !== id),
    }));
  };
  
  const handleToggleTrackProp = (id: string, prop: 'isMuted' | 'isLocked') => {
     setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === id ? { ...t, [prop]: !t[prop] } : t)
    }));
  };
  
  // --- 드래그 앤 드롭 핸들러 ---
  const handleTrackDragStart = (e: React.DragEvent<HTMLDivElement>, trackId: string) => {
    setDraggingTrackId(trackId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleTrackDragOver = (e: React.DragEvent<HTMLDivElement>, targetTrackIndex: number) => {
    e.preventDefault();
    if (!draggingTrackId) return;
    
    const targetEl = e.currentTarget;
    const rect = targetEl.getBoundingClientRect();
    const isOverTopHalf = e.clientY < rect.top + rect.height / 2;
    
    setDropIndicator({
        index: isOverTopHalf ? targetTrackIndex : targetTrackIndex + 1,
    });
  };
  
  const handleTrackDrop = () => {
    if (!draggingTrackId || dropIndicator === null) return;

    const tracks = [...state.tracks];
    const draggedIndex = tracks.findIndex(t => t.id === draggingTrackId);
    if (draggedIndex === -1) return;
    
    const [draggedItem] = tracks.splice(draggedIndex, 1);
    
    let newIndex = dropIndicator.index;
    if (draggedIndex < newIndex) {
        newIndex--;
    }

    tracks.splice(newIndex, 0, draggedItem);
    
    setState(prev => ({...prev, tracks }));

    setDraggingTrackId(null);
    setDropIndicator(null);
  };
  
  const handleTimelineDrop = (e: React.DragEvent<HTMLDivElement>, track: Track, trackContentRef: React.RefObject<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingMediaOverTrack(null);
    if (!trackContentRef.current) return;
    
    try {
        const mediaItemJSON = e.dataTransfer.getData('application/json');
        if (!mediaItemJSON) return;

        const mediaItem: MediaItem = JSON.parse(mediaItemJSON);
        if (
            (track.type === 'video' && (mediaItem.type === 'video' || mediaItem.type === 'image')) ||
            (track.type === 'audio' && mediaItem.type === 'audio')
        ) {
            const rect = trackContentRef.current.getBoundingClientRect();
            const dropTime = (e.clientX - rect.left) / (PIXELS_PER_SECOND * zoom);
            
            const newClipStart = Math.max(0, dropTime);
            const finalClipStart = Math.min(newClipStart, projectDuration - mediaItem.duration);
            
            if (finalClipStart < 0) return; // Clip is longer than project

            const newClip: Clip = {
                id: `clip_${Date.now()}_${Math.random()}`,
                mediaId: mediaItem.id,
                trackId: track.id,
                start: finalClipStart,
                duration: mediaItem.duration,
                mediaStart: 0,
                x: 0, y: 0, scale: 1,
                effects: { volume: 1, fadeIn: 0, fadeOut: 0 },
            };
            setState(prev => ({...prev, clips: [...prev.clips, newClip]}));
        }
    } catch(err) {
        console.error("Failed to handle drop:", err);
    }
  };

  const handleClipActionStart = (e: React.MouseEvent, clip: Clip, track: Track, mode: 'move' | 'resize-left' | 'resize-right') => {
    if (track.isLocked) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedClipId(clip.id);
    setDraggingClipInfo({
      clipId: clip.id,
      mode,
      initialMouseX: e.clientX,
      initialClip: { ...clip },
    });
  };

  const selectedClip = state.clips.find(c => c.id === selectedClipId) || null;
  const mediaForSelectedClip = selectedClip ? state.media.find(m => m.id === selectedClip.mediaId) : null;
  const timelineDuration = projectDuration;
  const videoTrackCount = state.tracks.filter(t => t.type === 'video').length;
  const audioTrackCount = state.tracks.filter(t => t.type === 'audio').length;

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white font-sans">
      <div className="flex-grow flex-shrink-0 grid grid-cols-12 gap-2 p-2 min-h-0">
        <div className="col-span-3">
          <MediaLibrary media={state.media} onImport={handleImportMedia} />
        </div>
        <div className="col-span-6">
           <VideoPreview 
              state={state} 
              playheadTime={playheadTime} 
              isPlaying={isPlaying}
              selectedClipId={selectedClipId}
              onSelectClip={setSelectedClipId}
              onUpdateClip={handleUpdateClip}
            />
        </div>
        <div className="col-span-3">
          <PropertiesPanel
            selectedClip={selectedClip}
            mediaItem={mediaForSelectedClip}
            onUpdate={handleUpdateClip}
            onDelete={handleDeleteClip}
          />
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col h-2/5 border-t-2 border-gray-700">
        <div className="flex-shrink-0 bg-gray-800/70 px-4 py-2 flex items-center space-x-4 border-b border-gray-700">
            <button onClick={() => setPlayheadTime(0)}><Icon name="backward" /></button>
            <button onClick={handlePlayback} className="bg-blue-600 p-2 rounded-full"><Icon name={isPlaying ? 'pause' : 'play'} /></button>
            <button onClick={() => { /* TODO: forward functionality */ }}><Icon name="forward" /></button>
            <div className="w-px h-6 bg-gray-600"></div>
            <button onClick={undo} disabled={!canUndo} className="disabled:opacity-50"><Icon name="undo"/></button>
            <button onClick={redo} disabled={!canRedo} className="disabled:opacity-50"><Icon name="redo"/></button>
            <div className="w-px h-6 bg-gray-600"></div>
            <button onClick={handleSplitClip} disabled={!selectedClipId} className="flex items-center space-x-2 px-2 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"><Icon name="cut" className="w-4 h-4"/><span>자르기</span></button>
            
            <div className="flex-grow"></div>

            <div className="flex items-center space-x-2">
                <span className="text-sm">프로젝트 길이</span>
                <input
                    type="text"
                    value={durationInput}
                    onChange={handleDurationChange}
                    onBlur={handleDurationBlur}
                    onKeyDown={handleDurationKeyDown}
                    className="w-24 bg-gray-700 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
            </div>

            <div className="flex items-center space-x-3">
                <span className="text-sm">타임라인 줌</span>
                <input type="range" min="0.5" max="5" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-32 my-auto" />
            </div>
        </div>
        
        <div className="flex-grow flex flex-col min-h-0">
          <div ref={timelineScrollContainerRef} className="flex-grow relative overflow-auto" onDragLeave={() => setSnapLine(null)}>
            <div className="relative min-w-full" style={{ width: `calc(${timelineDuration * PIXELS_PER_SECOND * zoom}px + 100vw)` }}>
              {/* Ruler Row */}
              <div className="flex h-6 sticky top-0 z-30">
                <div className="w-48 sticky left-0 bg-gray-800 border-r border-b border-gray-700 flex-shrink-0 z-10">
                  {/* Corner block */}
                </div>
                <div ref={rulerContentRef} className="flex-grow h-6 relative bg-gray-800 border-b border-gray-700 cursor-col-resize" onMouseDown={handleTimelineScrubStart}>
                  {Array.from({ length: Math.ceil(timelineDuration) }).map((_, i) => (
                      <div key={i} className="absolute top-0 h-full" style={{ left: i * PIXELS_PER_SECOND * zoom }}>
                          <div className="w-px h-full bg-gray-600"></div>
                          <span className="absolute -top-0.5 left-1 text-xs text-gray-400">{formatTime(i).slice(0, 5)}</span>
                      </div>
                  ))}
                </div>
              </div>
              
              <div 
                className="relative" 
                onDragLeave={() => setDropIndicator(null)}
                onDrop={handleTrackDrop}
              >
                {state.tracks.map((track, index) => {
                  const trackContentRef = React.createRef<HTMLDivElement>();
                  return (
                    <div
                        key={track.id}
                        className="flex h-16 relative"
                        onDragOver={(e) => handleTrackDragOver(e, index)}
                    >
                      <div
                          className={`w-48 sticky left-0 z-20 flex-shrink-0 h-16 p-2 flex items-center justify-between transition-opacity border-r border-gray-700 ${draggingTrackId === track.id ? 'opacity-50' : 'opacity-100'}`}
                          style={{ backgroundColor: track.type === 'video' ? '#2c3e50' : '#34495e' }}
                          draggable={!track.isLocked}
                          onDragStart={(e) => handleTrackDragStart(e, track.id)}
                      >
                          <span className="font-bold text-sm">{track.name}</span>
                          <div className="flex items-center space-x-1">
                              <button onClick={() => handleToggleTrackProp(track.id, 'isMuted')} className="p-1 rounded-full hover:bg-white/10"><Icon name={track.isMuted ? 'volume-off' : 'volume-high'} className="w-5 h-5"/></button>
                              <button onClick={() => handleToggleTrackProp(track.id, 'isLocked')} className="p-1 rounded-full hover:bg-white/10"><Icon name={track.isLocked ? 'lock-closed' : 'lock-open'} className="w-5 h-5"/></button>
                              {((track.type === 'video' && videoTrackCount > 1) || (track.type === 'audio' && audioTrackCount > 1)) && (
                                <button
                                    onClick={() => handleDeleteTrack(track.id)}
                                    className="p-1 rounded-full text-red-400 hover:bg-red-500/50 hover:text-red-300"
                                    title="트랙 삭제"
                                >
                                    <Icon name="trash" className="w-5 h-5" />
                                </button>
                              )}
                          </div>
                      </div>
                      <div
                          ref={trackContentRef}
                          className={`flex-grow h-16 relative border-b border-gray-700/50 ${draggingMediaOverTrack === track.id ? 'bg-blue-500/20' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); setDraggingMediaOverTrack(track.id); }}
                          onDragLeave={() => setDraggingMediaOverTrack(null)}
                          onDrop={(e) => handleTimelineDrop(e, track, trackContentRef)}
                          style={{ backgroundColor: track.type === 'video' ? 'rgba(44, 62, 80, 0.3)' : 'rgba(52, 73, 94, 0.3)' }}
                      >
                        {state.clips.filter(c => c.trackId === track.id).map(clip => (
                             <div 
                                key={clip.id}
                                className={`absolute top-1/2 -translate-y-1/2 h-12 rounded-md overflow-hidden flex items-center group ${selectedClipId === clip.id ? 'ring-4 ring-blue-500 z-10' : 'ring-1 ring-black/30'} cursor-grab active:cursor-grabbing`}
                                style={{
                                    left: clip.start * PIXELS_PER_SECOND * zoom,
                                    width: clip.duration * PIXELS_PER_SECOND * zoom,
                                    backgroundColor: state.media.find(m=>m.id === clip.mediaId)?.type === 'image' ? '#8e44ad' : '#2980b9'
                                }}
                                onMouseDown={(e) => handleClipActionStart(e, clip, track, 'move')}
                                onClick={(e) => { e.stopPropagation(); setSelectedClipId(clip.id); }}
                              >
                               <div className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-20" onMouseDown={(e) => handleClipActionStart(e, clip, track, 'resize-left')} />
                               <span className="text-xs font-semibold truncate text-white pointer-events-none px-3 w-full text-center">{state.media.find(m => m.id === clip.mediaId)?.name}</span>
                               <div className="absolute right-0 top-0 h-full w-2 cursor-ew-resize z-20" onMouseDown={(e) => handleClipActionStart(e, clip, track, 'resize-right')} />
                               
                               {/* Audio Effects Visuals */}
                               {track.type === 'audio' && (
                                 <>
                                  <div className="absolute left-0 w-full h-0.5 bg-yellow-300/80 pointer-events-none" style={{ top: `${(2 - clip.effects.volume) / 2 * 100}%`}}></div>
                                  {clip.effects.fadeIn > 0 && (
                                    <div className="absolute left-0 top-0 h-full bg-black/40 pointer-events-none" style={{ width: `${clip.effects.fadeIn * PIXELS_PER_SECOND * zoom}px`, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                                  )}
                                  {clip.effects.fadeOut > 0 && (
                                     <div className="absolute right-0 top-0 h-full bg-black/40 pointer-events-none" style={{ width: `${clip.effects.fadeOut * PIXELS_PER_SECOND * zoom}px`, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
                                  )}
                                 </>
                               )}
                             </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {dropIndicator && (
                    <div className="absolute left-0 bg-yellow-400 h-0.5 w-full z-40 pointer-events-none"
                         style={{ top: dropIndicator.index * 64 + 24 /* +24 for ruler height */ }} />
                )}
              </div>

              <div className="absolute top-0 left-48 w-0.5 h-full bg-red-500 pointer-events-none" style={{ transform: `translateX(${playheadTime * PIXELS_PER_SECOND * zoom}px)`, zIndex: 35 }}>
                <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-red-500 rounded-full cursor-col-resize pointer-events-auto" onMouseDown={handleTimelineScrubStart}></div>
              </div>
              
              {snapLine !== null && (
                 <div className="absolute top-0 w-px h-full bg-yellow-400 pointer-events-none" style={{ left: snapLine, zIndex: 15 }}></div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 p-2 bg-gray-800/50 flex space-x-2">
            <button onClick={() => handleAddTrack('video')} className="w-full text-sm py-1 bg-gray-700 hover:bg-gray-600 rounded-md">+ 비디오 트랙</button>
            <button onClick={() => handleAddTrack('audio')} className="w-full text-sm py-1 bg-gray-700 hover:bg-gray-600 rounded-md">+ 오디오 트랙</button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default VideoEditor;
