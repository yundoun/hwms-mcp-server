# 커스터마이징 가이드

이 문서는 mantis-admin-starter를 프로젝트에 맞게 커스터마이징하는 방법을 설명합니다.

## 목차

1. [테마 커스터마이징](#1-테마-커스터마이징)
2. [메뉴 추가/수정](#2-메뉴-추가수정)
3. [새 페이지 추가](#3-새-페이지-추가)
4. [레이아웃 수정](#4-레이아웃-수정)
5. [API 연동](#5-api-연동)

---

## 1. 테마 커스터마이징

### 색상 변경

`src/themes/palette.js`에서 색상을 수정하세요:

```javascript
const presetColors = {
  default: {
    primary: {
      lighter: '#e3f2fd',
      light: '#90caf9',
      main: '#1890ff',  // 메인 색상 변경
      dark: '#1565c0',
      darker: '#0d47a1',
      contrastText: '#fff'
    },
    // ... 다른 색상들
  }
};
```

### 폰트 변경

1. 새 폰트 패키지 설치:
```bash
npm install @fontsource/noto-sans-kr
```

2. `src/index.jsx`에서 import:
```javascript
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/500.css';
import '@fontsource/noto-sans-kr/700.css';
```

3. `src/config/index.js`에서 폰트 설정:
```javascript
const config = {
  fontFamily: `'Noto Sans KR', sans-serif`,
  // ...
};
```

---

## 2. 메뉴 추가/수정

`src/menu-items/index.js`를 수정하세요.

### 새 메뉴 아이템 추가

```javascript
import NewIcon from '@mui/icons-material/NewIcon';

const menuItems = {
  items: [
    // ... 기존 그룹들
    {
      id: 'new-group',
      title: '새 그룹',
      type: 'group',
      children: [
        {
          id: 'new-page',
          title: '새 페이지',
          type: 'item',
          url: '/new-page',
          icon: NewIcon
        }
      ]
    }
  ]
};
```

### 하위 메뉴 추가 (Collapse)

```javascript
{
  id: 'parent-menu',
  title: '상위 메뉴',
  type: 'collapse',
  icon: ParentIcon,
  children: [
    {
      id: 'child-1',
      title: '하위 메뉴 1',
      type: 'item',
      url: '/parent/child-1'
    },
    {
      id: 'child-2',
      title: '하위 메뉴 2',
      type: 'item',
      url: '/parent/child-2'
    }
  ]
}
```

---

## 3. 새 페이지 추가

### 단계 1: 페이지 컴포넌트 생성

`src/pages/users/List.jsx`:

```jsx
import MainCard from 'components/cards/MainCard';

export default function UserList() {
  return (
    <MainCard title="사용자 목록">
      {/* 페이지 내용 */}
    </MainCard>
  );
}
```

### 단계 2: 라우트 추가

`src/routes/index.jsx`:

```javascript
const UserList = lazy(() => import('pages/users/List'));
const UserListPage = Loadable(UserList);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // ... 기존 라우트들
      {
        path: 'users',
        children: [
          { path: 'list', element: <UserListPage /> }
        ]
      }
    ]
  }
]);
```

### 단계 3: 메뉴 추가

`src/menu-items/index.js`에 메뉴 아이템 추가 (위 섹션 참조)

---

## 4. 레이아웃 수정

### 사이드바 너비 변경

`src/config/index.js`:

```javascript
export const DRAWER_WIDTH = 280;      // 기본 너비
export const MINI_DRAWER_WIDTH = 80;  // 접힌 상태 너비
```

### 헤더 수정

`src/layout/MainLayout/Header/HeaderContent.jsx`를 수정하세요.

예: 검색 기능 추가

```jsx
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

export default function HeaderContent() {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {/* 검색 */}
      <TextField
        size="small"
        placeholder="검색..."
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1 }} />
        }}
      />

      {/* ... 기존 컴포넌트들 */}
    </Stack>
  );
}
```

---

## 5. API 연동

### Axios 설정

`src/utils/axios.js`에서 기본 URL과 인터셉터를 설정합니다.

### API 호출 예시

```javascript
import axios from 'utils/axios';

// GET
const fetchUsers = async () => {
  const response = await axios.get('/users');
  return response.data;
};

// POST
const createUser = async (data) => {
  const response = await axios.post('/users', data);
  return response.data;
};

// PUT
const updateUser = async (id, data) => {
  const response = await axios.put(`/users/${id}`, data);
  return response.data;
};

// DELETE
const deleteUser = async (id) => {
  await axios.delete(`/users/${id}`);
};
```

### 인증 연동

1. 로그인 성공 시 토큰 저장:
```javascript
localStorage.setItem('accessToken', response.data.token);
```

2. axios 인터셉터가 자동으로 토큰을 헤더에 추가합니다.

3. 401 응답 시 자동으로 로그인 페이지로 리다이렉트됩니다.

---

## 팁

### 빌드 최적화

- 사용하지 않는 아이콘은 import하지 마세요
- 큰 라이브러리는 lazy loading을 사용하세요

### 코드 스타일

```bash
# 포맷팅
npm run format

# 린팅
npm run lint
```

### 디버깅

React DevTools와 함께 사용하면 상태 디버깅이 쉬워집니다:
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)

---

문의사항이 있으시면 이슈를 등록해주세요.
