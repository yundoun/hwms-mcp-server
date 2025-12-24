# Mantis Admin Starter

Mantis 풀버전에서 핵심만 추출한 경량 관리자 템플릿입니다.

## 빠른 시작

```bash
# 1. Clone
git clone https://github.com/your-org/mantis-admin-starter.git my-admin

# 2. Install
cd my-admin
npm install

# 3. Start
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속하세요.

## 기능

### 포함된 기능

| 기능 | 설명 |
|------|------|
| **MUI 테마 시스템** | Light/Dark 모드, 색상 커스터마이징 |
| **사이드바 레이아웃** | 접기/펴기, 메뉴 그룹화 |
| **헤더** | 사용자 메뉴, 알림, 테마 전환 |
| **로그인/회원가입** | 기본 인증 UI |
| **대시보드** | 통계 카드 + 차트 |
| **샘플 CRUD 페이지** | 목록/생성/수정 템플릿 |
| **라우팅 구조** | React Router 7 기반 |
| **반응형 디자인** | 모바일 대응 |

### 제외된 기능 (Full Version에만)

- 모든 컴포넌트 데모
- Firebase/Supabase 연동
- i18n 다국어
- 고급 차트
- Kanban, Calendar, Chat 앱

## 프로젝트 구조

```
src/
├── assets/              # 정적 자원
├── components/          # 공통 컴포넌트
│   ├── @extended/       # 확장 컴포넌트
│   ├── cards/           # 카드 컴포넌트
│   ├── Loader/          # 로딩 컴포넌트
│   └── Logo/            # 로고 컴포넌트
├── config/              # 앱 설정
├── contexts/            # React Context
├── hooks/               # 커스텀 훅
├── layout/              # 레이아웃 컴포넌트
│   ├── MainLayout/      # 메인 레이아웃
│   └── MinimalLayout/   # 최소 레이아웃 (로그인)
├── menu-items/          # 사이드바 메뉴 정의
├── pages/               # 페이지 컴포넌트
│   ├── auth/            # 인증 페이지
│   ├── dashboard/       # 대시보드
│   ├── error/           # 에러 페이지
│   └── sample/          # 샘플 CRUD
├── routes/              # 라우트 정의
├── themes/              # MUI 테마
└── utils/               # 유틸리티
```

## 스크립트

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
npm run lint     # ESLint 실행
npm run format   # Prettier 포맷팅
```

## 환경 변수

`.env.example`을 `.env`로 복사하고 설정하세요:

```env
VITE_APP_BASE_NAME=
VITE_API_URL=http://localhost:8080/api
VITE_APP_VERSION=1.0.0
```

## 기술 스택

- **Framework:** React 19 + Vite 6
- **UI Library:** MUI 7
- **Routing:** React Router 7
- **Form:** Formik + Yup
- **Charts:** ApexCharts
- **State:** React Context

## 커스터마이징

자세한 커스터마이징 가이드는 [CUSTOMIZATION.md](./CUSTOMIZATION.md)를 참조하세요.

## 라이선스

MIT License
