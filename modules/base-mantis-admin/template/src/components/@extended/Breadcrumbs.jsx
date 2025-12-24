import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import menuItems from 'menu-items';

// Icons
import HomeIcon from '@mui/icons-material/Home';

// ==============================|| BREADCRUMBS ||============================== //

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const findBreadcrumb = (items, path, parents = []) => {
      for (const item of items) {
        if (item.url === path) {
          setTitle(item.title);
          setBreadcrumbs([...parents, { title: item.title, url: item.url }]);
          return true;
        }
        if (item.children) {
          const found = findBreadcrumb(item.children, path, [...parents, { title: item.title, url: item.url }]);
          if (found) return true;
        }
      }
      return false;
    };

    // Flatten menu items
    const allItems = menuItems.items.flatMap((group) => group.children || []);
    findBreadcrumb(allItems, pathname);
  }, [pathname]);

  if (breadcrumbs.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <MuiBreadcrumbs aria-label="breadcrumb" separator="›">
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none'
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
          홈
        </Link>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast ? (
            <Typography key={item.url} color="text.primary" sx={{ fontSize: '0.875rem' }}>
              {item.title}
            </Typography>
          ) : (
            <Link
              key={item.url}
              to={item.url}
              style={{
                color: 'inherit',
                textDecoration: 'none'
              }}
            >
              {item.title}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}
