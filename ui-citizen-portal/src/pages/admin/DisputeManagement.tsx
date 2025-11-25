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
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

interface Dispute {
  disputeId: string;
  landId: string;
  disputeType: string;
  filedBy: string;
  description?: string;
  filedDate: string;
  status: string;
}

interface LandParcel {
  landId: string;
  surveyNumber: string;
  currentOwnerName: string;
  status: string;
}

const DisputeManagement: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResolveDialog, setOpenResolveDialog] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDisputes();
    fetchParcels();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/disputes`);
      setDisputes(response.data.data);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParcels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/parcels`);
      setParcels(response.data.data);
    } catch (error) {
      console.error('Failed to fetch parcels:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ disputeType: 'OWNERSHIP' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE_URL}/admin/disputes`, formData);
      setSuccessMessage('Dispute filed successfully');
      handleCloseDialog();
      fetchDisputes();
      fetchParcels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to file dispute');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleOpenResolveDialog = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setOpenResolveDialog(true);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;

    try {
      await axios.put(`${API_BASE_URL}/admin/disputes/${selectedDispute.disputeId}/resolve`, {
        resolution: formData.resolution
      });
      setSuccessMessage('Dispute resolved successfully');
      setOpenResolveDialog(false);
      setSelectedDispute(null);
      setFormData({});
      fetchDisputes();
      fetchParcels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to resolve dispute');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Dispute Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage property disputes and legal cases
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          File Dispute
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
              <TableCell>Dispute ID</TableCell>
              <TableCell>Land ID</TableCell>
              <TableCell>Dispute Type</TableCell>
              <TableCell>Filed By</TableCell>
              <TableCell>Filed Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {disputes.map((dispute) => (
              <TableRow key={dispute.disputeId}>
                <TableCell>{dispute.disputeId}</TableCell>
                <TableCell>{dispute.landId}</TableCell>
                <TableCell>{dispute.disputeType}</TableCell>
                <TableCell>{dispute.filedBy}</TableCell>
                <TableCell>
                  {new Date(dispute.filedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={dispute.status} 
                    color={dispute.status === 'OPEN' ? 'error' : 'success'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  {dispute.status === 'OPEN' && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleOpenResolveDialog(dispute)}
                      title="Resolve Dispute"
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

      {/* File Dispute Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GavelIcon sx={{ mr: 1 }} />
            File New Dispute
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
                onChange={(e) => setFormData({ ...formData, landId: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">-- Select Property --</option>
                {parcels.map((parcel) => (
                  <option key={parcel.landId} value={parcel.landId}>
                    {parcel.landId} - {parcel.surveyNumber}
                  </option>
                ))}
              </TextField>
            </Grid>

            {formData.landId && (
              <>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Dispute Type"
                    value={formData.disputeType || 'OWNERSHIP'}
                    onChange={(e) => setFormData({ ...formData, disputeType: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="OWNERSHIP">Ownership</option>
                    <option value="BOUNDARY">Boundary</option>
                    <option value="FRAUD">Fraud</option>
                    <option value="INHERITANCE">Inheritance</option>
                    <option value="ENCROACHMENT">Encroachment</option>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Filed By (Complainant Name)"
                    value={formData.filedBy || ''}
                    onChange={(e) => setFormData({ ...formData, filedBy: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the dispute in detail..."
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
            color="error"
            disabled={!formData.landId || !formData.filedBy || !formData.description}
          >
            File Dispute
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dispute Dialog */}
      <Dialog open={openResolveDialog} onClose={() => setOpenResolveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Dispute</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Dispute ID: {selectedDispute?.disputeId}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Land ID: {selectedDispute?.landId}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Resolution Details"
              value={formData.resolution || ''}
              onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
              placeholder="Enter resolution details..."
              sx={{ mt: 2 }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResolveDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleResolveDispute} 
            variant="contained" 
            color="success"
            disabled={!formData.resolution}
          >
            Resolve Dispute
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DisputeManagement;
