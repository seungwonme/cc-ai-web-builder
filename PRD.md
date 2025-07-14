# AI 웹 빌더 구현 계획

현재 프로젝트 구조를 분석한 결과, Next.js 14와 Tailwind CSS가 설치되어 있어 기본 환경은 준비되었습니다.

다음과 같은 **구체적인 구현 계획**을 제시드립니다:

## 🏗️ **1단계: 프로젝트 구조 설계**

```
src/
├── app/
│   ├── page.tsx (메인 웹 빌더 페이지)
│   ├── api/
│   │   ├── chat/route.ts (채팅 API)
│   │   ├── generate/route.ts (코드 생성 API)
│   │   └── preview/route.ts (프리뷰 API)
│   └── sessions/[sessionId]/preview/page.tsx (동적 프리뷰 페이지)
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx
│   │   ├── message-bubble.tsx
│   │   └── chat-input.tsx
│   ├── preview/
│   │   ├── preview-panel.tsx
│   │   └── code-editor.tsx
│   └── layout/
│       └── web-builder-layout.tsx
├── lib/
│   ├── ai/
│   │   └── claude-client.ts
│   ├── session/
│   │   └── session-manager.ts
│   └── file-system/
│       └── project-generator.ts
└── types/
    └── ai-builder.ts
```

## 🔧 **2단계: 필요한 의존성 추가**

- **UI 컴포넌트**: shadcn/ui (채팅, 버튼, 입력 등)
- **AI 통합**: @anthropic-ai/sdk (Claude API)
- **코드 편집**: @monaco-editor/react (코드 뷰어)
- **UUID**: uuid (세션 ID 생성)
- **파일 시스템**: fs-extra (서버 파일 조작)
- **실시간 통신**: WebSocket 또는 Server-Sent Events

## 🎨 **3단계: 기본 레이아웃 구성**

- **좌측 패널**: 채팅 인터페이스 (40% 너비)
- **우측 패널**: 웹사이트 프리뷰 (60% 너비)
- **하단 바**: 세션 상태, 생성 중 표시

## 💬 **4단계: 채팅 기능 구현**

- 메시지 입력 및 표시
- 코드 생성 요청 처리
- 실시간 응답 스트리밍
- 로딩 상태 및 에러 처리

## 🖥️ **5단계: 웹사이트 생성 및 프리뷰**

- 사용자 요청 분석
- Claude API로 HTML/CSS/JS 코드 생성
- 세션별 폴더에 파일 저장
- iframe으로 실시간 프리뷰 제공

## 🗂️ **6단계: 세션 관리**

- 유저별 고유 세션 ID 생성
- 서버에 `/sessions/{sessionId}` 폴더 생성
- 생성된 파일들 관리 및 정리

## 🤖 **7단계: Claude API 통합**

- 프롬프트 엔지니어링 (웹사이트 생성 최적화)
- 코드 생성 요청 처리
- 오류 처리 및 재시도 로직

---

## 📋 **구현 우선순위**

1. **기본 레이아웃과 UI 구성** (1-2시간)
2. **채팅 인터페이스 구현** (2-3시간)
3. **Claude API 통합** (1-2시간)
4. **파일 시스템 연동** (1-2시간)
5. **프리뷰 기능 구현** (2-3시간)
6. **세션 관리 완성** (1시간)
