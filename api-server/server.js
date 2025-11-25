/**
 * Simple Development Server for Land Registry UI
 * No TypeScript, pure JavaScript
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Mock data
let mockParcels = {
  'MH-MUM-001': {
    landId: 'MH-MUM-001',
    surveyNumber: 'SUR-2024-MH-001',
    state: 'Maharashtra',
    district: 'Mumbai City',
    village: 'Bandra East',
    currentOwnerName: 'Rajesh Kumar',
    status: 'ACTIVE',
    landType: 'RESIDENTIAL',
    area: 1200,
    areaUnit: 'sqft',
    ownershipHistoryCount: 1,
    hasDisputes: false,
    hasMortgages: false,
  },
  'KA-BLR-003': {
    landId: 'KA-BLR-003',
    surveyNumber: 'SUR-2024-KA-003',
    state: 'Karnataka',
    district: 'Bangalore Urban',
    village: 'Whitefield',
    currentOwnerName: 'Tech Solutions Pvt Ltd',
    status: 'ACTIVE',
    landType: 'COMMERCIAL',
    area: 5000,
    areaUnit: 'sqft',
    ownershipHistoryCount: 2,
    hasDisputes: false,
    hasMortgages: true,
  },
  'PB-LDH-002': {
    landId: 'PB-LDH-002',
    surveyNumber: 'SUR-2024-PB-002',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'Dehlon',
    currentOwnerName: 'Harpreet Singh',
    status: 'ACTIVE',
    landType: 'AGRICULTURAL',
    area: 20000,
    areaUnit: 'sqft',
    ownershipHistoryCount: 3,
    hasDisputes: false,
    hasMortgages: false,
  },
  'DL-NEW-004': {
    landId: 'DL-NEW-004',
    surveyNumber: 'SUR-2024-DL-004',
    state: 'Delhi',
    district: 'New Delhi',
    village: 'Vasant Vihar',
    currentOwnerName: 'Anita Sharma',
    status: 'MORTGAGED',
    landType: 'RESIDENTIAL',
    area: 3000,
    areaUnit: 'sqft',
    ownershipHistoryCount: 1,
    hasDisputes: false,
    hasMortgages: true,
  },
};

const mockUsers = [
  {
    userId: 'USR-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    role: 'CITIZEN',
    status: 'ACTIVE',
    registeredDate: '2024-01-15T00:00:00Z',
    parcelsOwned: 1,
  },
  {
    userId: 'USR-002',
    name: 'Tech Solutions Pvt Ltd',
    email: 'contact@techsolutions.com',
    role: 'CITIZEN',
    status: 'ACTIVE',
    registeredDate: '2024-02-20T00:00:00Z',
    parcelsOwned: 1,
  },
  {
    userId: 'USR-003',
    name: 'Harpreet Singh',
    email: 'harpreet.singh@example.com',
    role: 'CITIZEN',
    status: 'ACTIVE',
    registeredDate: '2024-03-10T00:00:00Z',
    parcelsOwned: 1,
  },
  {
    userId: 'USR-004',
    name: 'Anita Sharma',
    email: 'anita.sharma@example.com',
    role: 'CITIZEN',
    status: 'ACTIVE',
    registeredDate: '2024-04-05T00:00:00Z',
    parcelsOwned: 1,
  },
  {
    userId: 'ADM-001',
    name: 'Admin User',
    email: 'admin@landregistry.gov',
    role: 'ADMIN',
    status: 'ACTIVE',
    registeredDate: '2024-01-01T00:00:00Z',
    parcelsOwned: 0,
  },
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', mode: 'MOCK' });
});

// API v1 routes (for frontend)
app.get('/api/v1/public/parcels/:landId', (req, res) => {
  const parcel = mockParcels[req.params.landId];
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }
  res.json({ success: true, data: parcel });
});

app.get('/api/v1/public/parcels/:landId/history', (req, res) => {
  const parcel = mockParcels[req.params.landId];
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }
  res.json({
    success: true,
    data: [
      {
        eventType: 'Initial Registration',
        toOwnerName: parcel.currentOwnerName,
        fromOwnerName: 'Legacy System',
        transactionDate: '2024-01-15T00:00:00Z',
        documentRef: `DOC-${parcel.landId}-001`,
      },
    ],
  });
});

// Legacy routes
app.get('/api/public/parcel/:landId', (req, res) => {
  const parcel = mockParcels[req.params.landId];
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }
  res.json({ success: true, data: parcel });
});

// Admin routes
app.get('/api/v1/admin/stats', (req, res) => {
  const parcels = Object.values(mockParcels);
  const stats = {
    totalParcels: parcels.length,
    activeParcels: parcels.filter(p => p.status === 'ACTIVE').length,
    disputedParcels: parcels.filter(p => p.hasDisputes).length,
    mortgagedParcels: parcels.filter(p => p.status === 'MORTGAGED' || p.hasMortgages).length,
    totalUsers: mockUsers.length,
    recentTransactions: parcels.reduce((sum, p) => sum + p.ownershipHistoryCount, 0),
  };
  res.json({ success: true, data: stats });
});

app.get('/api/v1/admin/parcels', (req, res) => {
  const parcels = Object.values(mockParcels);
  res.json({ success: true, data: parcels });
});

app.get('/api/v1/admin/parcels/:landId', (req, res) => {
  const parcel = mockParcels[req.params.landId];
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }
  res.json({ success: true, data: parcel });
});

app.post('/api/v1/admin/parcels', (req, res) => {
  const newParcel = req.body;
  mockParcels[newParcel.landId] = {
    ...newParcel,
    ownershipHistoryCount: 1,
    hasDisputes: false,
    hasMortgages: false,
  };
  res.json({ success: true, data: mockParcels[newParcel.landId] });
});

app.put('/api/v1/admin/parcels/:landId', (req, res) => {
  const parcel = mockParcels[req.params.landId];
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }
  mockParcels[req.params.landId] = { ...parcel, ...req.body };
  res.json({ success: true, data: mockParcels[req.params.landId] });
});

app.delete('/api/v1/admin/parcels/:landId', (req, res) => {
  if (!mockParcels[req.params.landId]) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }
  delete mockParcels[req.params.landId];
  res.json({ success: true, message: 'Parcel deleted successfully' });
});

app.get('/api/v1/admin/users', (req, res) => {
  res.json({ success: true, data: mockUsers });
});

// Transfer/Sale routes
app.post('/api/v1/admin/transfers', (req, res) => {
  const { landId, newOwnerName, salePrice, stampDuty, registrationNumber } = req.body;
  
  const parcel = mockParcels[landId];
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }

  if (parcel.status !== 'ACTIVE') {
    return res.status(400).json({ 
      success: false, 
      error: `Cannot transfer parcel with status: ${parcel.status}` 
    });
  }

  // Create transfer record
  const transfer = {
    transferId: `TRF-${Date.now()}`,
    landId,
    fromOwner: parcel.currentOwnerName,
    toOwner: newOwnerName,
    salePrice,
    stampDuty,
    registrationNumber,
    transferDate: new Date().toISOString(),
    status: 'COMPLETED',
  };

  // Update parcel
  parcel.currentOwnerName = newOwnerName;
  parcel.ownershipHistoryCount += 1;

  res.json({ success: true, data: transfer });
});

app.get('/api/v1/admin/transfers', (req, res) => {
  // Mock transfer history
  const transfers = Object.values(mockParcels).map(parcel => ({
    transferId: `TRF-${parcel.landId}`,
    landId: parcel.landId,
    currentOwner: parcel.currentOwnerName,
    transferCount: parcel.ownershipHistoryCount,
    lastTransferDate: new Date().toISOString(),
  }));
  res.json({ success: true, data: transfers });
});

// Mortgage routes
app.post('/api/v1/admin/mortgages', (req, res) => {
  const { landId, lenderName, loanAmount, interestRate, tenure } = req.body;
  
  const parcel = mockParcels[landId];
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }

  if (parcel.status === 'UNDER_DISPUTE' || parcel.status === 'FROZEN') {
    return res.status(400).json({ 
      success: false, 
      error: `Cannot mortgage parcel with status: ${parcel.status}` 
    });
  }

  const mortgage = {
    mortgageId: `MTG-${Date.now()}`,
    landId,
    borrower: parcel.currentOwnerName,
    lender: lenderName,
    loanAmount,
    interestRate,
    tenure,
    startDate: new Date().toISOString(),
    status: 'ACTIVE',
    outstandingAmount: loanAmount,
  };

  // Update parcel
  parcel.status = 'MORTGAGED';
  parcel.hasMortgages = true;

  res.json({ success: true, data: mortgage });
});

app.get('/api/v1/admin/mortgages', (req, res) => {
  const mortgages = Object.values(mockParcels)
    .filter(p => p.hasMortgages || p.status === 'MORTGAGED')
    .map(parcel => ({
      mortgageId: `MTG-${parcel.landId}`,
      landId: parcel.landId,
      borrower: parcel.currentOwnerName,
      lender: 'State Bank',
      loanAmount: 3000000,
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
    }));
  res.json({ success: true, data: mortgages });
});

app.put('/api/v1/admin/mortgages/:mortgageId/close', (req, res) => {
  const { mortgageId } = req.params;
  const landId = mortgageId.replace('MTG-', '');
  
  const parcel = mockParcels[landId];
  if (parcel) {
    parcel.status = 'ACTIVE';
    parcel.hasMortgages = false;
  }

  res.json({ 
    success: true, 
    data: { mortgageId, status: 'CLOSED', closureDate: new Date().toISOString() } 
  });
});

// Dispute routes
app.post('/api/v1/admin/disputes', (req, res) => {
  const { landId, disputeType, filedBy, description } = req.body;
  
  const parcel = mockParcels[landId];
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }

  const dispute = {
    disputeId: `DSP-${Date.now()}`,
    landId,
    disputeType,
    filedBy,
    description,
    filedDate: new Date().toISOString(),
    status: 'OPEN',
  };

  // Update parcel
  parcel.status = 'UNDER_DISPUTE';
  parcel.hasDisputes = true;

  res.json({ success: true, data: dispute });
});

app.get('/api/v1/admin/disputes', (req, res) => {
  const disputes = Object.values(mockParcels)
    .filter(p => p.hasDisputes || p.status === 'UNDER_DISPUTE')
    .map(parcel => ({
      disputeId: `DSP-${parcel.landId}`,
      landId: parcel.landId,
      disputeType: 'OWNERSHIP',
      filedBy: 'Complainant Name',
      filedDate: new Date().toISOString(),
      status: 'OPEN',
    }));
  res.json({ success: true, data: disputes });
});

app.put('/api/v1/admin/disputes/:disputeId/resolve', (req, res) => {
  const { disputeId } = req.params;
  const { resolution } = req.body;
  const landId = disputeId.replace('DSP-', '');
  
  const parcel = mockParcels[landId];
  if (parcel) {
    parcel.status = 'ACTIVE';
    parcel.hasDisputes = false;
  }

  res.json({ 
    success: true, 
    data: { 
      disputeId, 
      status: 'RESOLVED', 
      resolution,
      resolutionDate: new Date().toISOString() 
    } 
  });
});

// Transaction history
app.get('/api/v1/admin/transactions', (req, res) => {
  const transactions = [
    {
      transactionId: 'TXN-001',
      type: 'TRANSFER',
      landId: 'MH-MUM-001',
      description: 'Property transferred to new owner',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    },
    {
      transactionId: 'TXN-002',
      type: 'MORTGAGE',
      landId: 'KA-BLR-003',
      description: 'Home loan mortgage created',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
    },
  ];
  res.json({ success: true, data: transactions });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', path: req.path });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Land Registry API running at http://localhost:' + PORT);
  console.log('📦 Try: http://localhost:' + PORT + '/api/v1/public/parcels/MH-MUM-001');
  console.log('');
});

// Keep server alive
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close();
  process.exit(0);
});
