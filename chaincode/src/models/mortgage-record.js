"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMortgageRecord = createMortgageRecord;
function createMortgageRecord(mortgageId, landId, mortgageType, borrower, borrowerName, lender, lenderName, loanAmount, interestRate, loanTenure, recordedBy, sanctionLetterRef, agreementRef) {
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
//# sourceMappingURL=mortgage-record.js.map