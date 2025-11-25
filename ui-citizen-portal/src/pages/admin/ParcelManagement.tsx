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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

interface LandParcel {
  landId: string;
  surveyNumber: string;
  state: string;
  district: string;
  village: string;
  currentOwnerName: string;
  status: string;
  landType: string;
  area: number;
  areaUnit: string;
}

const ParcelManagement: React.FC = () => {
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [formData, setFormData] = useState<Partial<LandParcel>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/parcels`);
      setParcels(response.data.data);
    } catch (error) {
      console.error('Failed to fetch parcels:', error);
      setErrorMessage('Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (parcel?: LandParcel) => {
    if (parcel) {
      setSelectedParcel(parcel);
      setFormData(parcel);
    } else {
      setSelectedParcel(null);
      setFormData({
        status: 'ACTIVE',
        landType: 'RESIDENTIAL',
        areaUnit: 'sqft',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedParcel(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      if (selectedParcel) {
        await axios.put(`${API_BASE_URL}/admin/parcels/${selectedParcel.landId}`, formData);
        setSuccessMessage('Parcel updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/admin/parcels`, formData);
        setSuccessMessage('Parcel created successfully');
      }
      handleCloseDialog();
      fetchParcels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save parcel:', error);
      setErrorMessage('Failed to save parcel');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDelete = async (landId: string) => {
    if (!confirm('Are you sure you want to delete this parcel?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/parcels/${landId}`);
      setSuccessMessage('Parcel deleted successfully');
      fetchParcels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to delete parcel:', error);
      setErrorMessage('Failed to delete parcel');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'FROZEN':
      case 'UNDER_DISPUTE':
        return 'error';
      case 'MORTGAGED':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Parcel Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage land parcels in the registry
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Parcel
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
              <TableCell>Land ID</TableCell>
              <TableCell>Survey Number</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Area</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parcels.map((parcel) => (
              <TableRow key={parcel.landId}>
                <TableCell>{parcel.landId}</TableCell>
                <TableCell>{parcel.surveyNumber}</TableCell>
                <TableCell>
                  {parcel.village}, {parcel.district}
                </TableCell>
                <TableCell>{parcel.currentOwnerName}</TableCell>
                <TableCell>
                  <Chip
                    label={parcel.status}
                    color={getStatusColor(parcel.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{parcel.landType}</TableCell>
                <TableCell>
                  {parcel.area} {parcel.areaUnit}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(parcel)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(parcel.landId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedParcel ? 'Edit Parcel' : 'Add New Parcel'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Land ID"
                value={formData.landId || ''}
                onChange={(e) => setFormData({ ...formData, landId: e.target.value })}
                disabled={!!selectedParcel}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Survey Number"
                value={formData.surveyNumber || ''}
                onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="District"
                value={formData.district || ''}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Village"
                value={formData.village || ''}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Owner Name"
                value={formData.currentOwnerName || ''}
                onChange={(e) =>
                  setFormData({ ...formData, currentOwnerName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status || 'ACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="MORTGAGED">Mortgaged</MenuItem>
                <MenuItem value="FROZEN">Frozen</MenuItem>
                <MenuItem value="UNDER_DISPUTE">Under Dispute</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Land Type"
                value={formData.landType || 'RESIDENTIAL'}
                onChange={(e) => setFormData({ ...formData, landType: e.target.value })}
              >
                <MenuItem value="RESIDENTIAL">Residential</MenuItem>
                <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                <MenuItem value="AGRICULTURAL">Agricultural</MenuItem>
                <MenuItem value="INDUSTRIAL">Industrial</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                type="number"
                label="Area"
                value={formData.area || ''}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Unit"
                value={formData.areaUnit || 'sqft'}
                onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
              >
                <MenuItem value="sqft">Sq. Ft.</MenuItem>
                <MenuItem value="acres">Acres</MenuItem>
                <MenuItem value="hectares">Hectares</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedParcel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParcelManagement;
