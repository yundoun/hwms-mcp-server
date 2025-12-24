import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';

import MainCard from 'components/cards/MainCard';

// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import ErrorIcon from '@mui/icons-material/Error';

// ==============================|| ACTIVITY TIMELINE ||============================== //

const activities = [
  {
    id: 1,
    icon: <PersonAddIcon fontSize="small" />,
    color: 'primary',
    title: '새 회원 가입',
    description: 'user@example.com 님이 가입했습니다',
    time: '2분 전'
  },
  {
    id: 2,
    icon: <ShoppingCartIcon fontSize="small" />,
    color: 'success',
    title: '주문 완료',
    description: '주문 #10234가 완료되었습니다',
    time: '15분 전'
  },
  {
    id: 3,
    icon: <CommentIcon fontSize="small" />,
    color: 'info',
    title: '새 리뷰',
    description: '"상품 A"에 새 리뷰가 등록되었습니다',
    time: '32분 전'
  },
  {
    id: 4,
    icon: <StarIcon fontSize="small" />,
    color: 'warning',
    title: '인기 상품',
    description: '"상품 B"가 인기 상품 TOP 10에 진입했습니다',
    time: '1시간 전'
  },
  {
    id: 5,
    icon: <ErrorIcon fontSize="small" />,
    color: 'error',
    title: '결제 실패',
    description: '주문 #10230 결제 처리 실패',
    time: '2시간 전'
  }
];

export default function ActivityTimeline() {
  return (
    <MainCard title="최근 활동">
      <Stack spacing={3}>
        {activities.map((activity, index) => (
          <Box
            key={activity.id}
            sx={{
              display: 'flex',
              gap: 2,
              position: 'relative',
              '&::before': index < activities.length - 1 ? {
                content: '""',
                position: 'absolute',
                left: 18,
                top: 44,
                bottom: -20,
                width: 2,
                bgcolor: 'divider'
              } : {}
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: `${activity.color}.lighter`,
                color: `${activity.color}.main`
              }}
            >
              {activity.icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography variant="subtitle2">{activity.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.description}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.disabled">
                  {activity.time}
                </Typography>
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>
    </MainCard>
  );
}
