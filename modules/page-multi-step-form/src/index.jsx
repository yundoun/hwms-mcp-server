import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import MainCard from 'components/cards/MainCard';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ==============================|| MULTI-STEP FORM PAGE ||============================== //

const steps = ['기본 정보', '상세 정보', '약관 동의', '확인'];

const initialFormData = {
  // Step 1: Basic Info
  name: '',
  email: '',
  phone: '',
  // Step 2: Details
  company: '',
  department: '',
  position: '',
  // Step 3: Agreement
  termsAgreed: false,
  privacyAgreed: false,
  marketingAgreed: false,
  // Plan
  plan: 'basic'
};

export default function MultiStepFormPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요';
        if (!formData.email.trim()) {
          newErrors.email = '이메일을 입력해주세요';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = '올바른 이메일 형식이 아닙니다';
        }
        if (!formData.phone.trim()) newErrors.phone = '연락처를 입력해주세요';
        break;
      case 1:
        if (!formData.company.trim()) newErrors.company = '회사명을 입력해주세요';
        break;
      case 2:
        if (!formData.termsAgreed) newErrors.termsAgreed = '이용약관에 동의해주세요';
        if (!formData.privacyAgreed) newErrors.privacyAgreed = '개인정보 처리방침에 동의해주세요';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Reset form
    setFormData(initialFormData);
    setActiveStep(0);
    alert('신청이 완료되었습니다!');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="연락처"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="010-0000-0000"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="회사명"
                name="company"
                value={formData.company}
                onChange={handleChange}
                error={!!errors.company}
                helperText={errors.company}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="부서"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="직책"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>요금제 선택</Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  row
                >
                  <FormControlLabel value="basic" control={<Radio />} label="Basic (무료)" />
                  <FormControlLabel value="pro" control={<Radio />} label="Pro (월 29,000원)" />
                  <FormControlLabel value="enterprise" control={<Radio />} label="Enterprise (문의)" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                />
              }
              label={
                <Typography variant="body2">
                  [필수] 이용약관에 동의합니다
                </Typography>
              }
            />
            {errors.termsAgreed && (
              <Alert severity="error" sx={{ py: 0 }}>{errors.termsAgreed}</Alert>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  name="privacyAgreed"
                  checked={formData.privacyAgreed}
                  onChange={handleChange}
                />
              }
              label={
                <Typography variant="body2">
                  [필수] 개인정보 처리방침에 동의합니다
                </Typography>
              }
            />
            {errors.privacyAgreed && (
              <Alert severity="error" sx={{ py: 0 }}>{errors.privacyAgreed}</Alert>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  name="marketingAgreed"
                  checked={formData.marketingAgreed}
                  onChange={handleChange}
                />
              }
              label={
                <Typography variant="body2">
                  [선택] 마케팅 정보 수신에 동의합니다
                </Typography>
              }
            />
          </Stack>
        );

      case 3:
        return (
          <Box>
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
              모든 정보가 입력되었습니다. 아래 내용을 확인해주세요.
            </Alert>

            <Stack spacing={2} divider={<Divider />}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">기본 정보</Typography>
                <Typography>이름: {formData.name}</Typography>
                <Typography>이메일: {formData.email}</Typography>
                <Typography>연락처: {formData.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">상세 정보</Typography>
                <Typography>회사: {formData.company}</Typography>
                <Typography>부서: {formData.department || '-'}</Typography>
                <Typography>직책: {formData.position || '-'}</Typography>
                <Typography>
                  요금제: {formData.plan === 'basic' ? 'Basic' : formData.plan === 'pro' ? 'Pro' : 'Enterprise'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">동의 항목</Typography>
                <Typography>이용약관: 동의함</Typography>
                <Typography>개인정보 처리방침: 동의함</Typography>
                <Typography>마케팅 수신: {formData.marketingAgreed ? '동의함' : '동의안함'}</Typography>
              </Box>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <MainCard title="서비스 신청">
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 300 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          이전
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit}>
            제출
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            다음
          </Button>
        )}
      </Box>
    </MainCard>
  );
}
