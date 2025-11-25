import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  TextField,
  MenuItem,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

interface Transaction {
  id: string;
  type: string;
  landId: string;
  timestamp: string;
  details: any;
  status: string;
}

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/transactions`);
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setErrorMessage('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TRANSFER':
        return 'primary';
      case 'MORTGAGE':
        return 'warning';
      case 'DISPUTE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'RESOLVED':
      case 'CLOSED':
        return 'success';
      case 'ACTIVE':
      case 'OPEN':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredTransactions = filterType === 'ALL' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Transaction History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all property transactions and activities
          </Typography>
        </Box>
        <TextField
          select
          label="Filter by Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="ALL">All Transactions</MenuItem>
          <MenuItem value="TRANSFER">Transfers</MenuItem>
          <MenuItem value="MORTGAGE">Mortgages</MenuItem>
          <MenuItem value="DISPUTE">Disputes</MenuItem>
        </TextField>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Land ID</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4 }}>
                    <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No transactions found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.type} 
                      color={getTypeColor(transaction.type) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{transaction.landId}</TableCell>
                  <TableCell>
                    {new Date(transaction.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {transaction.type === 'TRANSFER' && (
                      <Typography variant="body2">
                        {transaction.details.fromOwner} → {transaction.details.toOwner}
                        <br />
                        <strong>₹{transaction.details.salePrice?.toLocaleString()}</strong>
                      </Typography>
                    )}
                    {transaction.type === 'MORTGAGE' && (
                      <Typography variant="body2">
                        Lender: {transaction.details.lender}
                        <br />
                        <strong>₹{transaction.details.loanAmount?.toLocaleString()}</strong>
                      </Typography>
                    )}
                    {transaction.type === 'DISPUTE' && (
                      <Typography variant="body2">
                        Type: {transaction.details.disputeType}
                        <br />
                        Filed by: {transaction.details.filedBy}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.status} 
                      color={getStatusColor(transaction.status) as any} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total Transactions: {filteredTransactions.length}
        </Typography>
      </Box>
    </Container>
  );
};

export default TransactionHistory;
