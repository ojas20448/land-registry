import { Router, Request, Response } from 'express';
import { fabricGateway } from '../services/fabric-gateway.service';
import * as crypto from 'crypto';

const router = Router();

/**
 * Public Routes (No authentication required)
 */

// Get parcel details (public view)
router.get('/parcels/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parcel = await fabricGateway.getParcel(id);
    
    // Return limited public information
    const publicData = {
      landId: parcel.landId,
      surveyNumber: parcel.surveyNumber,
      state: parcel.state,
      district: parcel.district,
      tehsil: parcel.tehsil,
      village: parcel.village,
      pincode: parcel.pincode,
      area: parcel.area,
      areaUnit: parcel.areaUnit,
      currentOwnerName: parcel.currentOwnerName,
      status: parcel.status,
      landType: parcel.landType,
      ownershipHistoryCount: parcel.ownershipHistory.length,
      hasDisputes: parcel.disputeIds.length > 0,
      hasMortgages: parcel.mortgageIds.length > 0,
    };
    
    res.status(200).json({
      success: true,
      data: publicData,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message || 'Parcel not found',
    });
  }
});

// Get ownership history (public view)
router.get('/parcels/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await fabricGateway.getOwnershipHistory(id);
    
    // Return sanitized history (hide sensitive details)
    const publicHistory = history.map((event: any) => ({
      eventType: event.eventType,
      toOwnerName: event.toOwnerName,
      fromOwnerName: event.fromOwnerName,
      transactionDate: event.transactionDate,
      documentRef: event.documentRef,
    }));
    
    res.status(200).json({
      success: true,
      data: publicHistory,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message || 'History not found',
    });
  }
});

// Verify document hash
router.get('/verify/:landId/:documentHash', async (req: Request, res: Response) => {
  try {
    const { landId, documentHash } = req.params;
    
    const parcel = await fabricGateway.getParcel(landId);
    
    // Check if document hash exists in parcel documents
    const documentExists = parcel.documents.some(
      (doc: any) => doc.documentHash === documentHash
    );
    
    res.status(200).json({
      success: true,
      verified: documentExists,
      message: documentExists 
        ? 'Document hash verified successfully' 
        : 'Document hash not found in blockchain',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Verification failed',
    });
  }
});

export const publicRoutes = router;
