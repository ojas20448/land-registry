import { Router } from 'express';
import { mortgageController } from '../controllers/mortgage.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Mortgage/Bank Routes
 */

// Create a new mortgage (with optional sanction letter)
router.post('/mortgage', upload.single('document'), mortgageController.createMortgage.bind(mortgageController));

// Close a mortgage
router.delete('/mortgage/:id', mortgageController.closeMortgage.bind(mortgageController));

// Get encumbrance certificate
router.get('/parcels/:id/encumbrance', mortgageController.getEncumbranceCertificate.bind(mortgageController));

export const mortgageRoutes = router;
