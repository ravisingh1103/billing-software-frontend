import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Paper,
  Container,
  Chip,
  Divider
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBills: 0,
    totalSales: 0,
    paidAmount: 0,
    creditAmount: 0,
    dueBills: 0,
    overdueAmount: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load basic sales summary
      const salesResponse = await axios.get(`${API_BASE_URL}/analytics/sales-summary`, {
        withCredentials: true
      });
      
      // Load due bills info
      const dueResponse = await axios.get(`${API_BASE_URL}/analytics/due-bills`, {
        withCredentials: true
      });
      
      setStats({
        totalBills: salesResponse.data.total_bills || 0,
        totalSales: salesResponse.data.total_sales || 0,
        paidAmount: salesResponse.data.paid_amount || 0,
        creditAmount: salesResponse.data.credit_amount || 0,
        dueBills: dueResponse.data.total_due_bills || 0,
        overdueAmount: dueResponse.data.total_due_amount || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;

  const menuItems = [
    {
      title: 'View All Bills',
      description: 'View, edit and manage all your bills',
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      path: '/bills',
      stats: `${stats.totalBills} Bills`
    },
    {
      title: 'Create New Bill',
      description: 'Generate a new bill for your customer',
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      path: '/bills/new',
      stats: 'Quick Action'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View sales analytics and business insights',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      path: '/analytics',
      stats: formatCurrency(stats.totalSales)
    },
    {
      title: 'Manage Items',
      description: 'Add and manage predefined items',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      path: '/bills?manage-items=true',
      stats: 'Item Library'
    }
  ];

  const statsCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(stats.totalSales),
      subtext: `${stats.totalBills} bills`,
      icon: <TrendingUpIcon sx={{ fontSize: 30 }} />,
      color: 'primary'
    },
    {
      title: 'Paid Amount',
      value: formatCurrency(stats.paidAmount),
      subtext: 'Collected',
      icon: <AccountBalanceIcon sx={{ fontSize: 30 }} />,
      color: 'success'
    },
    {
      title: 'Credit Amount',
      value: formatCurrency(stats.creditAmount),
      subtext: 'Pending',
      icon: <WarningIcon sx={{ fontSize: 30 }} />,
      color: 'warning'
    },
    {
      title: 'Due Bills',
      value: stats.dueBills.toString(),
      subtext: formatCurrency(stats.overdueAmount),
      icon: <PeopleIcon sx={{ fontSize: 30 }} />,
      color: 'error'
    }
  ];

  return (
    <Box className="homepage-container">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box className="homepage-header fade-in-up">
            <Typography className="homepage-title" component="h1">
              Raj Groups
            </Typography>
            <Typography className="homepage-subtitle">
              Billing Software Dashboard
            </Typography>
            <Typography className="homepage-description">
              Manage your business operations from one central location
            </Typography>
          </Box>

          {/* Quick Stats */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }} className="stats-card fade-in-up">
            <Typography variant="h6" gutterBottom>
              Business Overview
            </Typography>
            <Grid container spacing={3}>
              {statsCards.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card variant="outlined" className="stats-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" variant="body2">
                            {stat.title}
                          </Typography>
                          <Typography variant="h6" component="div">
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.subtext}
                          </Typography>
                        </Box>
                        <Box color={`${stat.color}.main`}>
                          {stat.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Divider sx={{ my: 4 }} />

          {/* Main Menu Tiles */}
          <Typography variant="h5" component="h2" gutterBottom textAlign="center" sx={{ color: 'white' }}>
            Main Menu
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} textAlign="center" mb={4}>
            Choose an option to get started
          </Typography>

          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  elevation={3} 
                  className="menu-tile fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <CardActionArea 
                    onClick={() => navigate(item.path)}
                    sx={{ height: '100%', p: 2 }}
                  >
                    <CardContent sx={{ textAlign: 'center', height: '100%' }}>
                      <Box 
                        display="flex" 
                        flexDirection="column" 
                        alignItems="center" 
                        height="100%"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Box color={`${item.color}.main`} mb={2} className="menu-tile-icon">
                            {item.icon}
                          </Box>
                          <Typography className="menu-tile-title" component="h3" gutterBottom>
                            {item.title}
                          </Typography>
                          <Typography className="menu-tile-description" mb={2}>
                            {item.description}
                          </Typography>
                        </Box>
                        <Chip 
                          label={item.stats} 
                          color={item.color} 
                          variant="outlined"
                          size="small"
                          className="menu-tile-stats"
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Footer Info */}
          <Box textAlign="center" mt={6} py={3}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              B41 Sector 22, Gida Gorakhpur, Gorakhpur, Uttar Pradesh - 273403
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              GSTIN: 09AVOPS3497E1ZV | Contact: 9455617274
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
