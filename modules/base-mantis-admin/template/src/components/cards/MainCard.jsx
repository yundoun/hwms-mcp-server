import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// ==============================|| MAIN CARD ||============================== //

const MainCard = forwardRef(
  (
    {
      border = true,
      boxShadow,
      children,
      content = true,
      contentSX = {},
      darkTitle,
      divider = true,
      elevation,
      secondary,
      shadow,
      sx = {},
      title,
      ...others
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        elevation={elevation || 0}
        sx={{
          position: 'relative',
          border: border ? '1px solid' : 'none',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: boxShadow ? shadow || '0 2px 14px 0 rgba(0, 0, 0, 0.08)' : 'none',
          ':hover': {
            boxShadow: boxShadow ? shadow || '0 2px 14px 0 rgba(0, 0, 0, 0.12)' : 'none'
          },
          ...sx
        }}
        {...others}
      >
        {/* Header */}
        {title && (
          <>
            <CardHeader
              sx={{ p: 2.5 }}
              title={
                <Typography variant={darkTitle ? 'h4' : 'h5'} sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
              }
              action={secondary}
            />
            {divider && <Divider />}
          </>
        )}

        {/* Content */}
        {content && <CardContent sx={{ p: 2.5, ...contentSX }}>{children}</CardContent>}
        {!content && children}
      </Card>
    );
  }
);

MainCard.displayName = 'MainCard';

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.node,
  content: PropTypes.bool,
  contentSX: PropTypes.object,
  darkTitle: PropTypes.bool,
  divider: PropTypes.bool,
  elevation: PropTypes.number,
  secondary: PropTypes.node,
  shadow: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

export default MainCard;
