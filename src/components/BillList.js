import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BillList = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, billId: null, billName: '' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/bills`, {
        withCredentials: true
      });
      setBills(response.data);
    } catch (error) {
      showAlert('Error loading bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    if (!searchTerm) {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(bill =>
        bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.invoice_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBills(filtered);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleDelete = async (billId) => {
    try {
      await axios.delete(`${API_BASE_URL}/bills/${billId}`, {
        withCredentials: true
      });
      showAlert('Bill deleted successfully');
      loadBills();
      setDeleteDialog({ open: false, billId: null, billName: '' });
    } catch (error) {
      showAlert('Error deleting bill', 'error');
    }
  };

  const openDeleteDialog = (bill) => {
    setDeleteDialog({
      open: true,
      billId: bill.id,
      billName: `${bill.invoice_no} - ${bill.customer_name}`
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, billId: null, billName: '' });
  };

  const handlePaymentStatusChange = async (billId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/bills/${billId}/payment-status`, {
        payment_status: newStatus,
        notes: newStatus === 'paid' ? 'Payment completed' : 'Payment pending'
      }, {
        withCredentials: true
      });
      
      // Update the local state
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === billId 
            ? { ...bill, payment_status: newStatus }
            : bill
        )
      );
      
      showAlert(`Payment status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating payment status:', error);
      showAlert('Error updating payment status', 'error');
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Bills
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/bills/new')}
            size="large"
          >
            Create New Bill
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search by customer name or invoice number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Bills Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Invoice No.</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Payment Status</strong></TableCell>
                <TableCell><strong>Due Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Loading bills...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>
                      {bills.length === 0 ? 'No bills found. Create your first bill!' : 'No bills match your search.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill) => (
                  <TableRow key={bill.id} hover>
                    <TableCell>{bill.invoice_no}</TableCell>
                    <TableCell>{formatDate(bill.invoice_date)}</TableCell>
                    <TableCell>{bill.customer_name}</TableCell>
                    <TableCell>{formatCurrency(bill.total_amount)}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={bill.payment_status || 'credit'}
                          onChange={(e) => handlePaymentStatusChange(bill.id, e.target.value)}
                          sx={{
                            '& .MuiSelect-select': {
                              py: 0.5,
                              px: 1,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              borderRadius: 1,
                              backgroundColor: bill.payment_status === 'paid' ? 'success.light' : 'warning.light',
                              color: bill.payment_status === 'paid' ? 'success.dark' : 'warning.dark',
                            }
                          }}
                        >
                          <MenuItem value="credit">
                            <Chip
                              label="Credit"
                              color="warning"
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </MenuItem>
                          <MenuItem value="paid">
                            <Chip
                              label="Paid"
                              color="success"
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {bill.due_date ? formatDate(bill.due_date) : '-'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/bills/view/${bill.id}`)}
                          title="View Bill"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => navigate(`/bills/edit/${bill.id}`)}
                          title="Edit Bill"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog(bill)}
                          title="Delete Bill"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the bill "{deleteDialog.billName}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            onClick={() => handleDelete(deleteDialog.billId)}
            color="error"
            variant="contained"
          >
            Delete
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

export default BillList;
