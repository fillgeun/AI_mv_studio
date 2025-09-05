
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Icon from './Icon';
import { runGemini } from '../services/geminiService';

interface MusicPromptGeneratorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedPrompt: string;
  setGeneratedPrompt: (prompt: string) => void;
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

const MusicPromptGenerator: React.FC<MusicPromptGeneratorProps> = ({ prompt, setPrompt, generatedPrompt, setGeneratedPrompt }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const outputTextAreaRef = useRef<HTMLTextAreaElement>(null);
    
    useAutosizeTextArea(outputTextAreaRef, generatedPrompt);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError('');
        setGeneratedPrompt('');

        try {
            const fullPrompt = `You are an expert prompt engineer for AI music generation models like Suno. Your task is to help the user create a detailed and effective prompt. Based on the user's request, generate a prompt that includes elements like genre, mood, instruments, vocals, BPM, and other relevant details. Present the final prompt in a clear, copy-paste-friendly format inside a code block.\n\nUser's Idea: "${prompt}"`;
            const result = await runGemini(fullPrompt);
            setGeneratedPrompt(result.replace(/```/g, '')); // Remove markdown code block fences
        } catch (e) {
            setError('프롬프트 생성에 실패했습니다. API 키를 확인하고 다시 시도해 주세요.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, setGeneratedPrompt]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 text-gray-200 p-6">
            <div className="flex items-center mb-6 flex-shrink-0">
                <Icon name="music" className="w-10 h-10 text-blue-400 mr-4" />
                <div>
                    <h2 className="text-2xl font-bold text-white">AI 음악 프롬프트 어시스턴트</h2>
                    <p className="text-gray-400">음악의 컨셉을 입력하면, AI가 전문적인 프롬프트로 만들어 드립니다.</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto bg-black/30 rounded-lg p-6 mb-6 shadow-inner ring-1 ring-white/5 min-h-0">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <Icon name="gemini" className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                            <p className="text-lg">프롬프트를 생성 중입니다...</p>
                            <p className="text-sm text-gray-500">잠시만 기다려 주세요.</p>
                        </div>
                    </div>
                )}
                {error && <p className="text-red-400 text-center p-4">{error}</p>}
                {!isLoading && !generatedPrompt && !error && (
                     <div className="flex justify-center items-center h-full">
                        <div className="text-center text-gray-500 px-4">
                            <Icon name="lyrics" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-gray-400">어떤 음악을 만들고 싶으신가요?</h3>
                            <p className="text-sm">아래 입력창에 아이디어를 입력하고 '전송' 버튼을 눌러보세요.</p>
                        </div>
                    </div>
                )}
                {generatedPrompt && (
                    <textarea
                        ref={outputTextAreaRef}
                        value={generatedPrompt}
                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                        className="w-full h-auto bg-transparent text-gray-200 text-base leading-relaxed font-mono resize-none border-none focus:ring-0 p-0"
                        aria-label="생성된 프롬프트 (편집 가능)"
                    />
                )}
            </div>

            <div className="flex-shrink-0">
                 <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="예: '비 오는 날 카페에서 듣기 좋은 Lo-fi 힙합, 잔잔한 피아노와 빗소리 포함'"
                        rows={2}
                        className="w-full bg-gray-700 text-gray-200 text-base rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition p-4 pr-20 resize-none"
                        disabled={isLoading}
                        aria-label="음악 컨셉 입력"
                    />
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="프롬프트 생성"
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

export default MusicPromptGenerator;