import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
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
  ownershipHistoryCount: number;
  hasDisputes: boolean;
  hasMortgages: boolean;
}

interface OwnershipEvent {
  eventType: string;
  toOwnerName: string;
  fromOwnerName?: string;
  transactionDate: string;
  documentRef?: string;
}

export const ParcelSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [parcel, setParcel] = useState<LandParcel | null>(null);
  const [history, setHistory] = useState<OwnershipEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParcel = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a land ID or survey number');
      return;
    }

    setLoading(true);
    setError('');
    setParcel(null);
    setHistory([]);

    try {
      // Search parcel
      const parcelRes = await axios.get(`${API_BASE_URL}/public/parcels/${searchQuery}`);
      setParcel(parcelRes.data.data);

      // Get ownership history
      const historyRes = await axios.get(`${API_BASE_URL}/public/parcels/${searchQuery}/history`);
      setHistory(historyRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch parcel details');
    } finally {
      setLoading(false);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          🏛️ Land Registry Portal
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Verify property ownership and history on the blockchain
        </Typography>
      </Box>

      {/* Search Box */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Enter Land ID or Survey Number"
            placeholder="e.g., MH-MUM-001"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchParcel()}
          />
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={searchParcel}
            disabled={loading}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Parcel Details */}
      {parcel && (
        <>
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Land Parcel Details
                </Typography>
                <Chip
                  label={parcel.status}
                  color={getStatusColor(parcel.status) as any}
                  icon={parcel.status === 'ACTIVE' ? <VerifiedIcon /> : <WarningIcon />}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Land ID
                  </Typography>
                  <Typography variant="h6">{parcel.landId}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Survey Number
                  </Typography>
                  <Typography variant="h6">{parcel.surveyNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Owner
                  </Typography>
                  <Typography variant="h6">{parcel.currentOwnerName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Area
                  </Typography>
                  <Typography variant="h6">
                    {parcel.area} {parcel.areaUnit}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {parcel.village}, {parcel.district}, {parcel.state}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Land Type
                  </Typography>
                  <Typography variant="body1">{parcel.landType}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {parcel.hasDisputes && (
                  <Chip label="Has Active Disputes" color="error" size="small" />
                )}
                {parcel.hasMortgages && (
                  <Chip label="Mortgaged" color="warning" size="small" />
                )}
                <Chip
                  label={`${parcel.ownershipHistoryCount} Ownership Transfers`}
                  color="info"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Ownership History */}
          {history.length > 0 && (
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  📜 Ownership History
                </Typography>
                <Box>
                  {history.map((event, index) => (
                    <Paper key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(event.transactionDate).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={9}>
                          <Typography variant="h6" component="span">
                            {event.eventType}
                          </Typography>
                          <Typography>
                            {event.fromOwnerName && `From: ${event.fromOwnerName}`}
                          </Typography>
                          <Typography>To: {event.toOwnerName}</Typography>
                          {event.documentRef && (
                            <Chip label="Document Verified" size="small" color="success" sx={{ mt: 1 }} />
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default ParcelSearch;
