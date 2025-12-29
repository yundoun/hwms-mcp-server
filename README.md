# Hybrid WebApp Modules System

AI-driven module selection and scaffold generation for hybrid web applications.

## Overview

하이브리드 웹앱 개발을 위한 모듈 시스템입니다. MCP(Model Context Protocol)를 통해 AI가 프로젝트 요구사항에 맞는 모듈을 자동으로 선택하고 조합합니다.

## Features

- **모듈 목록 조회** - 사용 가능한 모듈 및 카테고리별 필터링
- **의존성 자동 해결** - 선택된 모듈의 의존성 분석 및 해결
- **프로젝트 스캐폴드 생성** - 모듈 조합으로 프로젝트 구조 자동 생성
- **라우트/메뉴 자동 주입** - 페이지 모듈 추가 시 라우트와 메뉴 자동 등록
- **npm 의존성 자동 추가** - 모듈별 npm 패키지 자동 주입

## Quick Start

### 1. 설치

```bash
git clone https://github.com/yundoun/hwms-mcp-server.git
cd hwms-mcp-server
npm install
npm run build
```

### 2. MCP 서버 등록

#### Claude Code (CLI) 사용자

**방법 A: 프로젝트 범위** (`.mcp.json` 생성, 팀 공유 가능)
```bash
claude mcp add -s project hwms -- node dist/index.js
```

**방법 B: 사용자 범위** (모든 프로젝트에서 사용)
```bash
claude mcp add -s user hwms -- node /절대경로/hwms-mcp-server/dist/index.js
```

**등록 확인**
```bash
claude mcp list
```

#### Claude Desktop 사용자

`~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)
`%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "hwms": {
      "command": "node",
      "args": ["/절대경로/hwms-mcp-server/dist/index.js"]
    }
  }
}
```

설정 후 Claude Desktop 재시작

### 3. 사용 시작

Claude에게 말하기:
```
"사용 가능한 모듈 목록을 보여줘"
"대시보드와 로그인 페이지가 있는 관리자 앱을 만들어줘"
```

## Available Modules

### Base Template
| Module | Description |
|--------|-------------|
| `base-mantis-admin` | Mantis Admin 기반 템플릿 (MUI, Vite, React) |

### Page Modules
| Module | Description |
|--------|-------------|
| `page-dashboard` | Analytics 스타일 대시보드 |
| `page-login` | 소셜 로그인 페이지 |
| `page-register` | 회원가입 페이지 |
| `page-user-management` | 사용자 관리 CRUD |
| `page-advanced-table` | MUI DataGrid 기반 고급 테이블 |
| `page-multi-step-form` | Stepper 기반 다단계 폼 |
| `page-sample-crud` | CRUD 예제 페이지 |

### Bridge Modules (Native)
| Module | Description |
|--------|-------------|
| `native-bridge-core` | 네이티브 브릿지 코어 |
| `bridge-camera` | 카메라/갤러리 브릿지 |
| `bridge-push` | 푸시 알림 브릿지 |
| `bridge-device-info` | 기기 정보 브릿지 |

### UI Modules
| Module | Description |
|--------|-------------|
| `mantis-snackbar` | MUI Snackbar 컴포넌트 |
| `mantis-loader` | MUI Loader 컴포넌트 |

### Shell
| Module | Description |
|--------|-------------|
| `android-app-shell` | Android WebView 앱 쉘 |

## MCP Tools

### list_modules
사용 가능한 모듈 목록을 조회합니다.

### resolve_dependencies
선택된 모듈들의 의존성을 해결합니다.

### generate_scaffold
프로젝트 구조를 생성합니다.

## Usage Example

Claude와 대화:

```
"대시보드와 사용자 관리 페이지가 있는 관리자 웹앱을 만들어줘"

→ AI가 자동으로:
1. base-mantis-admin + page-dashboard + page-user-management 선택
2. 의존성 해결
3. 프로젝트 생성
```

## Development

```bash
npm run dev          # 개발 모드
npm run build        # 빌드
npm run test         # 테스트
npm run lint         # ESLint
```

## Adding Custom Modules

`modules/` 디렉토리에 새 폴더 생성 후 `module.meta.json` 작성:

```json
{
  "name": "page-my-feature",
  "displayName": "My Feature",
  "version": "1.0.0",
  "category": "page",
  "description": "My custom feature page",
  "platforms": ["web"],
  "dependencies": {
    "modules": ["base-mantis-admin"],
    "npm": {}
  },
  "slots": {
    "web.routes": {
      "path": "my-feature",
      "component": "MyFeaturePage"
    },
    "web.menu": {
      "id": "my-feature",
      "title": "My Feature",
      "type": "item",
      "url": "/my-feature",
      "icon": "StarIcon"
    }
  }
}
```

## License

MIT
