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
  IconButton,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

interface Mortgage {
  mortgageId: string;
  landId: string;
  borrower: string;
  lender: string;
  loanAmount: number;
  interestRate?: number;
  tenure?: number;
  startDate: string;
  status: string;
  outstandingAmount?: number;
}

interface LandParcel {
  landId: string;
  surveyNumber: string;
  currentOwnerName: string;
  status: string;
}

const MortgageManagement: React.FC = () => {
  const [mortgages, setMortgages] = useState<Mortgage[]>([]);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchMortgages();
    fetchParcels();
  }, []);

  const fetchMortgages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/mortgages`);
      setMortgages(response.data.data);
    } catch (error) {
      console.error('Failed to fetch mortgages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParcels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/parcels`);
      setParcels(response.data.data.filter((p: LandParcel) => 
        p.status === 'ACTIVE' || p.status === 'MORTGAGED'
      ));
    } catch (error) {
      console.error('Failed to fetch parcels:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ interestRate: 8.5, tenure: 240 });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE_URL}/admin/mortgages`, formData);
      setSuccessMessage('Mortgage created successfully');
      handleCloseDialog();
      fetchMortgages();
      fetchParcels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to create mortgage');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleCloseMortgage = async (mortgageId: string) => {
    if (!confirm('Are you sure you want to close this mortgage?')) return;

    try {
      await axios.put(`${API_BASE_URL}/admin/mortgages/${mortgageId}/close`);
      setSuccessMessage('Mortgage closed successfully');
      fetchMortgages();
      fetchParcels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to close mortgage');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Mortgage Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage property mortgages and loans
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Mortgage
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
              <TableCell>Mortgage ID</TableCell>
              <TableCell>Land ID</TableCell>
              <TableCell>Borrower</TableCell>
              <TableCell>Lender</TableCell>
              <TableCell>Loan Amount</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mortgages.map((mortgage) => (
              <TableRow key={mortgage.mortgageId}>
                <TableCell>{mortgage.mortgageId}</TableCell>
                <TableCell>{mortgage.landId}</TableCell>
                <TableCell>{mortgage.borrower}</TableCell>
                <TableCell>{mortgage.lender}</TableCell>
                <TableCell>₹{mortgage.loanAmount.toLocaleString()}</TableCell>
                <TableCell>
                  {new Date(mortgage.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={mortgage.status} 
                    color={mortgage.status === 'ACTIVE' ? 'warning' : 'success'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  {mortgage.status === 'ACTIVE' && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleCloseMortgage(mortgage.mortgageId)}
                      title="Close Mortgage"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mortgage Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceIcon sx={{ mr: 1 }} />
            New Mortgage
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
                    borrower: selectedParcel?.currentOwnerName 
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
                    label="Borrower (Property Owner)"
                    value={formData.borrower || ''}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Lender/Bank Name"
                    value={formData.lenderName || ''}
                    onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
                    placeholder="State Bank of India"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Loan Amount (₹)"
                    value={formData.loanAmount || ''}
                    onChange={(e) => setFormData({ ...formData, loanAmount: parseFloat(e.target.value) })}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Interest Rate (%)"
                    value={formData.interestRate || ''}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.1 }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tenure (months)"
                    value={formData.tenure || ''}
                    onChange={(e) => setFormData({ ...formData, tenure: parseInt(e.target.value) })}
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
            disabled={!formData.landId || !formData.lenderName || !formData.loanAmount}
          >
            Create Mortgage
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MortgageManagement;
