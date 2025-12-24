# HWMS MCP Server API Reference

## Overview

HWMS MCP Server는 MCP(Model Context Protocol)를 통해 3개의 도구를 제공합니다.

---

## Tools

### 1. list_modules

사용 가능한 모듈 목록을 조회합니다.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "description": "모듈 카테고리로 필터링 (예: core, media, notification, device)"
    }
  },
  "required": []
}
```

#### Response

```json
{
  "modules": [
    {
      "name": "bridge-camera",
      "displayName": "Camera Bridge",
      "category": "media",
      "description": "Camera access bridge for hybrid apps",
      "platforms": ["web", "ios", "android"]
    }
  ]
}
```

#### Example

```
User: 미디어 관련 모듈을 알려줘
AI: list_modules({ category: "media" })
```

---

### 2. resolve_dependencies

선택된 모듈들의 의존성을 자동으로 해결합니다.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "modules": {
      "type": "array",
      "items": { "type": "string" },
      "description": "선택된 모듈 이름 배열 (예: [\"bridge-camera\", \"bridge-push\"])"
    }
  },
  "required": ["modules"]
}
```

#### Response

```json
{
  "resolvedModules": [
    "core-bridge",
    "bridge-camera",
    "bridge-push"
  ],
  "npmDependencies": {
    "@anthropic/mcp-sdk": "^1.0.0",
    "camera-lib": "^2.0.0"
  },
  "envVariables": [
    {
      "name": "PUSH_API_KEY",
      "description": "Push notification API key",
      "required": true
    }
  ],
  "setupSteps": [
    {
      "platform": "ios",
      "instruction": "Add NSCameraUsageDescription to Info.plist"
    }
  ],
  "conflicts": []
}
```

#### Behavior

1. 선택된 모듈을 로드
2. 각 모듈의 의존 모듈을 재귀적으로 해결
3. NPM 의존성 병합
4. 환경 변수 수집
5. 설정 단계 수집
6. 충돌 검사

---

### 3. generate_scaffold

선택된 모듈들로 프로젝트 구조를 생성합니다.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "projectName": {
      "type": "string",
      "description": "생성할 프로젝트 이름 (예: \"my-hybrid-app\")"
    },
    "modules": {
      "type": "array",
      "items": { "type": "string" },
      "description": "포함할 모듈 이름 배열 (의존성은 자동 해결됨)"
    }
  },
  "required": ["projectName", "modules"]
}
```

#### Response

```json
{
  "projectPath": "/path/to/output/my-hybrid-app",
  "createdFiles": [
    "package.json",
    "README.md",
    "src/index.ts",
    "src/modules/bridge-camera/index.ts"
  ],
  "nextSteps": [
    "cd my-hybrid-app",
    "npm install",
    "Configure environment variables",
    "npm run dev"
  ]
}
```

#### Generated Structure

```
my-hybrid-app/
├── package.json          # 병합된 의존성
├── README.md             # 프로젝트 설명
├── .env.example          # 환경 변수 템플릿
├── src/
│   ├── index.ts          # 엔트리 포인트
│   └── modules/          # 복사된 모듈들
│       ├── core-bridge/
│       └── bridge-camera/
└── docs/
    └── SETUP.md          # 설정 가이드
```

---

## Schemas

### ModuleMeta Schema

모듈 메타데이터 (`module.meta.json`) 스키마:

```typescript
interface ModuleMeta {
  name: string;           // 모듈 이름 (소문자, 하이픈만 허용)
  displayName: string;    // 표시 이름
  version: string;        // 버전 (semver: x.y.z)
  category: Category;     // 카테고리
  description: string;    // 설명 (10자 이상)
  platforms: Platform[];  // 지원 플랫폼
  dependencies: {
    modules: string[];    // 의존 모듈
    npm?: Record<string, string>;  // NPM 의존성
  };
  provides: string[];     // 제공하는 기능
  conflicts: string[];    // 충돌하는 모듈
  envVariables: EnvVariable[];
  setupSteps: SetupStep[];
}

type Category =
  | 'core'
  | 'media'
  | 'notification'
  | 'device'
  | 'storage'
  | 'auth'
  | 'ui'
  | 'util';

type Platform = 'web' | 'ios' | 'android';

interface EnvVariable {
  name: string;
  description: string;
  required: boolean;
  default?: string;
}

interface SetupStep {
  platform: 'web' | 'ios' | 'android' | 'all';
  instruction: string;
}
```

---

## Error Handling

### Error Response Format

```json
{
  "content": [
    {
      "type": "text",
      "text": "오류: 모듈을 찾을 수 없습니다: non-existent-module"
    }
  ],
  "isError": true
}
```

### Common Errors

| Error | Description |
|-------|-------------|
| Module not found | 요청한 모듈이 존재하지 않음 |
| Invalid module name | 모듈 이름 형식이 잘못됨 |
| Dependency conflict | 모듈 간 충돌 발생 |
| Circular dependency | 순환 의존성 감지 |

---

## Validation

모든 입력은 Zod 스키마로 검증됩니다:

```typescript
import { validateModuleMeta, validateModuleList, validateProjectName } from './schemas/moduleSchema';

// 모듈 메타 검증
const meta = validateModuleMeta(jsonData);

// 모듈 리스트 검증
const modules = validateModuleList(['mod-a', 'mod-b']);

// 프로젝트 이름 검증
const name = validateProjectName('my-project');
```

---

## Best Practices

1. **모듈 선택**
   - 필요한 기능만 선택
   - `resolve_dependencies`로 의존성 확인
   - 충돌 여부 확인

2. **프로젝트 생성**
   - 프로젝트 이름은 소문자와 하이픈만 사용
   - 생성 후 환경 변수 설정 필수
   - `nextSteps` 지침 따르기

3. **커스텀 모듈**
   - `module.meta.json` 스키마 준수
   - 버전은 semver 형식
   - 설명은 10자 이상

---

*Last updated: 2025-12-17*
