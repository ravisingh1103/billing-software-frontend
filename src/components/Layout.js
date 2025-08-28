import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ 
        mb: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <Toolbar>
          <Box
            component="img"
            sx={{
              height: 40,
              width: 40,
              mr: 2,
              cursor: 'pointer',
              borderRadius: 1
            }}
            alt="Raj Groups Logo"
            src="/logo.jpeg"
            onClick={() => navigate('/')}
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Raj Groups - Billing Software
          </Typography>
          
          {/* Show Home button only if not on homepage */}
          {location.pathname !== '/' && location.pathname !== '/home' && (
            <Button 
              color="inherit" 
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
              variant="outlined"
            >
              Home
            </Button>
          )}
          
          {/* User Menu */}
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1 }}>
              Welcome, {user?.full_name || user?.username}
            </Typography>
            <IconButton
              className="account-icon-button"
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{
                color: '#ffffff !important',
                backgroundColor: '#ffffff !important',
                border: '3px solid #ffffff !important',
                borderRadius: '50%',
                width: 48,
                height: 48,
                '&:hover': {
                  backgroundColor: '#f0f0f0 !important',
                  border: '3px solid #ffffff !important',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              <AccountCircleIcon sx={{ 
                fontSize: 32,
                color: '#667eea !important'
              }} />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.contrastText'
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1.5,
                  px: 2
                }}
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default Layout;
