/**
 * Mortgage Record Model
 * Tracks mortgages, loans, and encumbrances on land parcels
 */
export interface MortgageRecord {
  mortgageId: string;          // Unique mortgage identifier
  landId: string;              // Reference to Land Parcel
  mortgageType: string;        // HOME_LOAN, AGRICULTURAL_LOAN, BUSINESS_LOAN, etc.
  status: string;              // ACTIVE, CLOSED, DEFAULTED
  borrower: string;            // Aadhaar ID of borrower (current owner)
  borrowerName: string;        // Human-readable name
  lender: string;              // Bank/NBFC entity ID
  lenderName: string;          // Bank name
  loanAmount: number;          // Principal amount in INR
  interestRate: number;        // Annual interest rate percentage
  loanTenure: number;          // Loan duration in months
  mortgageStartDate: string;   // ISO timestamp
  mortgageEndDate?: string;    // Expected/actual closure date
  sanctionLetterRef?: string;  // Document reference for sanction letter
  agreementRef?: string;       // Document reference for mortgage deed
  outstandingAmount?: number;  // Remaining principal + interest
  closureDate?: string;        // Date when mortgage was closed
  closureReason?: string;      // PAID, FORECLOSURE, TRANSFER, etc.
  defaultDate?: string;        // Date when borrower defaulted
  recordedBy: string;          // MSP ID of recording organization (Bank)
  lastUpdatedBy?: string;      // MSP ID of last updater
  lastUpdatedAt?: string;      // Last update timestamp
}

export function createMortgageRecord(
  mortgageId: string,
  landId: string,
  mortgageType: string,
  borrower: string,
  borrowerName: string,
  lender: string,
  lenderName: string,
  loanAmount: number,
  interestRate: number,
  loanTenure: number,
  recordedBy: string,
  sanctionLetterRef?: string,
  agreementRef?: string
): MortgageRecord {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + loanTenure);

  return {
    mortgageId,
    landId,
    mortgageType,
    status: 'ACTIVE',
    borrower,
    borrowerName,
    lender,
    lenderName,
    loanAmount,
    interestRate,
    loanTenure,
    mortgageStartDate: startDate.toISOString(),
    mortgageEndDate: endDate.toISOString(),
    sanctionLetterRef,
    agreementRef,
    outstandingAmount: loanAmount,
    recordedBy,
  };
}
