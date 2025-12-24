import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ==============================|| FOOTER ||============================== //

export default function Footer() {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{
        gap: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
        p: '24px 16px 0px',
        mt: 'auto'
      }}
    >
      <Typography variant="caption">
        &copy; {new Date().getFullYear()} Mantis Admin Starter. All rights reserved.
      </Typography>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
        <Link href="#" variant="caption" color="text.primary" underline="hover">
          도움말
        </Link>
        <Link href="#" variant="caption" color="text.primary" underline="hover">
          개인정보처리방침
        </Link>
        <Link href="#" variant="caption" color="text.primary" underline="hover">
          이용약관
        </Link>
      </Stack>
    </Stack>
  );
}
