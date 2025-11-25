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
const mockParcels = {
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
