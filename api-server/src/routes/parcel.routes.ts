import { Router } from 'express';
import { parcelController } from '../controllers/parcel.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Parcel Routes
 */

// Get parcel by ID
router.get('/:id', parcelController.getParcel.bind(parcelController));

// Get ownership history
router.get('/:id/history', parcelController.getOwnershipHistory.bind(parcelController));

// Create new parcel (with optional document upload)
router.post('/', upload.single('document'), parcelController.createParcel.bind(parcelController));

// Propose sale transfer (with sale deed document)
router.post('/:id/propose-sale', upload.single('document'), parcelController.proposeSaleTransfer.bind(parcelController));

// Finalize sale transfer
router.post('/:id/finalize-sale', parcelController.finalizeSaleTransfer.bind(parcelController));

// Query parcels by owner
router.get('/search/owner/:ownerId', parcelController.queryByOwner.bind(parcelController));

// Query parcels by status
router.get('/search/status/:status', parcelController.queryByStatus.bind(parcelController));

// Query parcels by district
router.get('/search/district/:state/:district', parcelController.queryByDistrict.bind(parcelController));

export const parcelRoutes = router;
