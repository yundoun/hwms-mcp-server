import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import MainCard from 'components/cards/MainCard';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

// Sample Data
const initialData = [
  { id: 1, name: '상품 A', category: '전자제품', price: 150000, status: 'active', createdAt: '2025-01-01' },
  { id: 2, name: '상품 B', category: '의류', price: 45000, status: 'active', createdAt: '2025-01-02' },
  { id: 3, name: '상품 C', category: '식품', price: 8900, status: 'inactive', createdAt: '2025-01-03' },
  { id: 4, name: '상품 D', category: '전자제품', price: 280000, status: 'active', createdAt: '2025-01-04' },
  { id: 5, name: '상품 E', category: '가구', price: 520000, status: 'active', createdAt: '2025-01-05' },
  { id: 6, name: '상품 F', category: '의류', price: 32000, status: 'inactive', createdAt: '2025-01-06' },
  { id: 7, name: '상품 G', category: '식품', price: 12500, status: 'active', createdAt: '2025-01-07' },
  { id: 8, name: '상품 H', category: '전자제품', price: 89000, status: 'active', createdAt: '2025-01-08' }
];

// ==============================|| SAMPLE LIST PAGE ||============================== //

export default function SampleList() {
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  return (
    <MainCard
      title="상품 목록"
      secondary={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/sample/create')}
        >
          상품 추가
        </Button>
      }
    >
      <Stack spacing={2}>
        {/* Search */}
        <TextField
          size="small"
          placeholder="검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }
          }}
          sx={{ maxWidth: 300 }}
        />

        {/* Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>상품명</TableCell>
                <TableCell>카테고리</TableCell>
                <TableCell align="right">가격</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>등록일</TableCell>
                <TableCell align="center">액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell align="right">
                      ₩{row.price.toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status === 'active' ? '활성' : '비활성'}
                        color={row.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="수정">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/sample/edit/${row.id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(row.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="페이지당 행:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Stack>
    </MainCard>
  );
}
