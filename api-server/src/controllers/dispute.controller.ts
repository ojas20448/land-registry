import { Request, Response } from 'express';
import { fabricGateway } from '../services/fabric-gateway.service';

/**
 * Dispute Controller
 * Handles dispute related API endpoints
 */
export class DisputeController {
  /**
   * POST /api/v1/disputes
   * Raise a new dispute
   */
  async raiseDispute(req: Request, res: Response): Promise<void> {
    try {
      const {
        disputeId,
        landId,
        disputeType,
        filedBy,
        filedByName,
        description,
        courtCaseId,
        filedAgainst,
        filedAgainstName,
      } = req.body;

      await fabricGateway.raiseDispute(
        disputeId,
        landId,
        disputeType,
        filedBy,
        filedByName,
        description,
        courtCaseId,
        filedAgainst,
        filedAgainstName
      );

      res.status(201).json({
        success: true,
        message: 'Dispute raised successfully',
        data: { disputeId, landId },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to raise dispute',
      });
    }
  }

  /**
   * PUT /api/v1/disputes/:id/resolve
   * Resolve a dispute
   */
  async resolveDispute(req: Request, res: Response): Promise<void> {
    try {
      const { id: disputeId } = req.params;
      const { resolutionDetails, reassignOwner, reassignOwnerName } = req.body;

      await fabricGateway.resolveDispute(
        disputeId,
        resolutionDetails,
        reassignOwner,
        reassignOwnerName
      );

      res.status(200).json({
        success: true,
        message: 'Dispute resolved successfully',
        data: { disputeId },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to resolve dispute',
      });
    }
  }
}

export const disputeController = new DisputeController();
