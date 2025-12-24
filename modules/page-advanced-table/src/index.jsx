import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import MainCard from 'components/cards/MainCard';

// Icons
import SearchIcon from '@mui/icons-material/Search';

// ==============================|| ADVANCED TABLE PAGE ||============================== //

// Sample data
const initialRows = [
  { id: 1, name: '김철수', email: 'kim@example.com', department: '개발팀', role: '시니어 개발자', status: '활성', joinDate: '2023-01-15' },
  { id: 2, name: '이영희', email: 'lee@example.com', department: '마케팅팀', role: '팀장', status: '활성', joinDate: '2022-03-20' },
  { id: 3, name: '박민수', email: 'park@example.com', department: '개발팀', role: '주니어 개발자', status: '휴직', joinDate: '2024-02-01' },
  { id: 4, name: '정수진', email: 'jung@example.com', department: '디자인팀', role: 'UI 디자이너', status: '활성', joinDate: '2023-06-10' },
  { id: 5, name: '최동훈', email: 'choi@example.com', department: '인사팀', role: '매니저', status: '활성', joinDate: '2021-11-05' },
  { id: 6, name: '강미영', email: 'kang@example.com', department: '개발팀', role: '프론트엔드 개발자', status: '활성', joinDate: '2023-09-15' },
  { id: 7, name: '윤재호', email: 'yoon@example.com', department: '마케팅팀', role: '콘텐츠 마케터', status: '비활성', joinDate: '2022-07-22' },
  { id: 8, name: '임서연', email: 'lim@example.com', department: '디자인팀', role: 'UX 디자이너', status: '활성', joinDate: '2023-04-18' },
  { id: 9, name: '한지민', email: 'han@example.com', department: '개발팀', role: '백엔드 개발자', status: '활성', joinDate: '2024-01-08' },
  { id: 10, name: '오승현', email: 'oh@example.com', department: '인사팀', role: '채용 담당자', status: '활성', joinDate: '2023-08-25' }
];

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: '이름', width: 120, editable: true },
  { field: 'email', headerName: '이메일', width: 200 },
  { field: 'department', headerName: '부서', width: 120 },
  { field: 'role', headerName: '직책', width: 150 },
  {
    field: 'status',
    headerName: '상태',
    width: 100,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color={
          params.value === '활성' ? 'success' :
          params.value === '휴직' ? 'warning' : 'default'
        }
        variant="outlined"
      />
    )
  },
  { field: 'joinDate', headerName: '입사일', width: 120 }
];

export default function AdvancedTablePage() {
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0
  });

  const departments = ['전체', '개발팀', '마케팅팀', '디자인팀', '인사팀'];
  const statuses = ['전체', '활성', '휴직', '비활성'];

  const filteredRows = useMemo(() => {
    return initialRows.filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.email.toLowerCase().includes(searchText.toLowerCase()) ||
        row.role.toLowerCase().includes(searchText.toLowerCase());

      const matchesDepartment =
        departmentFilter === '전체' || row.department === departmentFilter;

      const matchesStatus =
        statusFilter === '전체' || row.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [searchText, departmentFilter, statusFilter]);

  return (
    <MainCard title="직원 관리">
      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="이름, 이메일, 직책 검색..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>부서</InputLabel>
          <Select
            value={departmentFilter}
            label="부서"
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>상태</InputLabel>
          <Select
            value={statusFilter}
            label="상태"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* DataGrid */}
      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
              printOptions: { disableToolbarButton: true }
            }
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          autoHeight
        />
      </Box>
    </MainCard>
  );
}
