import Box from '@mui/material/Box';

// ==============================|| LOGO ||============================== //

export default function Logo() {
  return (
    <Box
      component="svg"
      viewBox="0 0 32 32"
      sx={{
        width: 28,
        height: 28
      }}
    >
      {/* Simple geometric logo */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1890ff" />
          <stop offset="100%" stopColor="#096dd9" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoGradient)" />
      <path
        d="M8 16L14 22L24 10"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Box>
  );
}
