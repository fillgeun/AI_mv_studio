# AI Music Production Platform

이 프로젝트는 AI를 이용해서 창작하는 사람을 위한 도구들을 모아둔 프로젝트입니다. 가사 생성부터 최종 뮤직비디오 제작까지, 복잡한 창작 과정을 하나의 인터페이스에서 해결할 수 있도록 돕습니다.

---

## 🎵 주요 기능 (Core Features)

- **탭 기반 워크플로우 (Tab-Based Workflow):** 가사, 음악, 음성, 영상 등 제작 단계별로 명확하게 구분된 인터페이스를 제공합니다.
- **Gemini API 통합 (Gemini API Integration):**
  - **AI 가사 생성기:** 주제나 분위기를 입력하면 Gemini가 창의적인 가사를 생성합니다.
  - **AI 음악 프롬프트 어시스턴트:** 음악 컨셉을 입력하면 Suno AI와 같은 음악 생성 모델에 최적화된 상세 프롬프트를 만들어줍니다.
  - **AI 영상 생성기:** Google Veo 2 모델을 사용하여 텍스트 프롬프트만으로 시네마틱한 영상을 생성합니다.
  - **Gemini 어시스턴트:** 사이드바에 내장되어 언제든지 창의적인 아이디어나 도움을 받을 수 있습니다.
- **워크플로우 시스템 (Workflow System):** 하단의 진행률 표시줄을 통해 전체 음악 제작 과정을 체계적으로 관리하고 다음 단계로 쉽게 이동할 수 있습니다.
- **인터랙티브 비디오 에디터 (Interactive Video Editor):** 미디어 파일을 가져와 기본적인 타임라인 편집, 클립 자르기, 속성 변경 등을 수행할 수 있는 내장 에디터를 제공합니다.
- **외부 서비스 연동 (External Service Integration):** Suno, CapCut 등 강력한 외부 AI 툴을 쉽게 열고 사용할 수 있도록 바로가기를 제공합니다.

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Model:** Google Gemini API (`gemini-2.5-flash`, `veo-2.0-generate-001`) via `@google/genai`
- **Build Tool:** Vite

## 🚀 시작하기 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하려면 다음 단계를 따르세요.

### 1. 사전 요구사항 (Prerequisites)

- [Node.js](https://nodejs.org/) (LTS version recommended) and npm
- 코드 에디터 (예: Visual Studio Code)

### 2. 프로젝트 클론 및 설정 (Clone and Setup)

```bash
# 저장소 클론
git clone https://github.com/fillgeun/AI_mv_studio.git
cd AI_mv_studio

# 의존성 설치
npm install
```

### 3. API 키 설정 (API Key Configuration) - ⚠️ 매우 중요!

이 애플리케이션의 AI 기능을 사용하려면 Google Gemini API 키가 **반드시** 필요합니다.

1.  **Google AI Studio**로 이동하여 API 키를 발급받으세요.
    - [Get API Key from Google AI Studio](https://aistudio.google.com/app/apikey)

2.  프로젝트의 최상위 폴더(root)에 `.env` 라는 이름의 새 파일을 만드세요.

3.  `.env` 파일에 발급받은 실제 API 키를 아래와 같은 형식으로 추가하세요.

    ```env
    # .env
    API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    ```
> **보안 경고:** `.env` 파일은 `.gitignore`에 의해 Git 추적에서 제외됩니다. **절대로** 이 파일을 공개적으로 공유하거나 커밋하지 마세요.

### 4. 개발 서버 실행 (Running the Development Server)

API 키 설정이 완료되면, 개발 서버를 시작할 수 있습니다.

```bash
npm run dev
```

터미널에 표시된 `localhost` 주소(예: `http://localhost:5173`)로 접속하여 애플리케이션을 확인하세요.

## 🚀 배포 (Deployment)

이 프로젝트는 GitHub Pages로 쉽게 배포할 수 있도록 설정되어 있습니다.

1.  **`package.json` 확인:** `homepage` 필드가 배포하려는 GitHub Pages 주소와 일치하는지 확인하세요.
    ```json
    "homepage": "https://fillgeun.github.io/AI_mv_studio/",
    ```

2.  **배포 스크립트 실행:** 아래 명령어를 실행하면 프로젝트가 빌드되고 `gh-pages` 브랜치에 배포됩니다.
    ```bash
    npm run deploy
    ```

3.  **GitHub Pages 설정 확인:**
    - GitHub 저장소의 `Settings > Pages`로 이동합니다.
    - 'Source'를 'Deploy from a branch'로 선택하고, 브랜치를 `gh-pages`로 설정한 뒤 저장합니다.
    - 몇 분 후 `homepage` 주소에서 배포된 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조 (Project Structure)

```
/
├── components/         # React 컴포넌트
├── services/           # 외부 API 통신 로직
├── .env                # (직접 생성) API 키 등 환경 변수
├── .gitignore          # Git 추적 제외 목록
├── index.html          # 애플리케이션의 진입점 (Entry Point)
├── index.tsx           # 최상위 React 렌더링 스크립트
├── package.json        # 프로젝트 의존성 및 스크립트
├── vite.config.ts      # Vite 빌드 설정
└── ...
```

## ⚖️ 책임의 한계 (Disclaimer)

이 프로젝트는 AI를 활용하는 창작자들을 위한 실험적인 도구 모음입니다. 사용자가 이 도구를 사용하여 생성한 모든 결과물(가사, 음악, 영상 등)에 대한 저작권 및 법적 책임은 전적으로 해당 사용자에게 있습니다.

프로젝트 개발자는 생성된 콘텐츠로 인해 발생하는 어떠한 문제에 대해서도 책임을 지지 않으며, 결과물의 사용은 각 국가의 법률과 서비스 약관을 준수해야 합니다.
