import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import ParcelSearch from './components/ParcelSearch';
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ParcelManagement from './pages/admin/ParcelManagement';
import UserManagement from './pages/admin/UserManagement';
import TransferManagement from './pages/admin/TransferManagement';
import MortgageManagement from './pages/admin/MortgageManagement';
import DisputeManagement from './pages/admin/DisputeManagement';
import TransactionHistory from './pages/admin/TransactionHistory';

function CitizenPortal() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏛️ Land Registry - Citizen Portal
          </Typography>
          <Button color="inherit" href="/admin/login">
            Admin Login
          </Button>
          <Typography variant="body2" sx={{ ml: 2 }}>
            Powered by Blockchain
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Property Verification System
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Search and verify land parcel ownership records stored on the blockchain.
          All records are immutable and tamper-proof.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <ParcelSearch />
        </Box>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CitizenPortal />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="parcels" element={<ParcelManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="transfers" element={<TransferManagement />} />
          <Route path="mortgages" element={<MortgageManagement />} />
          <Route path="disputes" element={<DisputeManagement />} />
          <Route path="transactions" element={<TransactionHistory />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
