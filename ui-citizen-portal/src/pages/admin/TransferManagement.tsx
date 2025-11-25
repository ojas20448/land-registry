import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

interface Transfer {
  transferId: string;
  landId: string;
  fromOwner?: string;
  toOwner?: string;
  currentOwner?: string;
  salePrice?: number;
  stampDuty?: number;
  registrationNumber?: string;
  transferDate?: string;
  lastTransferDate?: string;
  transferCount?: number;
  status?: string;
}

interface LandParcel {
  landId: string;
  surveyNumber: string;
  currentOwnerName: string;
  status: string;
  landType: string;
}

const TransferManagement: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchTransfers();
    fetchParcels();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/transfers`);
      setTransfers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParcels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/parcels`);
      setParcels(response.data.data.filter((p: LandParcel) => p.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to fetch parcels:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE_URL}/admin/transfers`, formData);
      setSuccessMessage('Transfer completed successfully');
      handleCloseDialog();
      fetchTransfers();
      fetchParcels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to complete transfer');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Property Transfer Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage property sales and ownership transfers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Transfer
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transfer ID</TableCell>
              <TableCell>Land ID</TableCell>
              <TableCell>Current Owner</TableCell>
              <TableCell>Transfer Count</TableCell>
              <TableCell>Last Transfer</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow key={transfer.transferId}>
                <TableCell>{transfer.transferId}</TableCell>
                <TableCell>{transfer.landId}</TableCell>
                <TableCell>{transfer.currentOwner || transfer.toOwner || 'N/A'}</TableCell>
                <TableCell>{transfer.transferCount || 1}</TableCell>
                <TableCell>
                  {transfer.lastTransferDate 
                    ? new Date(transfer.lastTransferDate).toLocaleDateString()
                    : transfer.transferDate 
                    ? new Date(transfer.transferDate).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip label={transfer.status || 'COMPLETED'} color="success" size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Transfer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SwapHorizIcon sx={{ mr: 1 }} />
            New Property Transfer
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Property"
                value={formData.landId || ''}
                onChange={(e) => {
                  const selectedParcel = parcels.find(p => p.landId === e.target.value);
                  setFormData({ 
                    ...formData, 
                    landId: e.target.value,
                    currentOwner: selectedParcel?.currentOwnerName 
                  });
                }}
                SelectProps={{ native: true }}
              >
                <option value="">-- Select Property --</option>
                {parcels.map((parcel) => (
                  <option key={parcel.landId} value={parcel.landId}>
                    {parcel.landId} - {parcel.surveyNumber} ({parcel.currentOwnerName})
                  </option>
                ))}
              </TextField>
            </Grid>

            {formData.landId && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Owner (From)"
                    value={formData.currentOwner || ''}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Owner Name (To)"
                    value={formData.newOwnerName || ''}
                    onChange={(e) => setFormData({ ...formData, newOwnerName: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Sale Price (₹)"
                    value={formData.salePrice || ''}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Stamp Duty (₹)"
                    value={formData.stampDuty || ''}
                    onChange={(e) => setFormData({ ...formData, stampDuty: parseFloat(e.target.value) })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="REG/2024/XXXX"
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.landId || !formData.newOwnerName}
          >
            Complete Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransferManagement;
