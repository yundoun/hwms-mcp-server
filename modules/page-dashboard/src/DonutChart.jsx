import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import MainCard from 'components/cards/MainCard';
import ReactApexChart from 'react-apexcharts';

// ==============================|| DONUT CHART ||============================== //

export default function DonutChart() {
  const theme = useTheme();

  const chartOptions = {
    chart: {
      type: 'donut',
      background: 'transparent'
    },
    labels: ['직접 방문', '검색 유입', '소셜 미디어', '이메일', '기타'],
    colors: [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.grey[400]
    ],
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: theme.palette.text.secondary
      }
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              color: theme.palette.text.secondary
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 600,
              color: theme.palette.text.primary
            },
            total: {
              show: true,
              label: '총 방문자',
              fontSize: '12px',
              color: theme.palette.text.secondary,
              formatter: () => '128,450'
            }
          }
        }
      }
    },
    stroke: {
      width: 0
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 280
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  const series = [35, 28, 20, 12, 5];

  return (
    <MainCard title="트래픽 소스">
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ReactApexChart
          options={chartOptions}
          series={series}
          type="donut"
          height={320}
        />
      </Box>
    </MainCard>
  );
}
