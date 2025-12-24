import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Icons
import HomeIcon from '@mui/icons-material/Home';

// ==============================|| 404 PAGE ||============================== //

export default function Error404() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        py: 5
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '8rem',
          fontWeight: 700,
          color: 'primary.main',
          lineHeight: 1
        }}
      >
        404
      </Typography>

      <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
        페이지를 찾을 수 없습니다
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. URL을 확인하거나 홈으로 돌아가세요.
      </Typography>

      <Button
        component={RouterLink}
        to="/dashboard"
        variant="contained"
        startIcon={<HomeIcon />}
        size="large"
      >
        홈으로 돌아가기
      </Button>
    </Box>
  );
}
