import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useTheme, alpha } from '@mui/material/styles';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// ==============================|| REGISTER V2 PAGE - WITH TERMS & PROFILE ||============================== //

// Different from base: Includes terms expansion, password strength, profile fields

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
  return strength;
};

const getStrengthLabel = (strength) => {
  if (strength === 0) return { label: '', color: 'grey' };
  if (strength <= 25) return { label: '약함', color: 'error' };
  if (strength <= 50) return { label: '보통', color: 'warning' };
  if (strength <= 75) return { label: '강함', color: 'info' };
  return { label: '매우 강함', color: 'success' };
};

export default function RegisterV2Page() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false
  });
  const [errors, setErrors] = useState({});

  const passwordStrength = calculatePasswordStrength(formData.password);
  const strengthInfo = getStrengthLabel(passwordStrength);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요';
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    if (!formData.termsAgreed) newErrors.termsAgreed = '이용약관에 동의해주세요';
    if (!formData.privacyAgreed) newErrors.privacyAgreed = '개인정보 처리방침에 동의해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Register:', formData);
      navigate('/auth/login-v2');
    }
  };

  const handleAllAgree = (e) => {
    const checked = e.target.checked;
    setFormData({
      ...formData,
      termsAgreed: checked,
      privacyAgreed: checked,
      marketingAgreed: checked
    });
  };

  const allAgreed = formData.termsAgreed && formData.privacyAgreed && formData.marketingAgreed;

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
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
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
          <PersonAddIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          함께 시작하세요
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.9, maxWidth: 400 }}>
          간단한 회원가입으로 모든 기능을 이용할 수 있습니다.
          빠르고 안전한 서비스를 경험해보세요.
        </Typography>
        <Stack spacing={2} sx={{ mt: 6 }}>
          {['간편한 회원가입', '안전한 데이터 보호', '다양한 기능 제공'].map((item, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2">{item}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Right Side - Register Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          overflowY: 'auto'
        }}
      >
        <Card sx={{ maxWidth: 480, width: '100%', boxShadow: { xs: 0, md: 3 } }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              회원가입
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              새 계정을 만들어 시작하세요
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {/* Basic Info */}
                <TextField
                  fullWidth
                  label="이름"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />

                <TextField
                  fullWidth
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />

                <TextField
                  fullWidth
                  label="닉네임 (선택)"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="서비스에서 사용할 닉네임"
                />

                {/* Password with strength indicator */}
                <Box>
                  <TextField
                    fullWidth
                    label="비밀번호"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
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
                  {formData.password && (
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          비밀번호 강도
                        </Typography>
                        <Typography variant="caption" color={`${strengthInfo.color}.main`}>
                          {strengthInfo.label}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength}
                        color={strengthInfo.color}
                        sx={{ height: 4, borderRadius: 1 }}
                      />
                    </Box>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="비밀번호 확인"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  required
                />

                <Divider sx={{ my: 1 }} />

                {/* Terms Agreement Section */}
                <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allAgreed}
                        onChange={handleAllAgree}
                        indeterminate={!allAgreed && (formData.termsAgreed || formData.privacyAgreed || formData.marketingAgreed)}
                      />
                    }
                    label={<Typography variant="subtitle2">전체 동의</Typography>}
                  />
                  <Button
                    size="small"
                    onClick={() => setTermsExpanded(!termsExpanded)}
                    endIcon={termsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ ml: 2 }}
                  >
                    {termsExpanded ? '접기' : '펼치기'}
                  </Button>

                  <Collapse in={termsExpanded}>
                    <Stack sx={{ pl: 3, mt: 1 }} spacing={0.5}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="termsAgreed"
                            checked={formData.termsAgreed}
                            onChange={handleChange}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">[필수] 이용약관 동의</Typography>}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="privacyAgreed"
                            checked={formData.privacyAgreed}
                            onChange={handleChange}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">[필수] 개인정보 처리방침 동의</Typography>}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="marketingAgreed"
                            checked={formData.marketingAgreed}
                            onChange={handleChange}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">[선택] 마케팅 정보 수신 동의</Typography>}
                      />
                    </Stack>
                  </Collapse>

                  {(errors.termsAgreed || errors.privacyAgreed) && (
                    <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                      필수 약관에 동의해주세요
                    </Alert>
                  )}
                </Box>

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{ py: 1.5, mt: 1 }}
                >
                  회원가입
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              이미 계정이 있으신가요?{' '}
              <Link component={RouterLink} to="/auth/login-v2" underline="hover" fontWeight={600}>
                로그인
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
