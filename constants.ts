import type { TabDef, WorkflowStep } from './types';

export const TABS: TabDef[] = [
  {
    id: 'lyrics',
    name: '가사 생성',
    icon: 'lyrics',
    services: [
      { name: 'Google Gemini', url: null, description: '창의적이고 주제에 맞는 가사를 생성합니다.', icon: 'gemini', isApiBased: true },
    ],
  },
  {
    id: 'music',
    name: '음악 생성',
    icon: 'music',
    services: [
      { name: 'Suno AI', url: 'https://suno.com/', description: '가사와 음악을 통합하여 생성합니다.', icon: 'suno' },
      { name: 'Lyria RealTime', url: null, description: '실시간 스트리밍 음악 생성 (API 연동 필요)', icon: 'lyria', isApiBased: true },
    ],
  },
  {
    id: 'voice',
    name: '음성/자막 생성',
    icon: 'voice',
    services: [
      { name: 'Whisper AI Colab', url: 'https://colab.research.google.com/github/openai/whisper/blob/master/notebooks/Whisper.ipynb', description: '오디오를 업로드하여 자막을 생성합니다.', icon: 'whisper' },
      { name: 'Gemini TTS', url: null, description: '텍스트를 자연스러운 음성으로 변환 (API 연동 필요)', icon: 'gemini', isApiBased: true },
    ],
  },
  {
    id: 'video',
    name: '영상 편집',
    icon: 'video',
    services: [
      { name: 'CapCut Online', url: 'https://www.capcut.com/editor', description: '고급 편집 기능과 Gemini 통합 지원', icon: 'capcut' },
      { name: 'Google Veo 2', url: 'https://deepmind.google/technologies/veo/', description: '텍스트로 시네마틱 품질의 영상 생성', icon: 'veo', isApiBased: true },
      { name: 'Viggle AI', url: 'https://viggle.ai/', description: '캐릭터를 움직이는 애니메이션 생성', icon: 'viggle' },
    ],
  },
  {
    id: 'character-fx',
    name: '캐릭터 변신',
    icon: 'effects',
    services: [
      { name: 'RunwayML', url: 'https://runwayml.com/', description: '실시간 고화질 캐릭터 얼굴 변환', icon: 'runwayml' },
      { name: 'FaceSwap Online', url: 'https://faceswap.dev/', description: '온라인에서 캐릭터 얼굴을 변환합니다', icon: 'faceswap' },
    ],
  },
  {
    id: 'project',
    name: '프로젝트',
    icon: 'project',
    services: [],
  },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, name: '가사 작성', tabId: 'lyrics' },
  { id: 2, name: '음악 생성', tabId: 'music' },
  { id: 3, name: '음성/자막', tabId: 'voice' },
  { id: 4, name: '영상 편집', tabId: 'video' },
  { id: 5, name: '캐릭터 변신', tabId: 'character-fx' },
  { id: 6, name: '최종 완료', tabId: 'project' },
];