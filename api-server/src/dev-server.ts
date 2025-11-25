/**
 * Development Server with Mock Mode
 * Run API server without Docker/Fabric for local development
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mock data
const mockParcels = {
  'MH-MUM-001': {
    landId: 'MH-MUM-001',
    surveyNumber: 'SUR-2024-MH-001',
    district: 'Mumbai City',
    taluka: 'Mumbai',
    village: 'Bandra East',
    state: 'Maharashtra',
    pincode: '400051',
    area: 1200,
    areaUnit: 'sqft',
    currentOwner: 'Rajesh Kumar',
    status: 'VERIFIED',
    landUseClassification: 'RESIDENTIAL',
    registeredAt: '2024-01-15T00:00:00Z',
  },
  'KA-BLR-003': {
    landId: 'KA-BLR-003',
    surveyNumber: 'SUR-2024-KA-003',
    district: 'Bangalore Urban',
    taluka: 'Bangalore North',
    village: 'Whitefield',
    state: 'Karnataka',
    pincode: '560066',
    area: 5000,
    areaUnit: 'sqft',
    currentOwner: 'Tech Solutions Pvt Ltd',
    status: 'VERIFIED',
    landUseClassification: 'COMMERCIAL',
    registeredAt: '2024-03-20T00:00:00Z',
  },
  'PB-LDH-002': {
    landId: 'PB-LDH-002',
    surveyNumber: 'SUR-2024-PB-002',
    district: 'Ludhiana',
    taluka: 'Ludhiana',
    village: 'Dehlon',
    state: 'Punjab',
    pincode: '141421',
    area: 20000,
    areaUnit: 'sqft',
    currentOwner: 'Harpreet Singh',
    status: 'VERIFIED',
    landUseClassification: 'AGRICULTURAL',
    registeredAt: '2024-02-10T00:00:00Z',
  },
  'DL-NEW-004': {
    landId: 'DL-NEW-004',
    surveyNumber: 'SUR-2024-DL-004',
    district: 'New Delhi',
    taluka: 'New Delhi',
    village: 'Vasant Vihar',
    state: 'Delhi',
    pincode: '110057',
    area: 3000,
    areaUnit: 'sqft',
    currentOwner: 'Anita Sharma',
    status: 'MORTGAGED',
    landUseClassification: 'RESIDENTIAL',
    registeredAt: '2024-04-05T00:00:00Z',
  },
};

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mode: 'MOCK',
    timestamp: new Date().toISOString(),
    message: 'Land Registry API - Development Mode (No Blockchain Required)',
  });
});

// Helper function to format parcel data for frontend
const formatParcelForFrontend = (parcel: any) => ({
  landId: parcel.landId,
  surveyNumber: parcel.surveyNumber,
  state: parcel.state,
  district: parcel.district,
  village: parcel.village,
  currentOwnerName: parcel.currentOwner,
  status: parcel.status === 'VERIFIED' ? 'ACTIVE' : parcel.status,
  landType: parcel.landUseClassification,
  area: parcel.area,
  areaUnit: parcel.areaUnit,
  ownershipHistoryCount: 1,
  hasDisputes: false,
  hasMortgages: parcel.status === 'MORTGAGED',
});

// Helper function to format history for frontend
const formatHistoryForFrontend = (parcel: any) => ([
  {
    eventType: 'Initial Registration',
    toOwnerName: parcel.currentOwner,
    fromOwnerName: 'Legacy System',
    transactionDate: parcel.registeredAt,
    documentRef: `DOC-${parcel.landId}-001`,
  },
]);

// Public APIs - v1 routes (for frontend compatibility)
app.get('/api/v1/public/parcels/:landId', (req: Request, res: Response) => {
  const { landId } = req.params;
  const parcel = mockParcels[landId as keyof typeof mockParcels];
  
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }
  
  res.json({ success: true, data: formatParcelForFrontend(parcel) });
});

app.get('/api/v1/public/parcels/:landId/history', (req: Request, res: Response) => {
  const { landId } = req.params;
  const parcel = mockParcels[landId as keyof typeof mockParcels];
  
  if (!parcel) {
    return res.status(404).json({ success: false, error: 'Parcel not found' });
  }
  
  res.json({ success: true, data: formatHistoryForFrontend(parcel) });
});

// Legacy Public APIs (keep for backward compatibility)
app.get('/api/public/parcel/:landId', (req: Request, res: Response) => {
  const { landId } = req.params;
  const parcel = mockParcels[landId as keyof typeof mockParcels];
  
  if (!parcel) {
    return res.status(404).json({ error: 'Parcel not found' });
  }
  
  res.json({ success: true, data: parcel });
});

app.get('/api/public/parcel/:landId/history', (req: Request, res: Response) => {
  const { landId } = req.params;
  const parcel = mockParcels[landId as keyof typeof mockParcels];
  
  if (!parcel) {
    return res.status(404).json({ error: 'Parcel not found' });
  }
  
  const mockHistory = [
    {
      eventId: `${landId}-EVENT-001`,
      landId: landId,
      transferType: 'LEGACY_CONVERSION',
      fromOwner: 'Legacy System',
      toOwner: parcel.currentOwner,
      transferDate: parcel.registeredAt,
      saleAmount: 0,
      remarks: 'Initial registration from legacy system',
    },
  ];
  
  res.json({ success: true, data: mockHistory });
});

app.post('/api/public/document/verify', (req: Request, res: Response) => {
  const { docId, hash } = req.body;
  
  // Mock verification - always successful
  res.json({
    success: true,
    data: {
      verified: true,
      docId,
      storedHash: hash,
      message: 'Document hash verified (mock)',
    },
  });
});

// Parcel management (protected endpoints - mock)
app.post('/api/parcels', (req: Request, res: Response) => {
  const parcelData = req.body;
  const landId = `MOCK-${Date.now()}`;
  
  res.json({
    success: true,
    data: {
      landId,
      message: 'Parcel created successfully (mock)',
      ...parcelData,
    },
  });
});

app.get('/api/parcels/owner/:ownerId', (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const parcels = Object.values(mockParcels).filter(
    p => p.currentOwner.toLowerCase().includes(ownerId.toLowerCase())
  );
  
  res.json({ success: true, count: parcels.length, data: parcels });
});

app.get('/api/parcels/district/:district', (req: Request, res: Response) => {
  const { district } = req.params;
  const parcels = Object.values(mockParcels).filter(
    p => p.district.toLowerCase().includes(district.toLowerCase())
  );
  
  res.json({ success: true, count: parcels.length, data: parcels });
});

app.get('/api/parcels/status/:status', (req: Request, res: Response) => {
  const { status } = req.params;
  const parcels = Object.values(mockParcels).filter(
    p => p.status === status.toUpperCase()
  );
  
  res.json({ success: true, count: parcels.length, data: parcels });
});

// Transfer operations
app.post('/api/parcels/:landId/transfer/propose', (req: Request, res: Response) => {
  const { landId } = req.params;
  const { newOwner, saleAmount } = req.body;
  
  res.json({
    success: true,
    data: {
      eventId: `TRANSFER-${Date.now()}`,
      landId,
      newOwner,
      saleAmount,
      status: 'PROPOSED',
      message: 'Transfer proposed successfully (mock)',
    },
  });
});

app.post('/api/parcels/:landId/transfer/finalize', (req: Request, res: Response) => {
  const { landId } = req.params;
  const { eventId, stampDuty, registrationFee } = req.body;
  
  res.json({
    success: true,
    data: {
      eventId,
      landId,
      stampDuty,
      registrationFee,
      status: 'COMPLETED',
      message: 'Transfer finalized successfully (mock)',
    },
  });
});

// Dispute management
app.post('/api/disputes', (req: Request, res: Response) => {
  const { landId, disputeType, description } = req.body;
  
  res.json({
    success: true,
    data: {
      disputeId: `DISPUTE-${Date.now()}`,
      landId,
      disputeType,
      description,
      status: 'OPEN',
      raisedAt: new Date().toISOString(),
      message: 'Dispute raised successfully (mock)',
    },
  });
});

app.get('/api/disputes/:disputeId', (req: Request, res: Response) => {
  const { disputeId } = req.params;
  
  res.json({
    success: true,
    data: {
      disputeId,
      landId: 'MH-MUM-001',
      disputeType: 'BOUNDARY',
      description: 'Mock dispute record',
      status: 'OPEN',
      raisedAt: new Date().toISOString(),
    },
  });
});

app.post('/api/disputes/:disputeId/resolve', (req: Request, res: Response) => {
  const { disputeId } = req.params;
  const { resolution } = req.body;
  
  res.json({
    success: true,
    data: {
      disputeId,
      resolution,
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      message: 'Dispute resolved successfully (mock)',
    },
  });
});

// Mortgage/Bank operations
app.post('/api/bank/mortgage', (req: Request, res: Response) => {
  const { landId, loanAmount, bankName } = req.body;
  
  res.json({
    success: true,
    data: {
      mortgageId: `MORT-${Date.now()}`,
      landId,
      loanAmount,
      bankName,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      message: 'Mortgage created successfully (mock)',
    },
  });
});

app.post('/api/bank/mortgage/:mortgageId/close', (req: Request, res: Response) => {
  const { mortgageId } = req.params;
  
  res.json({
    success: true,
    data: {
      mortgageId,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      message: 'Mortgage closed successfully (mock)',
    },
  });
});

app.get('/api/bank/mortgage/land/:landId', (req: Request, res: Response) => {
  const { landId } = req.params;
  
  if (landId === 'DL-NEW-004' || landId === 'KA-BLR-003') {
    res.json({
      success: true,
      data: [{
        mortgageId: 'MORT-001',
        landId,
        bankName: 'State Bank of India',
        loanAmount: 25000000,
        status: 'ACTIVE',
        createdAt: '2024-04-01T00:00:00Z',
      }],
    });
  } else {
    res.json({ success: true, data: [] });
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   Land Registry API - DEVELOPMENT MODE              ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Mode: MOCK (No Blockchain Required)`);
  console.log('');
  console.log('📦 Sample Parcels Available:');
  console.log('   • MH-MUM-001 (Mumbai - Residential)');
  console.log('   • KA-BLR-003 (Bangalore - Commercial)');
  console.log('   • PB-LDH-002 (Ludhiana - Agricultural)');
  console.log('   • DL-NEW-004 (Delhi - Mortgaged)');
  console.log('');
  console.log('🧪 Try:');
  console.log(`   curl http://localhost:${PORT}/api/public/parcel/MH-MUM-001`);
  console.log('');
});
