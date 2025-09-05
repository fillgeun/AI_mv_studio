
import React from 'react';
import type { WorkflowStep } from '../types';

interface FooterProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

const Footer: React.FC<FooterProps> = ({ steps, currentStep, onStepChange }) => {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <footer className="bg-gray-800/50 p-4 shadow-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
            onClick={() => onStepChange(currentStep - 1)}
            disabled={currentStep <= 1}
            className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            이전 단계
        </button>
        <div className="flex-grow mx-6">
            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="text-center w-1/6">
                            <div className={`text-xs font-semibold inline-block ${index + 1 <= currentStep ? 'text-blue-400' : 'text-gray-500'}`}>
                                {step.name}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                    <div
                        style={{ width: `${progressPercentage}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                    ></div>
                </div>
            </div>
        </div>
        <button
            onClick={() => onStepChange(currentStep + 1)}
            disabled={currentStep >= steps.length}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            다음 단계
        </button>
      </div>
    </footer>
  );
};

export default Footer;
