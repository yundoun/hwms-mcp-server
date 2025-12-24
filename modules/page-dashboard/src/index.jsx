import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import MainCard from 'components/cards/MainCard';
import DonutChart from './DonutChart';
import ActivityTimeline from './ActivityTimeline';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MouseIcon from '@mui/icons-material/Mouse';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

// ==============================|| ANALYTICS DASHBOARD ||============================== //

// Different from base dashboard: Uses 2-column hero stats, donut chart, and timeline

const StatCard = ({ title, value, change, isPositive, icon, color }) => (
  <MainCard>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
          {isPositive ? (
            <TrendingUpIcon fontSize="small" color="success" />
          ) : (
            <TrendingDownIcon fontSize="small" color="error" />
          )}
          <Typography
            variant="caption"
            color={isPositive ? 'success.main' : 'error.main'}
          >
            {change}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            vs 지난주
          </Typography>
        </Stack>
      </Box>
      <Avatar
        sx={{
          bgcolor: `${color}.lighter`,
          color: `${color}.main`,
          width: 56,
          height: 56
        }}
      >
        {icon}
      </Avatar>
    </Stack>
  </MainCard>
);

const ProgressCard = ({ title, value, target, color }) => {
  const percentage = Math.round((value / target) * 100);
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {value.toLocaleString()} / {target.toLocaleString()}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
};

export default function AnalyticsDashboard() {
  return (
    <Grid container spacing={3}>
      {/* Row 1: Hero Stats - 2 columns layout (different from base 4-column) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <StatCard
          title="페이지 뷰"
          value="128,450"
          change="+12.5%"
          isPositive={true}
          icon={<VisibilityIcon />}
          color="primary"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <StatCard
          title="클릭률"
          value="3.24%"
          change="-0.8%"
          isPositive={false}
          icon={<MouseIcon />}
          color="warning"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <StatCard
          title="평균 체류시간"
          value="4분 32초"
          change="+18.2%"
          isPositive={true}
          icon={<AccessTimeIcon />}
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <StatCard
          title="신규 방문자"
          value="2,847"
          change="+5.3%"
          isPositive={true}
          icon={<PersonIcon />}
          color="info"
        />
      </Grid>

      {/* Row 2: Donut Chart + Progress (different from base area chart) */}
      <Grid size={{ xs: 12, md: 5 }}>
        <DonutChart />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <MainCard title="월간 목표 달성률">
          <ProgressCard title="페이지 뷰" value={128450} target={150000} color="primary" />
          <ProgressCard title="회원 가입" value={847} target={1000} color="success" />
          <ProgressCard title="전환율" value={324} target={500} color="warning" />
          <ProgressCard title="매출" value={45600000} target={50000000} color="info" />
        </MainCard>
      </Grid>

      {/* Row 3: Activity Timeline + Top Pages (different from base orders/products) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ActivityTimeline />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="인기 페이지">
          <Stack spacing={2}>
            {[
              { page: '/products', views: 45230, change: '+15%' },
              { page: '/checkout', views: 32100, change: '+8%' },
              { page: '/categories', views: 28750, change: '-3%' },
              { page: '/search', views: 21400, change: '+22%' },
              { page: '/account', views: 18920, change: '+5%' }
            ].map((item, index) => (
              <Box
                key={item.page}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: index < 4 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Typography variant="body2">{item.page}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {item.views.toLocaleString()}
                  </Typography>
                  <Chip
                    label={item.change}
                    size="small"
                    color={item.change.startsWith('+') ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
