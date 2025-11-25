import { Request, Response } from 'express';
import { fabricGateway } from '../services/fabric-gateway.service';
import { digiLockerService } from '../services/digilocker.service';

/**
 * Mortgage Controller
 * Handles mortgage/encumbrance related API endpoints
 */
export class MortgageController {
  /**
   * POST /api/v1/bank/mortgage
   * Create a new mortgage
   */
  async createMortgage(req: Request, res: Response): Promise<void> {
    try {
      const {
        mortgageId,
        landId,
        mortgageType,
        borrower,
        borrowerName,
        lenderName,
        loanAmount,
        interestRate,
        loanTenure,
      } = req.body;

      // Upload sanction letter if provided
      let sanctionLetterHash, sanctionLetterUri;
      if (req.file) {
        const uploadResult = await digiLockerService.uploadDocument(req.file, {
          documentType: 'SANCTION_LETTER',
          ownerId: borrower,
          ownerName: borrowerName,
          mortgageId,
          loanAmount,
        });
        sanctionLetterHash = uploadResult.hash;
        sanctionLetterUri = uploadResult.uri;
      }

      await fabricGateway.createMortgage(
        mortgageId,
        landId,
        mortgageType,
        borrower,
        borrowerName,
        lenderName,
        parseFloat(loanAmount),
        parseFloat(interestRate),
        parseInt(loanTenure),
        sanctionLetterHash,
        sanctionLetterUri
      );

      res.status(201).json({
        success: true,
        message: 'Mortgage created successfully',
        data: { mortgageId, landId },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create mortgage',
      });
    }
  }

  /**
   * DELETE /api/v1/bank/mortgage/:id
   * Close a mortgage
   */
  async closeMortgage(req: Request, res: Response): Promise<void> {
    try {
      const { id: mortgageId } = req.params;
      const { closureReason } = req.body;

      await fabricGateway.closeMortgage(mortgageId, closureReason || 'PAID');

      res.status(200).json({
        success: true,
        message: 'Mortgage closed successfully',
        data: { mortgageId },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to close mortgage',
      });
    }
  }

  /**
   * GET /api/v1/bank/parcels/:id/encumbrance
   * Get encumbrance certificate for a parcel
   */
  async getEncumbranceCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { id: landId } = req.params;
      
      // Get parcel details
      const parcel = await fabricGateway.getParcel(landId);
      
      // Build encumbrance certificate
      const certificate = {
        landId: parcel.landId,
        surveyNumber: parcel.surveyNumber,
        currentOwner: parcel.currentOwner,
        currentOwnerName: parcel.currentOwnerName,
        status: parcel.status,
        mortgages: parcel.mortgageIds,
        disputes: parcel.disputeIds,
        isEncumbered: parcel.mortgageIds.length > 0 || parcel.disputeIds.length > 0,
        certificateDate: new Date().toISOString(),
      };

      res.status(200).json({
        success: true,
        data: certificate,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Failed to generate encumbrance certificate',
      });
    }
  }
}

export const mortgageController = new MortgageController();
