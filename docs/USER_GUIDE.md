# HWMS (Hybrid WebApp Modules System) 사용자 가이드

---

| 항목 | 내용 |
|------|------|
| **문서 버전** | 1.0.0 |
| **최종 수정일** | 2025년 12월 31일 |

---

## 목차

1. [개요](#1-개요)
2. [시스템 요구사항](#2-시스템-요구사항)
3. [설치 절차](#3-설치-절차)
4. [Claude 연동 설정](#4-claude-연동-설정)
5. [프로젝트 생성](#5-프로젝트-생성)
6. [생성된 프로젝트 실행](#6-생성된-프로젝트-실행)
7. [기존 프로젝트 확장](#7-기존-프로젝트-확장)
8. [모듈 목록](#8-모듈-목록)
9. [FAQ](#9-faq)
10. [문제 해결 가이드](#10-문제-해결-가이드)
11. [부록](#11-부록)

---

## 1. 개요

### 1.1 HWMS란

HWMS(Hybrid WebApp Modules System)는 AI 기반의 하이브리드 웹/모바일 애플리케이션 자동 생성 시스템입니다. 사전 정의된 모듈을 조합하여 프로젝트의 기본 구조(스캐폴드)를 자동으로 생성합니다.

### 1.2 주요 기능

| 기능 | 설명 |
|------|------|
| **모듈 기반 생성** | 검증된 UI 컴포넌트와 기능 모듈을 조합하여 프로젝트 생성 |
| **의존성 자동 해결** | 선택된 모듈에 필요한 추가 모듈 및 패키지 자동 분석 |
| **라우트/메뉴 자동 구성** | 페이지 모듈 추가 시 라우팅 및 네비게이션 자동 설정 |
| **크로스 플랫폼 지원** | 웹(React) 및 모바일(Android) 동시 생성 |
| **네이티브 기능 연동** | 카메라, 푸시 알림 등 디바이스 기능 연동 지원 |

### 1.3 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                      사용자 (Claude 대화)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    HWMS MCP Server                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ list_modules│  │  resolve_   │  │ generate_scaffold   │  │
│  │             │  │ dependencies│  │ / add_module        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    모듈 저장소 (modules/)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │   base   │ │   page   │ │  bridge  │ │  shell   │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    생성된 프로젝트 (output/)                   │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   web/ (React)   │    │ android/ (Kotlin)│               │
│  └──────────────────┘    └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 도입 효과

- **개발 초기 셋업 시간 단축**: 프로젝트 기본 구조 수동 구성 불필요
- **일관된 코드 품질**: 검증된 모듈 템플릿 사용
- **유연한 확장성**: 필요에 따라 모듈 추가/제거 가능

---

## 2. 시스템 요구사항

### 2.1 필수 소프트웨어

| 소프트웨어 | 최소 버전 | 용도 | 다운로드 |
|------------|-----------|------|----------|
| **Node.js** | 18.0.0 | JavaScript 런타임 | [nodejs.org](https://nodejs.org/) |
| **Git** | 2.0.0 | 소스 코드 관리 | [git-scm.com](https://git-scm.com/) |
| **Claude Desktop** 또는 **Claude Code** | 최신 버전 | AI 인터페이스 | 2.2절 참고 |

### 2.2 Claude 클라이언트 선택

| 클라이언트 | 특징 | 권장 사용자 | 비고 |
|------------|------|-------------|------|
| **Claude Code** | CLI 기반, 개발 워크플로우 통합 | 개발자, 기획자 | **권장** |
| **Claude Desktop** | GUI 기반, 직관적 사용 | 비개발자 | - |

**다운로드 경로:**
- Claude Code: `npm install -g @anthropic-ai/claude-code`
- Claude Desktop: [claude.ai/download](https://claude.ai/download)

### 2.3 설치 확인

터미널(macOS) 또는 명령 프롬프트(Windows)에서 다음 명령어로 설치 상태를 확인합니다.

**터미널 실행 방법:**
- **macOS**: `Cmd + Space` → "터미널" 입력 → Enter
- **Windows**: `Win + R` → "cmd" 입력 → Enter

```bash
node --version    # 예상 출력: v20.x.x
git --version     # 예상 출력: git version 2.x.x
```

---

## 3. 설치 절차

### 3.1 소스 코드 다운로드

터미널에서 다음 명령어를 순차적으로 실행합니다.

```bash
# 1. 작업 디렉토리로 이동
cd ~/Desktop

# 2. 저장소 복제
git clone https://github.com/yundoun/hwms-mcp-server.git

# 3. 프로젝트 디렉토리 진입
cd hwms-mcp-server

# 4. 의존성 패키지 설치
npm install

# 5. TypeScript 빌드
npm run build
```

### 3.2 각 단계별 예상 결과

| 단계 | 명령어 | 정상 실행 시 출력 |
|------|--------|-------------------|
| 1 | `cd ~/Desktop` | 출력 없음 |
| 2 | `git clone ...` | 다운로드 진행률 표시 |
| 3 | `cd hwms-mcp-server` | 출력 없음 |
| 4 | `npm install` | 패키지 설치 로그 |
| 5 | `npm run build` | 빌드 완료 메시지 |

### 3.3 설치 경로 확인

이후 설정에 필요하므로 설치 경로를 기록해 둡니다.

```bash
pwd
# 출력 예시: /Users/username/Desktop/hwms-mcp-server
```

---

## 4. Claude 연동 설정

### 4.1 Claude Code 설정 (권장)

Claude Code는 터미널 기반의 AI 개발 도구로, 개발 워크플로우와 자연스럽게 통합됩니다.

#### 4.1.1 Claude Code 설치

터미널에서 다음 명령어를 실행합니다.

```bash
npm install -g @anthropic-ai/claude-code
```

#### 4.1.2 MCP 서버 등록

```bash
# 프로젝트 범위 등록 (해당 프로젝트에서만 사용)
cd [설치경로]
claude mcp add -s project hwms -- node dist/index.js

# 또는 사용자 범위 등록 (모든 프로젝트에서 사용)
claude mcp add -s user hwms -- node [설치경로]/dist/index.js
```

> **참고:** `[설치경로]`는 3.3절에서 확인한 경로로 대체합니다.

#### 4.1.3 등록 확인

```bash
claude mcp list
```

출력 목록에 `hwms`가 포함되어 있으면 설정이 완료된 것입니다.

#### 4.1.4 사용 시작

```bash
claude
```

Claude Code가 실행되면 자연어로 HWMS 기능을 사용할 수 있습니다.

```
사용 가능한 HWMS 모듈 목록을 조회해 주세요.
```

---

### 4.2 Claude Desktop 설정

Claude Desktop은 GUI 기반의 데스크톱 애플리케이션입니다.

#### 4.2.1 설정 파일 위치

| 운영체제 | 경로 |
|----------|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

#### 4.2.2 설정 파일 편집

**macOS:**
```bash
open ~/Library/Application\ Support/Claude/
```
해당 폴더에서 `claude_desktop_config.json` 파일을 텍스트 편집기로 엽니다.

**Windows:**
1. `Win + R` 입력
2. `%APPDATA%\Claude` 입력 후 Enter
3. `claude_desktop_config.json` 파일을 메모장으로 열기

#### 4.2.3 설정 내용

파일 내용을 다음과 같이 수정합니다. `[설치경로]`는 3.3절에서 확인한 경로로 대체합니다.

```json
{
  "mcpServers": {
    "hwms": {
      "command": "node",
      "args": ["[설치경로]/dist/index.js"]
    }
  }
}
```

**설정 예시 (macOS):**
```json
{
  "mcpServers": {
    "hwms": {
      "command": "node",
      "args": ["/Users/username/Desktop/hwms-mcp-server/dist/index.js"]
    }
  }
}
```

**설정 예시 (Windows):**
```json
{
  "mcpServers": {
    "hwms": {
      "command": "node",
      "args": ["C:\\Users\\username\\Desktop\\hwms-mcp-server\\dist\\index.js"]
    }
  }
}
```

> **참고:** Windows 환경에서는 경로 구분자를 `\\`(이중 백슬래시)로 입력해야 합니다.

#### 4.2.4 적용

1. Claude Desktop 완전 종료 (macOS: `Cmd+Q`, Windows: 트레이에서 종료)
2. Claude Desktop 재실행
3. 새 대화 시작

#### 4.2.5 연동 확인

Claude에 다음과 같이 입력하여 정상 연동을 확인합니다.

```
사용 가능한 HWMS 모듈 목록을 조회해 주세요.
```

모듈 목록이 출력되면 연동이 완료된 것입니다.

---

## 5. 프로젝트 생성

### 5.1 기본 생성 예시

Claude에 자연어로 요청하면 자동으로 프로젝트가 생성됩니다.

**예시 1: 단일 페이지 프로젝트**
```
대시보드 페이지가 포함된 관리자 웹앱을 생성해 주세요.
프로젝트명은 "admin-dashboard"로 지정합니다.
```

**예시 2: 복합 기능 프로젝트**
```
다음 기능이 포함된 관리자 시스템을 생성해 주세요:
- 로그인 페이지
- 대시보드
- 사용자 관리 페이지
프로젝트명: "admin-system"
```

**예시 3: 모바일 기능 포함 프로젝트**
```
카메라 촬영 기능이 포함된 Android 하이브리드 앱을 생성해 주세요.
프로젝트명: "photo-app"
```

### 5.2 생성 프로세스

Claude는 다음 순서로 프로젝트를 생성합니다.

1. **모듈 분석**: 요청에 적합한 모듈 선택
2. **의존성 해결**: 필요한 추가 모듈 자동 포함
3. **스캐폴드 생성**: 프로젝트 구조 및 파일 생성
4. **설정 적용**: 라우트, 메뉴, 패키지 의존성 자동 구성

### 5.3 생성 결과물 위치

생성된 프로젝트는 다음 경로에 저장됩니다.

```
[설치경로]/output/[프로젝트명]/
├── web/                 # React 웹 애플리케이션
├── android/             # Android 네이티브 앱 (해당 시)
├── hwms.config.json     # 프로젝트 설정 파일
├── package.json         # 루트 패키지 설정
└── README.md            # 프로젝트 안내 문서
```

---

## 6. 생성된 프로젝트 실행

### 6.1 웹 애플리케이션 실행

```bash
# 1. 웹 프로젝트 디렉토리 이동
cd [설치경로]/output/[프로젝트명]/web

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

### 6.2 실행 확인

정상 실행 시 다음과 같은 출력이 표시됩니다.

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://xxx.xxx.xxx.xxx:5173/
```

웹 브라우저에서 `http://localhost:5173`으로 접속하여 애플리케이션을 확인합니다.

### 6.3 개발 서버 종료

터미널에서 `Ctrl + C`를 입력합니다.

### 6.4 Android 빌드 (선택사항)

Android 앱 빌드는 Android Studio 설치가 필요합니다. 상세 절차는 별도 가이드를 참고하시기 바랍니다.

---

## 7. 기존 프로젝트 확장

### 7.1 모듈 추가

생성된 프로젝트에 추가 모듈을 적용할 수 있습니다.

**요청 예시:**
```
[프로젝트 경로] 프로젝트에 로그인 페이지를 추가해 주세요.
```

### 7.2 자동 처리 항목

- 모듈 소스 파일 복사
- 라우트 자동 등록
- 네비게이션 메뉴 추가
- npm 패키지 의존성 추가
- 설정 파일 업데이트
- 기존 파일 백업 생성

### 7.3 추가 후 실행

```bash
cd [프로젝트 경로]/web
npm install    # 새 패키지 설치
npm run dev    # 개발 서버 재실행
```

---

## 8. 모듈 목록

### 8.1 기본 템플릿

| 모듈명 | 설명 | 비고 |
|--------|------|------|
| `base-mantis-admin` | Mantis Admin 기반 템플릿 (MUI, Vite, React) | 필수 |

### 8.2 페이지 모듈

| 모듈명 | 설명 | 주요 기능 |
|--------|------|-----------|
| `page-dashboard` | 대시보드 | 차트, 통계 카드, 진행률 표시 |
| `page-login` | 로그인 | 이메일/비밀번호 인증 |
| `page-register` | 회원가입 | 사용자 등록 폼 |
| `page-user-management` | 사용자 관리 | CRUD 기능, 데이터 그리드 |
| `page-advanced-table` | 고급 테이블 | 정렬, 필터링, 페이지네이션 |
| `page-multi-step-form` | 다단계 폼 | 스텝 기반 입력 프로세스 |
| `page-sample-crud` | CRUD 예제 | 기본 CRUD 패턴 예시 |

### 8.3 네이티브 브릿지 모듈

| 모듈명 | 설명 | 지원 플랫폼 |
|--------|------|-------------|
| `native-bridge-core` | 브릿지 코어 라이브러리 | Android |
| `bridge-camera` | 카메라/갤러리 연동 | Android |
| `bridge-push` | 푸시 알림 (FCM) | Android |
| `bridge-device-info` | 디바이스 정보 조회 | Android |

### 8.4 앱 쉘

| 모듈명 | 설명 |
|--------|------|
| `android-app-shell` | Android WebView 앱 컨테이너 |

---

## 9. FAQ

### Q1. 생성된 코드를 수정할 수 있습니까?

네, 가능합니다. 생성된 코드는 프로젝트의 초기 구조이며, 요구사항에 맞게 자유롭게 수정할 수 있습니다.

### Q2. 디자인 커스터마이징은 어떻게 합니까?

`web/src/themes` 디렉토리에서 테마 설정을 수정할 수 있습니다. Material-UI 테마 시스템을 기반으로 합니다.

### Q3. 프로덕션 배포가 가능합니까?

네, 가능합니다. 다만 다음 사항을 추가로 구성해야 합니다:
- 백엔드 API 연동
- 환경 변수 설정
- 빌드 및 배포 파이프라인 구성

### Q4. iOS 플랫폼을 지원합니까?

현재 버전에서는 Android만 지원합니다. iOS 지원은 향후 업데이트에서 제공될 예정입니다.

### Q5. 커스텀 모듈을 추가할 수 있습니까?

네, `modules` 디렉토리에 새 폴더를 생성하고 `module.meta.json` 파일을 작성하여 커스텀 모듈을 추가할 수 있습니다.

### Q6. 오프라인 환경에서 사용할 수 있습니까?

Claude와의 통신에는 인터넷 연결이 필요합니다. 그러나 생성된 프로젝트는 오프라인 환경에서도 개발을 진행할 수 있습니다.

---

## 10. 문제 해결 가이드

### 10.1 Node.js 관련 오류

**증상:** `command not found: node`

**원인:** Node.js가 설치되지 않았거나 PATH에 등록되지 않음

**해결:**
1. [nodejs.org](https://nodejs.org/)에서 Node.js LTS 버전 설치
2. 터미널 재시작 후 `node --version` 확인

---

### 10.2 Git 관련 오류

**증상:** `command not found: git`

**원인:** Git이 설치되지 않음

**해결:**
1. [git-scm.com](https://git-scm.com/)에서 Git 설치
2. 터미널 재시작 후 `git --version` 확인

---

### 10.3 npm install 실패

**증상:** 패키지 설치 중 오류 발생

**해결:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

### 10.4 Claude HWMS 도구 인식 불가

**증상:** Claude가 HWMS 관련 명령을 인식하지 못함

**확인 사항:**
1. 설정 파일 경로가 정확한지 확인
2. 경로에 특수 문자나 공백이 없는지 확인
3. Claude Desktop 완전 종료 후 재시작
4. `npm run build` 정상 완료 여부 확인

---

### 10.5 포트 충돌

**증상:** `Port 5173 is already in use`

**해결:**
```bash
npm run dev -- --port 3000
```
이후 `http://localhost:3000`으로 접속

---

### 10.6 Android 빌드 실패

**원인:** Android SDK 또는 빌드 도구 미설치

**해결:** Android Studio 설치 및 SDK 구성이 필요합니다. 상세 내용은 Android 개발 환경 설정 가이드를 참고하시기 바랍니다.

---

## 11. 부록

### 11.1 기술 지원

문제가 지속되는 경우 다음 채널을 통해 지원을 요청할 수 있습니다.

- **GitHub Issues**: [github.com/yundoun/hwms-mcp-server/issues](https://github.com/yundoun/hwms-mcp-server/issues)

문의 시 다음 정보를 함께 제공하면 신속한 지원이 가능합니다:
- 운영체제 및 버전
- Node.js 버전 (`node --version`)
- 오류 메시지 전문
- 재현 절차

### 11.2 관련 문서

| 문서 | 설명 |
|------|------|
| `README.md` | 프로젝트 개요 및 빠른 시작 가이드 |
| `docs/API_REFERENCE.md` | MCP 도구 API 레퍼런스 |

### 11.3 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0.0 | 2024.12 | 최초 작성 |

---

**문서 끝**
