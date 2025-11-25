import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import ParcelSearch from './components/ParcelSearch';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏛️ Land Registry - Citizen Portal
          </Typography>
          <Typography variant="body2">
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

export default App;
