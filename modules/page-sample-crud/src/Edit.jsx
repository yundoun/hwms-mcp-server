import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

import MainCard from 'components/cards/MainCard';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Sample data for demo
const sampleData = {
  1: { id: 1, name: '상품 A', category: '전자제품', price: 150000, description: '고품질 전자제품입니다.', isActive: true },
  2: { id: 2, name: '상품 B', category: '의류', price: 45000, description: '편안한 의류입니다.', isActive: true },
  3: { id: 3, name: '상품 C', category: '식품', price: 8900, description: '신선한 식품입니다.', isActive: false }
};

// ==============================|| SAMPLE EDIT PAGE ||============================== //

export default function SampleEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    // Demo: Load sample data
    const data = sampleData[id] || {};
    setFormData({
      name: data.name || '',
      category: data.category || '',
      price: data.price || '',
      description: data.description || '',
      isActive: data.isActive ?? true
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo: Save and redirect to list
    console.log('Update:', { id, ...formData });
    navigate('/sample/list');
  };

  return (
    <form onSubmit={handleSubmit}>
      <MainCard
        title={`상품 수정 #${id}`}
        secondary={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/sample/list')}
            >
              목록
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              저장
            </Button>
          </Stack>
        }
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="상품명"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="상품명을 입력하세요"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>카테고리</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="카테고리"
              >
                <MenuItem value="전자제품">전자제품</MenuItem>
                <MenuItem value="의류">의류</MenuItem>
                <MenuItem value="식품">식품</MenuItem>
                <MenuItem value="가구">가구</MenuItem>
                <MenuItem value="기타">기타</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="가격"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              slotProps={{
                input: {
                  startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>₩</Box>
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange}
                  name="isActive"
                />
              }
              label="활성 상태"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="설명"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="상품 설명을 입력하세요"
            />
          </Grid>
        </Grid>
      </MainCard>
    </form>
  );
}
