import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import AppleIcon from '@mui/icons-material/Apple';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// ==============================|| LOGIN V2 PAGE - SPLIT LAYOUT WITH SOCIAL ||============================== //

// Different from base: Split layout + Social login buttons

export default function LoginV2Page() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'background.default'
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: 6
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.common.white, 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          환영합니다
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.9, maxWidth: 400 }}>
          안전하고 빠른 로그인으로 서비스를 이용해보세요.
          다양한 소셜 계정으로도 로그인할 수 있습니다.
        </Typography>
        <Box sx={{ mt: 6 }}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'common.white', opacity: 0.5 }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'common.white' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'common.white', opacity: 0.5 }} />
          </Stack>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4
        }}
      >
        <Card sx={{ maxWidth: 420, width: '100%', boxShadow: { xs: 0, md: 3 } }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              로그인
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              계속하려면 로그인해주세요
            </Typography>

            {/* Social Login Buttons */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleSocialLogin('Google')}
                sx={{ py: 1.2, borderColor: 'divider', color: 'text.primary' }}
              >
                Google로 계속하기
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                onClick={() => handleSocialLogin('GitHub')}
                sx={{ py: 1.2, borderColor: 'divider', color: 'text.primary' }}
              >
                GitHub로 계속하기
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AppleIcon />}
                onClick={() => handleSocialLogin('Apple')}
                sx={{ py: 1.2, borderColor: 'divider', color: 'text.primary' }}
              >
                Apple로 계속하기
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                또는 이메일로 로그인
              </Typography>
            </Divider>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  size="medium"
                />

                <TextField
                  fullWidth
                  label="비밀번호"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  size="medium"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">로그인 유지</Typography>}
                  />
                  <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                    비밀번호 찾기
                  </Link>
                </Box>

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{ py: 1.5, mt: 1 }}
                >
                  로그인
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              계정이 없으신가요?{' '}
              <Link component={RouterLink} to="/register" underline="hover" fontWeight={600}>
                회원가입
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
