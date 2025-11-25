import { Request, Response } from 'express';
import { fabricGateway } from '../services/fabric-gateway.service';
import { digiLockerService } from '../services/digilocker.service';
import { biometricService } from '../services/biometric.service';

/**
 * Parcel Controller
 * Handles land parcel related API endpoints
 */
export class ParcelController {
  /**
   * GET /api/v1/parcels/:id
   * Get parcel details by ID
   */
  async getParcel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parcel = await fabricGateway.getParcel(id);
      
      res.status(200).json({
        success: true,
        data: parcel,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Parcel not found',
      });
    }
  }

  /**
   * GET /api/v1/parcels/:id/history
   * Get ownership history of a parcel
   */
  async getOwnershipHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await fabricGateway.getOwnershipHistory(id);
      
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'History not found',
      });
    }
  }

  /**
   * POST /api/v1/parcels
   * Create a new parcel (legacy data onboarding)
   */
  async createParcel(req: Request, res: Response): Promise<void> {
    try {
      const {
        landId,
        surveyNumber,
        state,
        district,
        tehsil,
        village,
        pincode,
        area,
        areaUnit,
        currentOwner,
        currentOwnerName,
        ownerType,
        landType,
      } = req.body;

      // Upload document if provided
      let documentHash, documentUri;
      if (req.file) {
        const uploadResult = await digiLockerService.uploadDocument(req.file, {
          documentType: 'ROR',
          ownerId: currentOwner,
          ownerName: currentOwnerName,
        });
        documentHash = uploadResult.hash;
        documentUri = uploadResult.uri;
      }

      await fabricGateway.createParcelFromLegacyData(
        landId,
        surveyNumber,
        state,
        district,
        tehsil,
        village,
        pincode,
        parseFloat(area),
        areaUnit,
        currentOwner,
        currentOwnerName,
        ownerType,
        landType,
        documentHash,
        documentUri
      );

      res.status(201).json({
        success: true,
        message: 'Parcel created successfully',
        data: { landId },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create parcel',
      });
    }
  }

  /**
   * POST /api/v1/parcels/:id/propose-sale
   * Propose a sale transfer
   */
  async proposeSaleTransfer(req: Request, res: Response): Promise<void> {
    try {
      const { id: landId } = req.params;
      const {
        newOwner,
        newOwnerName,
        registrationNumber,
        consideration,
        stampDuty,
        biometricData,
      } = req.body;

      // Verify biometric authentication
      let biometricVerified = false;
      if (biometricData) {
        const bioResult = await biometricService.verifyBiometric(
          newOwner,
          biometricData
        );
        biometricVerified = bioResult.verified;
      }

      // Upload sale deed document
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Sale deed document is required',
        });
        return;
      }

      const uploadResult = await digiLockerService.uploadDocument(req.file, {
        documentType: 'SALE_DEED',
        ownerId: newOwner,
        ownerName: newOwnerName,
        registrationNumber,
        consideration,
        stampDuty,
      });

      const transactionId = await fabricGateway.proposeSaleTransfer(
        landId,
        newOwner,
        newOwnerName,
        registrationNumber,
        parseFloat(consideration),
        parseFloat(stampDuty),
        uploadResult.hash,
        uploadResult.uri,
        biometricVerified
      );

      res.status(200).json({
        success: true,
        message: 'Sale transfer proposed successfully',
        data: {
          transactionId,
          landId,
          documentId: uploadResult.documentId,
          biometricVerified,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to propose sale transfer',
      });
    }
  }

  /**
   * POST /api/v1/parcels/:id/finalize-sale
   * Finalize a sale transfer
   */
  async finalizeSaleTransfer(req: Request, res: Response): Promise<void> {
    try {
      const { id: landId } = req.params;
      const { transactionId } = req.body;

      await fabricGateway.finalizeSaleTransfer(landId, transactionId);

      res.status(200).json({
        success: true,
        message: 'Sale transfer finalized successfully',
        data: { landId, transactionId },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to finalize sale transfer',
      });
    }
  }

  /**
   * GET /api/v1/parcels/search/owner/:ownerId
   * Query parcels by owner
   */
  async queryByOwner(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params;
      const parcels = await fabricGateway.queryParcelsByOwner(ownerId);
      
      res.status(200).json({
        success: true,
        data: parcels,
        count: parcels.length,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Query failed',
      });
    }
  }

  /**
   * GET /api/v1/parcels/search/status/:status
   * Query parcels by status
   */
  async queryByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const parcels = await fabricGateway.queryParcelsByStatus(status);
      
      res.status(200).json({
        success: true,
        data: parcels,
        count: parcels.length,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Query failed',
      });
    }
  }

  /**
   * GET /api/v1/parcels/search/district/:state/:district
   * Query parcels by district
   */
  async queryByDistrict(req: Request, res: Response): Promise<void> {
    try {
      const { state, district } = req.params;
      const parcels = await fabricGateway.queryParcelsByDistrict(state, district);
      
      res.status(200).json({
        success: true,
        data: parcels,
        count: parcels.length,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Query failed',
      });
    }
  }
}

export const parcelController = new ParcelController();
