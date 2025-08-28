import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Analytics = () => {
  const [salesSummary, setSalesSummary] = useState({});
  const [dueBills, setDueBills] = useState({});
  const [monthlySales, setMonthlySales] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf('month'),
    end: dayjs().endOf('month')
  });
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    bill: null,
    status: 'paid',
    notes: ''
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const loadAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start.format('YYYY-MM-DD'),
        end_date: dateRange.end.format('YYYY-MM-DD')
      });
      const response = await axios.get(`${API_BASE_URL}/analytics/sales-summary?${params}`, {
        withCredentials: true
      });
      setSalesSummary(response.data);
    } catch (error) {
      showAlert('Error loading sales analytics', 'error');
    }
  }, [dateRange]);

  const loadDueBills = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/due-bills`, {
        withCredentials: true
      });
      setDueBills(response.data);
    } catch (error) {
      showAlert('Error loading due bills', 'error');
    }
  }, []);

  const loadMonthlySales = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/monthly-sales?year=${dayjs().year()}`, {
        withCredentials: true
      });
      setMonthlySales(response.data);
    } catch (error) {
      showAlert('Error loading monthly sales', 'error');
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    loadDueBills();
    loadMonthlySales();
  }, [loadAnalytics, loadDueBills, loadMonthlySales]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleDateRangeUpdate = useCallback(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handlePaymentStatusUpdate = async () => {
    try {
      await axios.put(`${API_BASE_URL}/bills/${paymentDialog.bill.id}/payment-status`, {
        payment_status: paymentDialog.status,
        notes: paymentDialog.notes
      }, {
        withCredentials: true
      });
      showAlert('Payment status updated successfully');
      setPaymentDialog({ open: false, bill: null, status: 'paid', notes: '' });
      loadDueBills();
      loadAnalytics();
    } catch (error) {
      showAlert('Error updating payment status', 'error');
    }
  };

  const openPaymentDialog = (bill) => {
    setPaymentDialog({
      open: true,
      bill,
      status: 'paid',
      notes: ''
    });
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;

  return (
    <Box>
      <Box className="analytics-header" display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.href = '/'}
          sx={{ minWidth: 120, color: 'white', borderColor: 'white' }}
        >
          Back to Home
        </Button>
      </Box>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sales Period
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={(newValue) => setDateRange({ ...dateRange, start: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={(newValue) => setDateRange({ ...dateRange, end: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={handleDateRangeUpdate}
                fullWidth
              >
                Update
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sales Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card className="analytics-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sales
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(salesSummary.total_sales)}
                  </Typography>
                  <Typography variant="body2">
                    {salesSummary.total_bills} bills
                  </Typography>
                </Box>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card className="analytics-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Paid Amount
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(salesSummary.paid_amount)}
                  </Typography>
                  <Typography variant="body2">
                    {salesSummary.paid_bills} bills paid
                  </Typography>
                </Box>
                <AccountBalanceIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card className="analytics-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Credit Amount
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {formatCurrency(salesSummary.credit_amount)}
                  </Typography>
                  <Typography variant="body2">
                    {salesSummary.credit_bills} bills pending
                  </Typography>
                </Box>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card className="analytics-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Due
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {formatCurrency(dueBills.total_due_amount)}
                  </Typography>
                  <Typography variant="body2">
                    {dueBills.overdue_bills_count} overdue
                  </Typography>
                </Box>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Sales Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Sales ({dayjs().year()})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Bills</TableCell>
                  <TableCell align="right">Total Sales</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Credit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlySales.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell>{dayjs(month.month).format('MMMM YYYY')}</TableCell>
                    <TableCell align="right">{month.bill_count}</TableCell>
                    <TableCell align="right">{formatCurrency(month.total_sales)}</TableCell>
                    <TableCell align="right" color="success.main">
                      {formatCurrency(month.paid_amount)}
                    </TableCell>
                    <TableCell align="right" color="warning.main">
                      {formatCurrency(month.credit_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Due Bills Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Due Bills Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice No.</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dueBills.due_bills?.map((bill) => {
                  const isOverdue = bill.days_overdue > 0;
                  return (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.invoice_no}</TableCell>
                      <TableCell>{bill.customer_name}</TableCell>
                      <TableCell>
                        {bill.customer_phone && (
                          <Box display="flex" alignItems="center">
                            <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {bill.customer_phone}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(bill.total_amount)}</TableCell>
                      <TableCell>
                        {bill.due_date ? dayjs(bill.due_date).format('DD/MM/YYYY') : 'No due date'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isOverdue ? `Overdue (${bill.days_overdue} days)` : 'Due'}
                          color={isOverdue ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openPaymentDialog(bill)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Customer Due Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Due Summary
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Bills Count</TableCell>
                  <TableCell align="right">Total Due</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dueBills.customer_summary?.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell>{customer.customer_name}</TableCell>
                    <TableCell>
                      {customer.customer_phone && (
                        <Box display="flex" alignItems="center">
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {customer.customer_phone}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">{customer.bill_count}</TableCell>
                    <TableCell align="right">{formatCurrency(customer.total_due)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Payment Status Update Dialog */}
      <Dialog
        open={paymentDialog.open}
        onClose={() => setPaymentDialog({ ...paymentDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          {paymentDialog.bill && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                Invoice: {paymentDialog.bill.invoice_no}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Customer: {paymentDialog.bill.customer_name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Amount: {formatCurrency(paymentDialog.bill.total_amount)}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentDialog.status}
                  label="Payment Status"
                  onChange={(e) => setPaymentDialog({ ...paymentDialog, status: e.target.value })}
                >
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={paymentDialog.notes}
                onChange={(e) => setPaymentDialog({ ...paymentDialog, notes: e.target.value })}
                placeholder="Payment notes or comments..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog({ ...paymentDialog, open: false })}>
            Cancel
          </Button>
          <Button onClick={handlePaymentStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Analytics;
