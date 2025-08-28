import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BillView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => {
    loadBill();
  }, [id]);

  const loadBill = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/bills/${id}`, {
        withCredentials: true
      });
      setBill(response.data);
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error loading bill',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Change document title temporarily for printing
    const originalTitle = document.title;
    document.title = `Invoice-${bill?.invoice_no || 'Bill'}-RajGroups`;
    
    // Add a class to body for print-specific styling
    document.body.classList.add('printing');
    
    // Use setTimeout to ensure DOM changes are applied
    setTimeout(() => {
      window.print();
      
      // Clean up after print dialog closes
      const cleanup = () => {
        document.title = originalTitle;
        document.body.classList.remove('printing');
      };
      
      // Listen for afterprint event
      window.addEventListener('afterprint', cleanup, { once: true });
      
      // Fallback cleanup after 2 seconds
      setTimeout(cleanup, 2000);
    }, 100);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading bill...</Typography>
      </Box>
    );
  }

  if (!bill) {
    return (
      <Box>
        <Alert severity="error">Bill not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with actions - hidden in print */}
            <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        className="no-print"
        sx={{ '@media print': { display: 'none' } }}
      >
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/bills')}
          >
            Back to Bills
          </Button>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/bills/edit/${id}`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Bill Content */}
      <Paper 
        elevation={3} 
        className="print-content"
        sx={{ 
          p: 4,
          '@media print': {
            boxShadow: 'none',
            padding: 2
          }
        }}
      >
        {/* Company Header */}
        <Box display="flex" alignItems="center" justifyContent="center" gap={3} mb={4}>
          <Box
            component="img"
            sx={{
              height: 80,
              width: 80,
              borderRadius: 1,
              '@media print': {
                height: 60,
                width: 60
              }
            }}
            alt="Raj Groups Logo"
            src="/logo.jpeg"
          />
          <Box textAlign="center">
            <Typography variant="h4" component="h1" fontWeight="bold">
              Raj Groups
            </Typography>
            <Typography variant="body1">
              B41 Sector 22, Gida Gorakhpur, Gorakhpur, Uttar Pradesh - 273403
            </Typography>
            <Typography variant="body1">
              GSTIN: 09AVOPS3497E1ZV | Contact: 9455617274
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Invoice Header */}
        <Typography variant="h5" textAlign="center" mb={3} fontWeight="bold">
          TAX INVOICE
        </Typography>

        {/* Customer & Invoice Details */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Bill To:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {bill.customer_name}
            </Typography>
            {bill.customer_address && (
              <Typography variant="body2">
                {bill.customer_address}
              </Typography>
            )}
            {bill.customer_phone && (
              <Typography variant="body2">
                Phone: {bill.customer_phone}
              </Typography>
            )}
            {bill.customer_gst && (
              <Typography variant="body2">
                GSTIN: {bill.customer_gst}
              </Typography>
            )}
            {bill.place_of_supply && (
              <Typography variant="body2">
                Place of Supply: {bill.place_of_supply}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">Invoice No:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{bill.invoice_no}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">Invoice Date:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{formatDate(bill.invoice_date)}</Typography>
                </Grid>
                {bill.due_date && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">Due Date:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formatDate(bill.due_date)}</Typography>
                    </Grid>
                  </>
                )}
                {bill.transport && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">Transport:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{bill.transport}</Typography>
                    </Grid>
                  </>
                )}
                {bill.vehicle_number && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">Vehicle No:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{bill.vehicle_number}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Items Table */}
        <TableContainer 
          sx={{ 
            mb: 3,
            '@media print': {
              overflow: 'visible !important',
              maxHeight: 'none !important',
              height: 'auto !important'
            }
          }}
        >
          <Table 
            size="small"
            sx={{
              '@media print': {
                overflow: 'visible !important'
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell><strong>Sr. No.</strong></TableCell>
                <TableCell><strong>Name of Product/Service</strong></TableCell>
                <TableCell><strong>HSN/SAC</strong></TableCell>
                <TableCell align="right"><strong>Qty</strong></TableCell>
                <TableCell align="right"><strong>Rate</strong></TableCell>
                <TableCell align="right"><strong>Taxable Value</strong></TableCell>
                <TableCell align="right"><strong>CGST %</strong></TableCell>
                <TableCell align="right"><strong>CGST Amt</strong></TableCell>
                <TableCell align="right"><strong>SGST %</strong></TableCell>
                <TableCell align="right"><strong>SGST Amt</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.hsn}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">{formatCurrency(item.rate)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.taxable_value)}</TableCell>
                  <TableCell align="right">{item.cgst_percent}%</TableCell>
                  <TableCell align="right">{formatCurrency(item.cgst_amount)}</TableCell>
                  <TableCell align="right">{item.sgst_percent}%</TableCell>
                  <TableCell align="right">{formatCurrency(item.sgst_amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals Section */}
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {/* Left side - Amount in words */}
              <Typography variant="subtitle2" gutterBottom>
                Amount in Words:
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                {bill.amount_in_words}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Right side - Totals */}
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Taxable Amount:</Typography>
                  <Typography>{formatCurrency(bill.taxable_amount)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>CGST Amount:</Typography>
                  <Typography>{formatCurrency(bill.cgst_amount)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>SGST Amount:</Typography>
                  <Typography>{formatCurrency(bill.sgst_amount)}</Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="h6" fontWeight="bold">
                    Total Amount After Tax:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(bill.total_amount)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box mt={4} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Thank you for your business!
          </Typography>
        </Box>
      </Paper>

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

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact; 
            overflow: hidden !important;
          }
          .no-print { display: none !important; }
          .MuiTableContainer-root {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
          .MuiTable-root {
            overflow: visible !important;
          }
          * {
            overflow: visible !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default BillView;
