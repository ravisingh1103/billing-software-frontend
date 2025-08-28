import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Save as SaveIcon,
  Settings as SettingsIcon,
  AddCircle as AddCircleIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import ItemManager from './ItemManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BillForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    invoice_no: '',
    invoice_date: dayjs(),
    due_date: dayjs().add(30, 'day'),
    customer_name: '',
    customer_address: '',
    customer_phone: '',
    customer_gst: '',
    place_of_supply: '',
    transport: '',
    vehicle_number: '',
    payment_status: 'credit',
    payment_date: null,
    notes: '',
    items: [
      {
        id: 1,
        name: '',
        hsn: '',
        qty: 0,
        rate: 0,
        taxable_value: 0,
        cgst_percent: 9,
        cgst_amount: 0,
        sgst_percent: 9,
        sgst_amount: 0,
        total: 0
      }
    ]
  });

  const [totals, setTotals] = useState({
    taxable_amount: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    total_amount: 0,
    amount_in_words: ''
  });

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [predefinedItems, setPredefinedItems] = useState([]);
  const [itemManagerOpen, setItemManagerOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadBill();
    } else {
      generateInvoiceNumber();
    }
    loadPredefinedItems();
  }, [id, isEditing]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const loadBill = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bills/${id}`);
      const bill = response.data;
      setFormData({
        ...bill,
        invoice_date: dayjs(bill.invoice_date),
        due_date: bill.due_date ? dayjs(bill.due_date) : null,
        items: bill.items.map(item => ({ ...item, id: Math.random() }))
      });
    } catch (error) {
      showAlert('Error loading bill', 'error');
    }
  };

  const loadPredefinedItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/predefined-items`);
      setPredefinedItems(response.data);
    } catch (error) {
      console.error('Error loading predefined items:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const invoiceNo = `INV${year}${month}${day}${time}`;
    setFormData(prev => ({ ...prev, invoice_no: invoiceNo }));
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate taxable value and amounts
    if (field === 'qty' || field === 'rate') {
      const qty = field === 'qty' ? value : newItems[index].qty;
      const rate = field === 'rate' ? value : newItems[index].rate;
      newItems[index].taxable_value = qty * rate;
      
      // Calculate CGST and SGST amounts
      newItems[index].cgst_amount = (newItems[index].taxable_value * newItems[index].cgst_percent) / 100;
      newItems[index].sgst_amount = (newItems[index].taxable_value * newItems[index].sgst_percent) / 100;
      newItems[index].total = newItems[index].taxable_value + newItems[index].cgst_amount + newItems[index].sgst_amount;
    }
    
    if (field === 'cgst_percent') {
      newItems[index].cgst_amount = (newItems[index].taxable_value * value) / 100;
      newItems[index].total = newItems[index].taxable_value + newItems[index].cgst_amount + newItems[index].sgst_amount;
    }
    
    if (field === 'sgst_percent') {
      newItems[index].sgst_amount = (newItems[index].taxable_value * value) / 100;
      newItems[index].total = newItems[index].taxable_value + newItems[index].cgst_amount + newItems[index].sgst_amount;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const newItem = {
      id: Math.random(),
      name: '',
      hsn: '',
      qty: 0,
      rate: 0,
      taxable_value: 0,
      cgst_percent: 9,
      cgst_amount: 0,
      sgst_percent: 9,
      sgst_amount: 0,
      total: 0
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const addPredefinedItem = (predefinedItem) => {
    const newItem = {
      id: Math.random(),
      name: predefinedItem.name,
      hsn: predefinedItem.hsn,
      qty: 0,
      rate: predefinedItem.default_rate,
      taxable_value: 0,
      cgst_percent: predefinedItem.cgst_percent,
      cgst_amount: 0,
      sgst_percent: predefinedItem.sgst_percent,
      sgst_amount: 0,
      total: 0
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateTotals = () => {
    const taxable_amount = formData.items.reduce((sum, item) => sum + (item.taxable_value || 0), 0);
    const cgst_amount = formData.items.reduce((sum, item) => sum + (item.cgst_amount || 0), 0);
    const sgst_amount = formData.items.reduce((sum, item) => sum + (item.sgst_amount || 0), 0);
    const total_amount = taxable_amount + cgst_amount + sgst_amount;

    setTotals({
      taxable_amount,
      cgst_amount,
      sgst_amount,
      total_amount,
      amount_in_words: ''
    });

    // Get amount in words
    if (total_amount > 0) {
      axios.get(`${API_BASE_URL}/number-to-words/${total_amount}`)
        .then(response => {
          setTotals(prev => ({ ...prev, amount_in_words: response.data.words }));
        })
        .catch(() => {
          setTotals(prev => ({ ...prev, amount_in_words: 'Amount calculation error' }));
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.invoice_no) {
      showAlert('Please fill in required fields', 'error');
      return;
    }

    const billData = {
      ...formData,
      invoice_date: formData.invoice_date.format('YYYY-MM-DD'),
      due_date: formData.due_date ? formData.due_date.format('YYYY-MM-DD') : null,
      items: formData.items.map(({ id, ...item }) => item), // Remove temporary id
      ...totals
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/bills/${id}`, billData);
        showAlert('Bill updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/bills`, billData);
        showAlert('Bill created successfully');
      }
      setTimeout(() => navigate('/bills'), 2000);
    } catch (error) {
      showAlert(error.response?.data?.error || 'Error saving bill', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Edit Bill' : 'Create New Bill'}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/bills')}
          >
            Back to Bills
          </Button>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          {/* Company Header */}
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={3}>
            <Box
              component="img"
              sx={{
                height: 60,
                width: 60,
                borderRadius: 1
              }}
              alt="Raj Groups Logo"
              src="/logo.jpeg"
            />
            <Box textAlign="center">
              <Typography variant="h5" component="h2" fontWeight="bold">
                Raj Groups
              </Typography>
              <Typography variant="body2">
                B41 Sector 22, Gida Gorakhpur, Gorakhpur, Uttar Pradesh - 273403
              </Typography>
              <Typography variant="body2">
                GSTIN: 09AVOPS3497E1ZV | Contact: 9455617274
              </Typography>
            </Box>
          </Box>

          {/* Customer & Invoice Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer & Invoice Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Name *"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Invoice No. *"
                    value={formData.invoice_no}
                    onChange={(e) => handleInputChange('invoice_no', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Invoice Date"
                    value={formData.invoice_date}
                    onChange={(newValue) => handleInputChange('invoice_date', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Address"
                    multiline
                    rows={2}
                    value={formData.customer_address}
                    onChange={(e) => handleInputChange('customer_address', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Due Date"
                    value={formData.due_date}
                    onChange={(newValue) => handleInputChange('due_date', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Transport"
                    value={formData.transport}
                    onChange={(e) => handleInputChange('transport', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Customer GSTIN"
                    value={formData.customer_gst}
                    onChange={(e) => handleInputChange('customer_gst', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    value={formData.vehicle_number}
                    onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Place of Supply"
                    value={formData.place_of_supply}
                    onChange={(e) => handleInputChange('place_of_supply', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={formData.payment_status}
                      label="Payment Status"
                      onChange={(e) => handleInputChange('payment_status', e.target.value)}
                    >
                      <MenuItem value="credit">Credit</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Payment notes, terms, or additional information..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Items
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {/* Quick Add Predefined Items */}
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {predefinedItems.slice(0, 3).map((item) => (
                      <Chip
                        key={item.id}
                        label={item.name}
                        onClick={() => addPredefinedItem(item)}
                        clickable
                        color="primary"
                        variant="outlined"
                        icon={<AddCircleIcon />}
                      />
                    ))}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => setItemManagerOpen(true)}
                  >
                    Manage Items
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addItem}
                  >
                    Add Custom Item
                  </Button>
                </Box>
              </Box>

              {/* Item Selection Autocomplete */}
              <Box mb={2}>
                <Autocomplete
                  options={predefinedItems}
                  getOptionLabel={(option) => `${option.name} (HSN: ${option.hsn})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select from saved items"
                      placeholder="Type to search items..."
                    />
                  )}
                  onChange={(event, value) => {
                    if (value) {
                      addPredefinedItem(value);
                    }
                  }}
                  value={null}
                  sx={{ maxWidth: 400 }}
                />
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr. No.</TableCell>
                      <TableCell>Product/Service</TableCell>
                      <TableCell>HSN/SAC</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Taxable Value</TableCell>
                      <TableCell>CGST %</TableCell>
                      <TableCell>CGST Amt</TableCell>
                      <TableCell>SGST %</TableCell>
                      <TableCell>SGST Amt</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.hsn}
                            onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, 'qty', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>₹{item.taxable_value.toFixed(2)}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.cgst_percent}
                            onChange={(e) => handleItemChange(index, 'cgst_percent', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>₹{item.cgst_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.sgst_percent}
                            onChange={(e) => handleItemChange(index, 'sgst_percent', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>₹{item.sgst_amount.toFixed(2)}</TableCell>
                        <TableCell>₹{item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Totals Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Taxable Amount:</Typography>
                    <Typography fontWeight="bold">₹{totals.taxable_amount.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>CGST Amount:</Typography>
                    <Typography fontWeight="bold">₹{totals.cgst_amount.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>SGST Amount:</Typography>
                    <Typography fontWeight="bold">₹{totals.sgst_amount.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2} sx={{ borderTop: 1, pt: 1 }}>
                    <Typography variant="h6">Total Amount:</Typography>
                    <Typography variant="h6" fontWeight="bold">₹{totals.total_amount.toFixed(2)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Amount in Words:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {totals.amount_in_words}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
            >
              {isEditing ? 'Update Bill' : 'Save Bill'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/bills')}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </form>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Item Manager Dialog */}
      <ItemManager
        open={itemManagerOpen}
        onClose={() => setItemManagerOpen(false)}
        onItemSaved={loadPredefinedItems}
      />
    </Box>
  );
};

export default BillForm;
