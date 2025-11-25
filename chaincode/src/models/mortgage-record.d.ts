/**
 * Mortgage Record Model
 * Tracks mortgages, loans, and encumbrances on land parcels
 */
export interface MortgageRecord {
    mortgageId: string;
    landId: string;
    mortgageType: string;
    status: string;
    borrower: string;
    borrowerName: string;
    lender: string;
    lenderName: string;
    loanAmount: number;
    interestRate: number;
    loanTenure: number;
    mortgageStartDate: string;
    mortgageEndDate?: string;
    sanctionLetterRef?: string;
    agreementRef?: string;
    outstandingAmount?: number;
    closureDate?: string;
    closureReason?: string;
    defaultDate?: string;
    recordedBy: string;
    lastUpdatedBy?: string;
    lastUpdatedAt?: string;
}
export declare function createMortgageRecord(mortgageId: string, landId: string, mortgageType: string, borrower: string, borrowerName: string, lender: string, lenderName: string, loanAmount: number, interestRate: number, loanTenure: number, recordedBy: string, sanctionLetterRef?: string, agreementRef?: string): MortgageRecord;
//# sourceMappingURL=mortgage-record.d.ts.map