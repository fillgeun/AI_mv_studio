import React, { useState, useCallback, useEffect, useRef } from 'react';
import Icon from './Icon';
import { startVideoGeneration, checkVideoGenerationStatus } from '../services/geminiService';

const AI_VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState('');

    // Fix: Use `number` for interval IDs in the browser, not `NodeJS.Timeout`.
    const pollingInterval = useRef<number | null>(null);
    const operationRef = useRef<any | null>(null);

    const stopPolling = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    }, []);

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    const handleOperationUpdate = useCallback(async (updatedOperation: any) => {
        operationRef.current = updatedOperation;

        if (updatedOperation.done) {
            setIsLoading(false);
            stopPolling();
            const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                setProgressMessage('다운로드 링크를 처리 중입니다...');
                try {
                    // NOTE: This assumes process.env.API_KEY is available client-side.
                    // This is generally not secure for production apps.
                    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch video: ${response.statusText}`);
                    }
                    const videoBlob = await response.blob();
                    const objectURL = URL.createObjectURL(videoBlob);
                    setVideoUrl(objectURL);
                    setProgressMessage('');
                } catch (fetchError) {
                    console.error("Error fetching video data:", fetchError);
                    setError('생성된 비디오를 가져오는 데 실패했습니다.');
                    setProgressMessage('');
                }
            } else {
                setError('비디오 생성에 성공했지만 다운로드 링크를 찾을 수 없습니다.');
            }
        } else {
            const messages = [
                "AI가 시나리오를 구상하고 있습니다...",
                "가상 카메라와 조명을 설정하는 중입니다...",
                "디지털 배우들의 연기를 디렉팅하고 있습니다...",
                "프레임별로 렌더링을 진행하고 있습니다...",
                "후반 작업: 색 보정과 음향 효과를 추가합니다...",
            ];
            setProgressMessage(messages[Math.floor(Math.random() * messages.length)]);
        }
    }, [stopPolling]);
    
    const pollOperation = useCallback(async () => {
        if (!operationRef.current) return;
        try {
            const updatedOperation = await checkVideoGenerationStatus(operationRef.current);
            await handleOperationUpdate(updatedOperation);
        } catch (e) {
            console.error(e);
            setError('비디오 생성 상태 확인 중 오류가 발생했습니다.');
            setIsLoading(false);
            stopPolling();
        }
    }, [stopPolling, handleOperationUpdate]);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError('');
        setVideoUrl(null);
        operationRef.current = null;
        setProgressMessage('비디오 생성을 시작합니다...');

        try {
            const initialOp = await startVideoGeneration(prompt);
            operationRef.current = initialOp;
            
            await pollOperation(); // Poll immediately
            
            if (operationRef.current && !operationRef.current.done) {
              pollingInterval.current = setInterval(pollOperation, 10000);
            }
        } catch (e) {
            setError('비디오 생성 시작에 실패했습니다. API 설정을 확인해 주세요.');
            console.error(e);
            setIsLoading(false);
        }
    }, [prompt, isLoading, pollOperation]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const resetState = () => {
        setPrompt('');
        setIsLoading(false);
        setError('');
        setVideoUrl(null);
        operationRef.current = null;
        setProgressMessage('');
        stopPolling();
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 text-gray-200 p-6">
            <div className="flex items-center mb-6 flex-shrink-0">
                <Icon name="veo" className="w-10 h-10 text-blue-400 mr-4" />
                <div>
                    <h2 className="text-2xl font-bold text-white">AI 영상 생성기 (Veo)</h2>
                    <p className="text-gray-400">텍스트 프롬프트로 시네마틱한 영상을 만들어보세요.</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto bg-black/30 rounded-lg p-6 mb-6 shadow-inner ring-1 ring-white/5 min-h-0 flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center">
                        <Icon name="veo" className="w-16 h-16 text-blue-400 animate-pulse mx-auto mb-4" />
                        <p className="text-lg font-semibold mb-2">영상을 생성 중입니다...</p>
                        <p className="text-sm text-gray-400 mb-4">이 작업은 몇 분 정도 소요될 수 있습니다. 잠시만 기다려 주세요.</p>
                        <div className="bg-gray-700/50 p-3 rounded-lg text-sm text-blue-300">
                           {progressMessage || "AI가 창의력을 발휘하고 있습니다..."}
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center">
                        <p className="text-red-400 p-4">{error}</p>
                        <button onClick={resetState} className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500">다시 시도</button>
                    </div>
                ) : videoUrl ? (
                    <div className="w-full max-w-2xl mx-auto">
                        <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-lg" />
                         <div className="text-center mt-4">
                            <button onClick={resetState} className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500">새 영상 만들기</button>
                        </div>
                    </div>
                ) : (
                     <div className="text-center text-gray-500 px-4">
                        <Icon name="video" className="w-20 h-20 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-gray-400">어떤 영상을 만들고 싶으신가요?</h3>
                        <p className="text-sm">아래에 아이디어를 입력하고 멋진 영상을 생성해보세요.</p>
                    </div>
                )}
            </div>

            <div className="flex-shrink-0">
                 <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="예: '네온 불빛이 가득한 미래 도시를 빠르게 질주하는 고양이 홀로그램'"
                        rows={2}
                        className="w-full bg-gray-700 text-gray-200 text-base rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition p-4 pr-20 resize-none"
                        disabled={isLoading}
                        aria-label="영상 컨셉 입력"
                    />
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="영상 생성"
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

export default AI_VideoGenerator;
