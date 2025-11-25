import { Router } from 'express';
import { disputeController } from '../controllers/dispute.controller';

const router = Router();

/**
 * Dispute Routes
 */

// Raise a new dispute
router.post('/', disputeController.raiseDispute.bind(disputeController));

// Resolve a dispute
router.put('/:id/resolve', disputeController.resolveDispute.bind(disputeController));

export const disputeRoutes = router;
