import React, { useState, useCallback, useRef, useEffect } from 'react';
import Icon from './Icon';
import { runGemini } from '../services/geminiService';

interface LyricsGeneratorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedLyrics: string;
  setGeneratedLyrics: (lyrics: string) => void;
}

// Textarea의 높이를 내용에 맞게 자동으로 조절하는 커스텀 훅
const useAutosizeTextArea = (
  textAreaRef: React.RefObject<HTMLTextAreaElement>,
  value: string
) => {
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
};


const LyricsGenerator: React.FC<LyricsGeneratorProps> = ({ prompt, setPrompt, generatedLyrics, setGeneratedLyrics }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const outputTextAreaRef = useRef<HTMLTextAreaElement>(null);
    
    // 생성된 가사 텍스트 영역에 자동 높이 조절 훅 적용
    useAutosizeTextArea(outputTextAreaRef, generatedLyrics);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError('');
        setGeneratedLyrics('');

        try {
            const fullPrompt = `You are a world-class songwriter. Your task is to write compelling song lyrics based on the following theme or request. Be creative and follow any stylistic instructions given.\n\nTheme: "${prompt}"`;
            const result = await runGemini(fullPrompt);
            setGeneratedLyrics(result);
        } catch (e) {
            setError('가사 생성에 실패했습니다. API 키를 확인하고 다시 시도해 주세요.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, setGeneratedLyrics]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 text-gray-200 p-6">
            <div className="flex items-center mb-6 flex-shrink-0">
                <Icon name="lyrics" className="w-10 h-10 text-blue-400 mr-4" />
                <div>
                    <h2 className="text-2xl font-bold text-white">AI 가사 생성기</h2>
                    <p className="text-gray-400">가사의 주제, 분위기, 장르를 입력하고 멋진 가사를 만들어보세요.</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto bg-black/30 rounded-lg p-6 mb-6 shadow-inner ring-1 ring-white/5 min-h-0">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <Icon name="gemini" className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                            <p className="text-lg">가사를 생성 중입니다...</p>
                            <p className="text-sm text-gray-500">잠시만 기다려 주세요.</p>
                        </div>
                    </div>
                )}
                {error && <p className="text-red-400 text-center p-4">{error}</p>}
                {!isLoading && !generatedLyrics && !error && (
                     <div className="flex justify-center items-center h-full">
                        <div className="text-center text-gray-500 px-4">
                            <Icon name="music" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-gray-400">AI가 작곡할 가사를 기다리고 있어요</h3>
                            <p className="text-sm">아래 입력창에 주제를 입력하고 '전송' 버튼을 눌러보세요.</p>
                        </div>
                    </div>
                )}
                {generatedLyrics && (
                    <textarea
                        ref={outputTextAreaRef}
                        value={generatedLyrics}
                        onChange={(e) => setGeneratedLyrics(e.target.value)}
                        className="w-full h-auto bg-transparent text-gray-200 text-base leading-loose font-serif resize-none border-none focus:ring-0 p-0"
                        aria-label="생성된 가사 (편집 가능)"
                    />
                )}
            </div>

            <div className="flex-shrink-0">
                 <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="예: '별이 빛나는 밤바다를 보며 느끼는 그리움'에 대한 발라드 가사"
                        rows={2}
                        className="w-full bg-gray-700 text-gray-200 text-base rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition p-4 pr-20 resize-none"
                        disabled={isLoading}
                        aria-label="가사 주제 입력"
                    />
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="가사 생성"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" aria-label="로딩 중"></div>
                        ) : (
                            <Icon name="send" className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LyricsGenerator;