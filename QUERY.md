# 🚀 AI 웹 빌더 구현 계획

## 📋 **전체 플로우**

```
사용자 채팅 → Next.js 서버 → `create-next-app` 실행 → 프로젝트 생성 → 코드 작성 → `pnpm run dev` 실행 → 포트 반환 → 프리뷰 제공
```

---

## 🏗️ **1단계: 프로젝트 기본 설정**

### **의존성 설치**

```bash
# 필수 패키지
pnpm add uuid fs-extra tree-kill
pnpm add @types/uuid -D

# UI 컴포넌트
pnpm add @radix-ui/react-dialog @radix-ui/react-button @radix-ui/react-textarea
pnpm add lucide-react

# 실시간 통신
pnpm add socket.io socket.io-client
```

### **환경 변수 설정**

```bash
# .env.local
SESSIONS_DIR=./sessions
MAX_CONCURRENT_PROJECTS=5
PROJECT_TIMEOUT=30000
```

---

## 🗂️ **2단계: 디렉토리 구조**

```
src/
├── app/
│   ├── page.tsx                    # 메인 페이지
│   ├── api/
│   │   ├── chat/route.ts          # 채팅 API
│   │   ├── generate/route.ts      # 프로젝트 생성 API
│   │   └── preview/route.ts       # 프리뷰 상태 API
│   └── sessions/[sessionId]/
│       └── proxy/[...slug]/page.tsx # 프리뷰 프록시
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx
│   │   ├── message-list.tsx
│   │   └── message-input.tsx
│   ├── preview/
│   │   ├── preview-panel.tsx
│   │   └── loading-spinner.tsx
│   └── layout/
│       └── main-layout.tsx
├── lib/
│   ├── session-manager.ts          # 세션 관리
│   ├── project-generator.ts        # 프로젝트 생성
│   ├── port-manager.ts             # 포트 관리
│   └── claude-code-executor.ts     # Claude Code 실행
├── types/
│   └── index.ts
└── sessions/                       # 생성된 프로젝트들
    ├── {sessionId-1}/
    ├── {sessionId-2}/
    └── ...
```

---

## 🔧 **3단계: 핵심 시스템 구현**

### **3-1: 세션 관리 시스템**

```typescript
// lib/session-manager.ts
class SessionManager {
  // 세션 생성
  createSession(): string;

  // 세션 정보 조회
  getSession(sessionId: string): SessionInfo;

  // 세션 삭제
  deleteSession(sessionId: string): void;

  // 모든 세션 정리
  cleanupSessions(): void;
}
```

### **3-2: 프로젝트 생성 시스템**

```typescript
// lib/project-generator.ts
class ProjectGenerator {
  // Next.js 프로젝트 생성
  async createNextJsProject(sessionId: string): Promise<boolean>;

  // 프롬프트 기반 코드 생성
  async generateCode(sessionId: string, prompt: string): Promise<boolean>;

  // 개발 서버 실행
  async startDevServer(sessionId: string): Promise<number>;

  // 서버 중지
  async stopDevServer(sessionId: string): Promise<void>;
}
```

### **3-3: 포트 관리 시스템**

```typescript
// lib/port-manager.ts
class PortManager {
  // 사용 가능한 포트 찾기
  async findAvailablePort(start: number = 3001): Promise<number>;

  // 포트 예약
  reservePort(port: number, sessionId: string): void;

  // 포트 해제
  releasePort(port: number): void;

  // 세션의 포트 조회
  getPortBySession(sessionId: string): number | null;
}
```

---

## 🎨 **4단계: UI 컴포넌트 구현**

### **4-1: 채팅 인터페이스**

- **메시지 타입**: 사용자 메시지, 시스템 메시지, 에러 메시지
- **상태 표시**: 생성 중, 완료, 실패
- **메시지 기능**: 텍스트 입력, 전송, 히스토리

### **4-2: 프리뷰 패널**

- **상태별 UI**: 로딩, 준비 완료, 에러, 프리뷰 표시
- **iframe 통합**: 생성된 웹사이트 표시
- **새로고침 기능**: 변경사항 반영

