import { OwnershipEvent } from './ownership-event';
import { DocumentRef } from './document-ref';

/**
 * Land Parcel Model
 * Core entity representing a single land parcel in the registry
 */
export interface LandParcel {
  // Unique Identifiers
  landId: string;              // Unique blockchain identifier (composite key)
  surveyNumber: string;        // Government survey/plot number
  subDivisionNumber?: string;  // Sub-division if applicable
  khasraNumber?: string;       // Khasra number (used in some states)
  
  // Location Information
  state: string;               // State name
  district: string;            // District name
  tehsil: string;              // Tehsil/Taluka/Mandal
  village: string;             // Village/Town/City
  pincode: string;             // PIN code
  
  // Geographic Data
  area: number;                // Area in square meters
  areaUnit: string;            // SQMT, ACRE, HECTARE, etc.
  boundaries?: {
    north?: string;
    south?: string;
    east?: string;
    west?: string;
  };
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    polygon?: Array<{ lat: number; lng: number }>; // Boundary polygon
  };
  
  // Current State
  currentOwner: string;        // Current owner Aadhaar ID or entity ID
  currentOwnerName: string;    // Human-readable owner name
  ownerType: string;           // INDIVIDUAL, JOINT, COMPANY, TRUST, GOVERNMENT
  status: string;              // ACTIVE, FROZEN, UNDER_DISPUTE, MORTGAGED, GOVERNMENT_SEIZED
  
  // Classification
  landType: string;            // RESIDENTIAL, AGRICULTURAL, COMMERCIAL, INDUSTRIAL, FOREST
  landUse?: string;            // Current usage
  irrigationType?: string;     // For agricultural: IRRIGATED, RAIN_FED, etc.
  
  // Legal & Financial
  marketValue?: number;        // Estimated market value in INR
  governmentValue?: number;    // Circle rate / ready reckoner value
  annualPropertyTax?: number;  // Property tax liability
  
  // Ownership Chain
  ownershipHistory: OwnershipEvent[];  // Complete chain from genesis
  
  // Documents
  documents: DocumentRef[];    // All related documents
  
  // Encumbrances
  mortgageIds: string[];       // References to active mortgages
  disputeIds: string[];        // References to disputes
  
  // Metadata
  createdAt: string;           // Genesis creation timestamp
  createdBy: string;           // MSP ID of creating organization
  lastUpdatedAt: string;       // Last update timestamp
  lastUpdatedBy: string;       // MSP ID of last updater
  version: number;             // Version number for optimistic locking
  
  // Additional Info
  remarks?: string;            // Any additional notes
  isGovernmentLand: boolean;   // Whether owned by government
  isTribalLand: boolean;       // Whether protected tribal land
  isForestLand: boolean;       // Whether forest department land
}

export function createLandParcel(
  landId: string,
  surveyNumber: string,
  state: string,
  district: string,
  tehsil: string,
  village: string,
  pincode: string,
  area: number,
  areaUnit: string,
  currentOwner: string,
  currentOwnerName: string,
  ownerType: string,
  landType: string,
  createdBy: string,
  genesisOwnershipEvent: OwnershipEvent,
  genesisDocument?: DocumentRef
): LandParcel {
  const now = new Date().toISOString();
  
  return {
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
    status: 'ACTIVE',
    landType,
    ownershipHistory: [genesisOwnershipEvent],
    documents: genesisDocument ? [genesisDocument] : [],
    mortgageIds: [],
    disputeIds: [],
    createdAt: now,
    createdBy,
    lastUpdatedAt: now,
    lastUpdatedBy: createdBy,
    version: 1,
    isGovernmentLand: false,
    isTribalLand: false,
    isForestLand: false,
  };
}
