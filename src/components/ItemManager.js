import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ItemManager = ({ open, onClose, onItemSaved }) => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    hsn: '',
    default_rate: 0,
    cgst_percent: 9,
    sgst_percent: 9
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open]);

  const loadItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/predefined-items`);
      setItems(response.data);
    } catch (error) {
      showAlert('Error loading items', 'error');
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      showAlert('Item name is required', 'error');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/predefined-items`, newItem);
      showAlert('Item added successfully');
      setNewItem({
        name: '',
        hsn: '',
        default_rate: 0,
        cgst_percent: 9,
        sgst_percent: 9
      });
      loadItems();
      if (onItemSaved) onItemSaved();
    } catch (error) {
      showAlert(error.response?.data?.error || 'Error adding item', 'error');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem.name.trim()) {
      showAlert('Item name is required', 'error');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/predefined-items/${editingItem.id}`, editingItem);
      showAlert('Item updated successfully');
      setEditingItem(null);
      loadItems();
      if (onItemSaved) onItemSaved();
    } catch (error) {
      showAlert(error.response?.data?.error || 'Error updating item', 'error');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/predefined-items/${itemId}`);
      showAlert('Item deleted successfully');
      loadItems();
      if (onItemSaved) onItemSaved();
    } catch (error) {
      showAlert('Error deleting item', 'error');
    }
  };

  const handleEditClick = (item) => {
    setEditingItem({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Manage Items</DialogTitle>
      <DialogContent>
        {/* Add New Item Form */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Item
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              label="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="HSN/SAC"
              value={newItem.hsn}
              onChange={(e) => setNewItem({ ...newItem, hsn: e.target.value })}
              size="small"
              sx={{ width: 120 }}
            />
            <TextField
              label="Default Rate"
              type="number"
              value={newItem.default_rate}
              onChange={(e) => setNewItem({ ...newItem, default_rate: parseFloat(e.target.value) || 0 })}
              size="small"
              sx={{ width: 120 }}
            />
            <TextField
              label="CGST %"
              type="number"
              value={newItem.cgst_percent}
              onChange={(e) => setNewItem({ ...newItem, cgst_percent: parseFloat(e.target.value) || 0 })}
              size="small"
              sx={{ width: 100 }}
            />
            <TextField
              label="SGST %"
              type="number"
              value={newItem.sgst_percent}
              onChange={(e) => setNewItem({ ...newItem, sgst_percent: parseFloat(e.target.value) || 0 })}
              size="small"
              sx={{ width: 100 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              size="small"
            >
              Add
            </Button>
          </Box>
        </Paper>

        {/* Items Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Item Name</strong></TableCell>
                <TableCell><strong>HSN/SAC</strong></TableCell>
                <TableCell><strong>Default Rate</strong></TableCell>
                <TableCell><strong>CGST %</strong></TableCell>
                <TableCell><strong>SGST %</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {editingItem && editingItem.id === item.id ? (
                      <TextField
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      item.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem && editingItem.id === item.id ? (
                      <TextField
                        value={editingItem.hsn}
                        onChange={(e) => setEditingItem({ ...editingItem, hsn: e.target.value })}
                        size="small"
                      />
                    ) : (
                      item.hsn
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem && editingItem.id === item.id ? (
                      <TextField
                        type="number"
                        value={editingItem.default_rate}
                        onChange={(e) => setEditingItem({ ...editingItem, default_rate: parseFloat(e.target.value) || 0 })}
                        size="small"
                      />
                    ) : (
                      `₹${item.default_rate}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem && editingItem.id === item.id ? (
                      <TextField
                        type="number"
                        value={editingItem.cgst_percent}
                        onChange={(e) => setEditingItem({ ...editingItem, cgst_percent: parseFloat(e.target.value) || 0 })}
                        size="small"
                      />
                    ) : (
                      `${item.cgst_percent}%`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem && editingItem.id === item.id ? (
                      <TextField
                        type="number"
                        value={editingItem.sgst_percent}
                        onChange={(e) => setEditingItem({ ...editingItem, sgst_percent: parseFloat(e.target.value) || 0 })}
                        size="small"
                      />
                    ) : (
                      `${item.sgst_percent}%`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem && editingItem.id === item.id ? (
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleUpdateItem}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleCancelEdit}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(item)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

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
    </Dialog>
  );
};

export default ItemManager;
