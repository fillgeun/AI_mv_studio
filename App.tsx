
import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import type { Service, TabDef } from './types';
import { TABS, WORKFLOW_STEPS } from './constants';

const App: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>(TABS[0].id);
  const [activeService, setActiveService] = useState<Service | null>(TABS[0].services[0]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // State for LyricsGenerator
  const [lyricsPrompt, setLyricsPrompt] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState('');

  // State for MusicPromptGenerator
  const [musicPrompt, setMusicPrompt] = useState('');
  const [generatedMusicPrompt, setGeneratedMusicPrompt] = useState('');

  const activeTab = useMemo(
    () => TABS.find(tab => tab.id === activeTabId) || TABS[0],
    [activeTabId]
  );

  const handleTabSelect = useCallback((tab: TabDef) => {
    setActiveTabId(tab.id);
    const firstService = tab.services.find(s => s.url) || tab.services[0] || null;
    setActiveService(firstService);
  }, []);

  const handleServiceSelect = useCallback((service: Service) => {
    setActiveService(service);
  }, []);

  const navigateWorkflow = useCallback((newStep: number) => {
    if (newStep >= 1 && newStep <= WORKFLOW_STEPS.length) {
      setCurrentStep(newStep);
      const workflowStep = WORKFLOW_STEPS[newStep - 1];
      const targetTab = TABS.find(t => t.id === workflowStep.tabId);
      if (targetTab) {
        handleTabSelect(targetTab);
      }
    }
  }, [handleTabSelect]);

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      <Header tabs={TABS} activeTabId={activeTabId} onTabSelect={handleTabSelect} />
      <div className="flex-grow grid grid-cols-12 gap-4 p-4 overflow-hidden">
        <div className="col-span-3 xl:col-span-2 bg-gray-800/50 rounded-lg overflow-y-auto">
          <Sidebar
            activeTab={activeTab}
            activeService={activeService}
            onServiceSelect={handleServiceSelect}
          />
        </div>
        <div className="col-span-9 xl:col-span-10 bg-gray-800/50 rounded-lg overflow-hidden">
          <MainContent 
            service={activeService} 
            activeTab={activeTab}
            lyricsPrompt={lyricsPrompt}
            setLyricsPrompt={setLyricsPrompt}
            generatedLyrics={generatedLyrics}
            setGeneratedLyrics={setGeneratedLyrics}
            musicPrompt={musicPrompt}
            setMusicPrompt={setMusicPrompt}
            generatedMusicPrompt={generatedMusicPrompt}
            setGeneratedMusicPrompt={setGeneratedMusicPrompt}
          />
        </div>
      </div>
      <Footer
        steps={WORKFLOW_STEPS}
        currentStep={currentStep}
        onStepChange={navigateWorkflow}
      />
    </div>
  );
};

export default App;