### **4-3: 메인 레이아웃**

- **반응형 디자인**: 데스크톱/모바일 대응
- **분할 화면**: 좌측 40% 채팅, 우측 60% 프리뷰
- **상태 바**: 현재 세션 상태 표시

---

## 🔄 **5단계: API 라우트 구현**

### **5-1: 채팅 API**

```typescript
// app/api/chat/route.ts
POST /api/chat
- 사용자 메시지 수신
- 프로젝트 생성 요청 처리
- 실시간 응답 스트리밍
```

### **5-2: 생성 API**

```typescript
// app/api/generate/route.ts
POST /api/generate
- create-next-app 명령어 실행
- Claude Code로 코드 생성
- pnpm run dev 실행
- 포트 번호 반환
```

### **5-3: 프리뷰 API**

```typescript
// app/api/preview/route.ts
GET /api/preview/:sessionId
- 프로젝트 상태 조회
- 개발 서버 상태 확인
- 프리뷰 URL 반환
```

---

## ⚡ **6단계: 실시간 통신 구현**

### **6-1: WebSocket 이벤트**

```typescript
// 클라이언트 → 서버
- 'generate_request': 프로젝트 생성 요청
- 'message_send': 채팅 메시지 전송

// 서버 → 클라이언트
- 'generation_status': 생성 진행 상태
- 'preview_ready': 프리뷰 준비 완료
- 'error': 에러 발생
```

### **6-2: Server-Sent Events (대안)**

```typescript
// 실시간 상태 업데이트
- 프로젝트 생성 진행률
- 개발 서버 시작 상태
- 에러 메시지
```

---

## 🛠️ **7단계: 명령어 실행 시스템**

### **7-1: 프로젝트 생성 명령어**

```bash
# 세션 폴더로 이동
cd sessions/{sessionId}

# Next.js 프로젝트 생성
pnpm dlx create-next-app@15 --ts --eslint --tailwind --src-dir --app --turbopack --use-pnpm --yes project

# 프로젝트 폴더로 이동
cd project
```

### **7-2: 코드 생성 및 실행**

```bash
# Claude Code로 코드 생성 (프롬프트 기반)
# 파일 직접 생성 또는 AI 도구 연동

# 개발 서버 실행
pnpm run dev
```

### **7-3: 포트 및 프로세스 관리**

```typescript
// 프로세스 관리
- spawn으로 명령어 실행
- PID 저장 및 관리
- 프로세스 종료 처리
- 포트 충돌 방지
```

---

## 🔒 **8단계: 에러 처리 및 정리**

### **8-1: 에러 처리**

- **명령어 실행 실패**: 재시도 로직
- **포트 충돌**: 다른 포트 할당
- **세션 타임아웃**: 자동 정리
- **리소스 부족**: 최대 동시 프로젝트 수 제한

### **8-2: 리소스 정리**

- **세션 만료**: 30분 후 자동 삭제
- **프로세스 종료**: 개발 서버 정리
- **폴더 삭제**: 임시 파일 정리
- **포트 해제**: 포트 관리자 업데이트

---

## 📝 **9단계: 추가 기능**

### **9-1: 프로젝트 관리**

- **프로젝트 목록**: 사용자별 프로젝트 히스토리
- **프로젝트 복제**: 기존 프로젝트 복사
- **프로젝트 내보내기**: ZIP 파일 다운로드

### **9-2: 개발 편의성**

- **코드 에디터**: Monaco Editor 통합
- **파일 탐색기**: 생성된 파일 구조 보기
- **로그 뷰어**: 개발 서버 로그 표시

---

## 🎯 **구현 우선순위**

1. **기본 세션 관리** (1-2시간)
2. **프로젝트 생성 시스템** (2-3시간)
3. **포트 관리 및 개발 서버** (1-2시간)
4. **채팅 및 프리뷰 UI** (2-3시간)
5. **API 라우트 연결** (1-2시간)
6. **실시간 통신** (1-2시간)
7. **에러 처리 및 정리** (1시간)

**총 예상 시간: 9-15시간**
