import React from 'react';
import type { Service, TabDef } from '../types';
import Icon from './Icon';
import LyricsGenerator from './LyricsGenerator';
import MusicPromptGenerator from './MusicPromptGenerator';
import VideoEditor from './VideoEditor';
import AI_VideoGenerator from './AI_VideoGenerator';

interface MainContentProps {
  service: Service | null;
  activeTab: TabDef;
  lyricsPrompt: string;
  setLyricsPrompt: (prompt: string) => void;
  generatedLyrics: string;
  setGeneratedLyrics: (lyrics: string) => void;
  musicPrompt: string;
  setMusicPrompt: (prompt:string) => void;
  generatedMusicPrompt: string;
  setGeneratedMusicPrompt: (prompt: string) => void;
}

const ProjectOverview: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-gray-300 p-8">
        <Icon name="project" className="w-24 h-24 text-blue-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">프로젝트 관리</h2>
        <p className="text-center max-w-lg mb-8">
            이곳에서 생성된 파일들을 관리하고, 전체 워크플로우를 추적하며, Gemini 어시스턴트의 도움을 받아 창의적인 아이디어를 얻을 수 있습니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">파일 다운로드</h3>
                <p className="text-sm text-gray-400">각 단계에서 생성된 가사, 음악, 영상 파일들이 여기에 표시됩니다.</p>
            </div>
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">워크플로우 체크리스트</h3>
                <p className="text-sm text-gray-400">하단의 진행률 표시줄과 연동하여 현재 작업 단계를 시각적으로 확인합니다.</p>
            </div>
        </div>
    </div>
);

const ServicePlaceholder: React.FC<{ service?: Service | null }> = ({ service }) => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-gray-300 p-8">
        {service ? (
            <>
                <Icon name={service.icon} className="w-24 h-24 text-blue-500 mb-6" />
                <h2 className="text-3xl font-bold mb-2">{service.name}</h2>
                <p className="text-center max-w-md mb-4">{service.description}</p>
                {service.isApiBased ? (
                     <p className="bg-yellow-900/50 text-yellow-300 text-sm p-3 rounded-lg">이 서비스는 직접적인 API 연동이 필요하며, 현재 데모에서는 제공되지 않습니다.</p>
                ) : (
                    <p className="bg-indigo-900/50 text-indigo-300 text-sm p-3 rounded-lg">사이드바에서 서비스를 선택하여 시작하세요.</p>
                )}
            </>
        ) : (
            <>
                <Icon name="music" className="w-24 h-24 text-blue-500 mb-6 animate-pulse" />
                <h2 className="text-3xl font-bold mb-2">AI Music Production Platform</h2>
                <p className="text-center max-w-md">사이드바에서 서비스를 선택하여 음악 제작 여정을 시작하세요.</p>
            </>
        )}
    </div>
);

const MainContent: React.FC<MainContentProps> = ({ 
  service, 
  activeTab,
  lyricsPrompt, 
  setLyricsPrompt, 
  generatedLyrics, 
  setGeneratedLyrics,
  musicPrompt,
  setMusicPrompt,
  generatedMusicPrompt,
  setGeneratedMusicPrompt,
}) => {
  if (activeTab.id === 'lyrics') {
    return (
      <LyricsGenerator 
        prompt={lyricsPrompt} 
        setPrompt={setLyricsPrompt}
        generatedLyrics={generatedLyrics}
        setGeneratedLyrics={setGeneratedLyrics}
      />
    );
  }
  
  if (activeTab.id === 'music') {
    return (
        <MusicPromptGenerator
            prompt={musicPrompt}
            setPrompt={setMusicPrompt}
            generatedPrompt={generatedMusicPrompt}
            setGeneratedPrompt={setGeneratedMusicPrompt}
        />
    );
  }
  
  if (activeTab.id === 'video') {
    // If 'Google Veo 2' is selected, show the AI generator.
    // Otherwise, show the main timeline editor.
    if (service?.name === 'Google Veo 2') {
      return <AI_VideoGenerator />;
    }
    return <VideoEditor />;
  }

  if (activeTab.id === 'project') {
    return <ProjectOverview />;
  }

  // For any other tab, if no specific API-based service is selected, show a placeholder.
  // The iframe logic is removed as the new sidebar toggle handles external links.
  return <ServicePlaceholder service={service} />;
};

export default MainContent;
