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
- **Setup:** No build step, dependencies are loaded via `importmap`.

## 🚀 시작하기 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하려면 다음 단계를 따르세요.

### 1. 사전 요구사항 (Prerequisites)

- 최신 웹 브라우저 (Chrome, Firefox, Safari, Edge 등)
- 코드 에디터 (예: Visual Studio Code)
- 로컬 웹 서버 (Live Server 확장 프로그램 추천)

### 2. 프로젝트 클론 (Clone Repository)

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 3. API 키 설정 (API Key Configuration) - ⚠️ 매우 중요!

이 애플리케이션의 AI 기능을 사용하려면 Google Gemini API 키가 **반드시** 필요합니다.

> **[!] 왜 이 설정이 필요한가요?**
>
> 이 프로젝트의 `.gitignore` 파일에는 `.env`가 포함되어 있습니다. 이는 API 키와 같은 민감한 정보를 안전하게 보호하기 위한 **의도적인 보안 조치**입니다.
>
> 따라서, 저장소를 처음 클론하면 API 키가 들어있는 `.env` 파일이 없기 때문에 AI 기능이 작동하지 않습니다. 아래 단계에 따라 **반드시 직접** `.env` 파일을 생성하고 자신의 API 키를 입력해야 합니다.

1.  **Google AI Studio**로 이동하여 API 키를 발급받으세요.
    - [Get API Key from Google AI Studio](https://aistudio.google.com/app/apikey)

2.  프로젝트의 최상위 폴더(root)에서 **`.env.example` 파일을 복사하여 `.env` 라는 이름의 새 파일을 만드세요.**

3.  새로 만든 `.env` 파일을 열고 `"이곳에 당신의..."` 부분을 발급받은 실제 API 키로 교체하세요. 파일 내용은 아래와 같은 형식이어야 합니다.

    ```env
    # .env
    API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    ```
> **보안 경고:** `.env` 파일은 `.gitignore`에 의해 Git 추적에서 제외됩니다. **절대로** 이 파일을 공개적으로 공유하거나 커밋하지 마세요.

### 4. 애플리케이션 실행 (Running the Application)

이 프로젝트는 별도의 빌드 과정이 필요 없습니다. `index.html` 파일을 로컬 서버로 실행하면 됩니다.

- **VS Code + Live Server (추천):**
  1.  VS Code에서 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 확장 프로그램을 설치합니다.
  2.  `index.html` 파일을 우클릭한 후 `Open with Live Server`를 선택합니다.

- **터미널 사용:**
  1.  Node.js가 설치되어 있다면, 프로젝트 폴더에서 아래 명령어를 실행할 수 있습니다.
  ```bash
  npx serve
  ```
  2.  터미널에 표시된 `localhost` 주소로 접속합니다.

## 📁 프로젝트 구조 (Project Structure)

```
/
├── components/         # 재사용 가능한 모든 React 컴포넌트
├── services/           # 외부 API와 통신하는 로직
├── .env.example        # 환경 변수 템플릿 파일
├── .gitignore          # Git 추적 제외 목록
├── App.tsx             # 최상위 React 컴포넌트 및 상태 관리
├── index.html          # 애플리케이션의 진입점 (Entry Point)
└── ...
```

## 🤝 기여하기 (Contributing)

이 프로젝트에 대한 기여를 환영합니다! 버그를 발견하거나 새로운 기능을 제안하고 싶다면 언제든지 이슈(Issue)를 열어주세요. 직접 코드를 수정하고 싶다면 Pull Request를 보내주시면 됩니다.

## ⚖️ 책임의 한계 (Disclaimer)

이 프로젝트는 AI를 활용하는 창작자들을 위한 실험적인 도구 모음입니다. 사용자가 이 도구를 사용하여 생성한 모든 결과물(가사, 음악, 영상 등)에 대한 저작권 및 법적 책임은 전적으로 해당 사용자에게 있습니다.

프로젝트 개발자는 생성된 콘텐츠로 인해 발생하는 어떠한 문제에 대해서도 책임을 지지 않으며, 결과물의 사용은 각 국가의 법률과 서비스 약관을 준수해야 합니다.

## 📄 라이선스 (License)

This project is licensed under the `Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License`.
자세한 내용은 [여기](https://creativecommons.org/licenses/by-nc-sa/4.0/)를 참조하세요.

## 🗺️ 향후 계획 (Roadmap)

- [ ] Lyria RealTime, Gemini TTS API 직접 연동
- [ ] 비디오 에디터 기능 고도화 (트랜지션, 텍스트 오버레이, 필터 등)
- [ ] 생성된 에셋(가사, 프롬프트, 영상)을 프로젝트별로 관리하는 기능
- [ ] 워크플로우 단계별 가이드 및 튜토리얼 추가

## ⚠️ 알려진 문제 (Known Issues)

- Google Veo API를 이용한 영상 생성은 몇 분 이상 소요될 수 있습니다.
- 현재 비디오 에디터는 기본적인 기능만 갖춘 프로토타입 단계입니다.
- API 키가 클라이언트 측 코드에서 직접 호출됩니다. 이는 데모 목적이며, 실제 프로덕션 환경에서는 서버를 통해 API를 호출하는 것이 안전합니다.
