# Complete Land Registry System Guide
## A Non-Technical Guide to Understanding the System

---

## Table of Contents
1. [What is This System?](#what-is-this-system)
2. [How Does It Work?](#how-does-it-work)
3. [Understanding Smart Contracts](#understanding-smart-contracts)
4. [Understanding the Data Models](#understanding-the-data-models)
5. [Security & Access Control](#security--access-control)
6. [Complete Feature Guide](#complete-feature-guide)
7. [Admin Portal Guide](#admin-portal-guide)
8. [Technical Components](#technical-components)
9. [Running the System](#running-the-system)

---

## What is This System?

### The Problem It Solves
In traditional land registration systems:
- **Paper Records**: Land records are kept in physical registers that can be lost, damaged, or tampered with
- **Fraud**: Property documents can be forged, leading to fake ownership claims
- **Delays**: Transferring land ownership takes weeks or months due to manual processes
- **Disputes**: It's hard to track ownership history, leading to legal disputes
- **No Transparency**: Citizens can't easily verify ownership or check for mortgages

### The Solution
This is a **Blockchain-Based Land Registry System** that:
- Stores all land records on a **secure, tamper-proof digital ledger**
- Creates a **permanent, unchangeable history** of every property transaction
- Allows **instant verification** of land ownership
- Prevents **fraud and double-selling**
- Automates **transfer processes** with smart contracts
- Provides **transparent access** to land records for authorized parties

### Real-World Benefits
- **For Citizens**: Check land ownership online, faster property transactions
- **For Government**: Reduce fraud, automate processes, better tax collection
- **For Banks**: Instant mortgage verification, reduced risk
- **For Courts**: Complete ownership history for dispute resolution

---

## How Does It Work?

### The Blockchain Technology
Think of blockchain as a **digital notebook** that:
- Everyone can read (with permission)
- No one can erase or modify past entries
- Every change is recorded permanently
- Multiple organizations verify each entry

### System Architecture

```
┌─────────────────┐
│   Citizens      │  ← People use web portal to view land records
│   (Web Portal)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Server    │  ← Connects web portal to blockchain
│   (Express.js)  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│            BLOCKCHAIN NETWORK (Hyperledger Fabric)        │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Revenue    │  │ Registration │  │    Banks     │   │
│  │  Department  │  │  Department  │  │              │   │
│  │   (2 peers)  │  │   (1 peer)   │  │   (1 peer)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                            │
│  All organizations maintain copies of the blockchain      │
│  and verify transactions together                         │
└──────────────────────────────────────────────────────────┘
```

### Participating Organizations
1. **Revenue Department**: Records land ownership from old paper records
2. **Registration Department**: Registers property sales and transfers
3. **Banks**: Records mortgages and loans against properties
4. **GovTech**: System administrators and maintainers
5. **Public Gateway**: Provides read-only access to citizens

---

## Understanding Smart Contracts

### What is a Smart Contract?
A **smart contract** is like a **digital robot** that:
- Contains **rules and procedures** (like a legal contract)
- **Executes automatically** when conditions are met
- **Cannot be changed** once deployed
- **Enforces rules** without human intervention

### Our Main Smart Contract: `LandRegistryContract`

This is the **brain of the system**. It contains all the rules and functions for managing land records.

#### Location in Code
```
📁 chaincode/src/contracts/land-registry-contract.ts
```

---

## Understanding the Data Models

The system uses 5 main types of data records. Think of each as a **digital form** that stores specific information.

### 1. Land Parcel (The Property Record)

**What It Is**: The complete record of a piece of land, like a digital version of a property deed.

**Information Stored**:

#### Identity Information
- **Land ID**: Unique identifier (e.g., "MH-MUM-001")
- **Survey Number**: Government plot number
- **Khasra Number**: Additional plot reference used in some states

#### Location Details
- **State**: Maharashtra, Karnataka, etc.
- **District**: Mumbai, Bangalore, etc.
- **Tehsil**: Sub-district area
- **Village/City**: Specific locality
- **Pincode**: 6-digit postal code

#### Property Details
- **Area**: Size of the land (e.g., 1000 square meters)
- **Area Unit**: SQMT, ACRE, HECTARE
- **Boundaries**: North, South, East, West boundaries
- **GPS Coordinates**: Exact location on map

#### Ownership Information
- **Current Owner**: Owner's Aadhaar ID
- **Owner Name**: Person or company name
- **Owner Type**: Individual, Joint, Company, Trust, Government
- **Ownership History**: Complete chain of all previous owners

#### Property Classification
- **Land Type**: Residential, Commercial, Agricultural, Industrial, Forest
- **Land Use**: Current purpose (housing, farming, shop, etc.)
- **Status**: Active, Frozen, Under Dispute, Mortgaged

#### Financial Information
- **Market Value**: Current estimated price
- **Government Value**: Official circle rate
- **Property Tax**: Annual tax amount

#### Legal Information
- **Mortgages**: List of active loans against the property
- **Disputes**: List of active legal cases
- **Documents**: All related papers (sale deeds, court orders, etc.)

#### Special Flags
- **Is Government Land**: Yes/No
- **Is Tribal Land**: Yes/No (protected land)
- **Is Forest Land**: Yes/No (protected forest)

**Code Location**: `chaincode/src/models/land-parcel.ts`

---

### 2. Ownership Event (The Transaction Record)

**What It Is**: A record of each time the property changed hands, like a receipt for a sale.

**Information Stored**:

- **Event Type**: What happened
  - GENESIS: First record (from old paper records)
  - SALE: Property was sold
  - INHERITANCE: Passed to legal heir after death
  - GIFT: Donated to someone
  - COURT_ORDER: Court ordered transfer
  - MUTATION: Name change in records

- **Previous Owner**: Who owned it before (Aadhaar ID + Name)
- **New Owner**: Who owns it now (Aadhaar ID + Name)
- **Transaction Date**: Exact date and time
- **Registration Number**: Sub-registrar deed number
- **Sale Amount**: Price paid (if applicable)
- **Stamp Duty**: Tax paid on transfer
- **Witnesses**: People who witnessed the transaction
- **Biometric Verified**: Was fingerprint/iris scan done?
- **Document Reference**: Link to the actual sale deed document

**Example Ownership Chain**:
```
1. GENESIS (1980) → Ram Kumar receives from government
2. SALE (1995) → Sold to Vijay Sharma for ₹5,00,000
3. INHERITANCE (2015) → Passed to Raj Sharma (son)
4. SALE (2024) → Sold to Priya Patel for ₹75,00,000
```

**Code Location**: `chaincode/src/models/ownership-event.ts`

---

### 3. Mortgage Record (The Loan Record)

**What It Is**: A record of a bank loan secured against the property, like a lien.

**Information Stored**:

- **Mortgage ID**: Unique loan reference number
- **Land ID**: Which property is mortgaged
- **Mortgage Type**: 
  - Home Loan
  - Agricultural Loan
  - Business Loan
  - Loan Against Property

- **Borrower Information**:
  - Borrower's Aadhaar ID
  - Borrower's Name
  - Must be the current owner

- **Lender Information**:
  - Bank Name (e.g., SBI, HDFC, ICICI)
  - Bank Entity ID

- **Loan Details**:
  - **Loan Amount**: Principal borrowed (e.g., ₹30,00,000)
  - **Interest Rate**: Annual rate (e.g., 8.5%)
  - **Loan Tenure**: Duration in months (e.g., 240 months = 20 years)
  - **Start Date**: When loan began
  - **Expected End Date**: When it should be paid off
  - **Outstanding Amount**: How much is still owed

- **Status**:
  - ACTIVE: Loan is ongoing
  - CLOSED: Fully paid off
  - DEFAULTED: Borrower stopped paying

- **Documents**:
  - Sanction Letter: Bank's approval letter
  - Mortgage Deed: Legal agreement

**Important Rules**:
- Property cannot be sold while mortgage is active
- Owner can have multiple mortgages on same property
- Property status changes to "MORTGAGED"
- When loan is paid off, mortgage is closed and property becomes "ACTIVE" again

**Code Location**: `chaincode/src/models/mortgage-record.ts`

---

### 4. Dispute Record (The Legal Case Record)

**What It Is**: A record of any legal dispute or court case about the property.

**Information Stored**:

- **Dispute ID**: Unique case reference
- **Land ID**: Which property is disputed

- **Type of Dispute**:
  - BOUNDARY: Fight over property boundaries
  - OWNERSHIP: Multiple people claiming ownership
  - FRAUD: Fake documents or forgery
  - INHERITANCE: Family dispute over inheritance
  - ENCROACHMENT: Someone illegally using the land

- **Parties Involved**:
  - **Filed By**: Person who raised the complaint (Name + Aadhaar)
  - **Filed Against**: Person being accused (Name + Aadhaar)

- **Case Details**:
  - **Description**: What the dispute is about
  - **Filed Date**: When complaint was made
  - **Court Case ID**: Court reference number (if in court)
  - **Court Name**: Which court is handling it
  - **Police Complaint ID**: FIR number (if criminal case)

- **Status**:
  - OPEN: Just filed
  - UNDER_INVESTIGATION: Being investigated
  - IN_COURT: Case in court
  - RESOLVED: Settled
  - DISMISSED: Case thrown out

- **Resolution**:
  - **Resolution Date**: When it was resolved
  - **Resolution Details**: What was decided
  - **New Owner**: If court ordered property transfer

- **Property Impact**:
  - **Freeze Parcel**: Property is frozen (cannot be sold/mortgaged)
  - When dispute opens → Property status becomes "UNDER_DISPUTE"
  - When dispute resolves → Property status becomes "ACTIVE" again

**Code Location**: `chaincode/src/models/dispute-record.ts`

---

### 5. Document Reference (The Document Record)

**What It Is**: A record pointing to actual documents (PDFs, images) stored securely.

**Why Not Store Documents on Blockchain?**
- Documents are large files (PDFs can be MBs)
- Blockchain is expensive for large data
- Documents are stored in secure cloud storage (DigiLocker or IPFS)
- Blockchain only stores the **fingerprint** (hash) of the document

**Information Stored**:

- **Document ID**: Unique identifier
- **Document Hash**: Digital fingerprint (SHA-256)
  - Like a unique signature for the file
  - If document changes even 1 bit, hash changes completely
  - Used to verify document is authentic and unmodified

- **Document Type**:
  - SALE_DEED: Property sale agreement
  - MORTGAGE_DEED: Loan agreement
  - COURT_ORDER: Court judgment
  - ROR: Record of Rights (old government record)
  - SANCTION_LETTER: Bank's loan approval
  - IDENTITY_PROOF: Aadhaar, PAN, etc.

- **Storage Location**:
  - **Storage URI**: Where document is stored
    - DigiLocker URI: `digilocker://user123/doc456`
    - IPFS Hash: `ipfs://Qm...`

- **Metadata**:
  - **Uploaded Date**: When it was added
  - **Uploaded By**: Who uploaded it
  - **Issued By**: Which organization issued it
  - **File Size**: Size in bytes
  - **Registration Number**: Official document number

**How Verification Works**:
1. Download document from storage
2. Calculate its hash
3. Compare with hash stored on blockchain
4. If they match → Document is authentic
5. If they don't match → Document was tampered with

**Code Location**: `chaincode/src/models/document-ref.ts`

---

## Security & Access Control

### Role-Based Permissions

Different organizations have different permissions. Think of it like keys to different rooms.

#### Organization Roles

**Code Location**: `chaincode/src/utils/access-control.ts`

| Organization | MSP ID | What They Can Do |
|--------------|--------|------------------|
| **Revenue Department** | `OrgRevenueMSP` | Create land parcels from old records, Raise disputes, Resolve disputes |
| **Registration Department** | `OrgRegistrationMSP` | Create land parcels, Transfer ownership (sales), Issue sale deeds |
| **Banks** | `OrgBankMSP` | Create mortgages, Close mortgages, Check property status |
| **GovTech (Admin)** | `OrgGovTechMSP` | Initialize system, View everything, Resolve disputes, Full admin access |
| **Public Gateway** | `OrgPublicGatewayMSP` | View land records (read-only), Check ownership history |

#### Permission Matrix

| Action | Revenue | Registration | Bank | GovTech | Public |
|--------|---------|--------------|------|---------|--------|
| Create Land Parcel | ✅ | ✅ | ❌ | ✅ | ❌ |
| Transfer Ownership | ❌ | ✅ | ❌ | ✅ | ❌ |
| Create Mortgage | ❌ | ❌ | ✅ | ❌ | ❌ |
| Close Mortgage | ❌ | ❌ | ✅ | ❌ | ❌ |
| Raise Dispute | ✅ | ❌ | ❌ | ✅ | ❌ |
| Resolve Dispute | ✅ | ❌ | ❌ | ✅ | ❌ |
| View Records | ✅ | ✅ | ✅ | ✅ | ✅ |

### How Security Works

1. **Digital Certificates**: Each organization has a digital ID (X.509 certificate)
2. **MSP ID Check**: System checks which organization is making the request
3. **Permission Validation**: Smart contract verifies if organization has permission
4. **Access Denied**: If no permission, transaction is rejected

**Example**:
```
Bank tries to transfer ownership → Access Denied
(Only Registrar can transfer ownership)

Registrar tries to create mortgage → Access Denied
(Only Banks can create mortgages)
```

---

## Complete Feature Guide

### Feature 1: Create Land Parcel from Legacy Data

**What It Does**: Converts old paper records (Record of Rights) into digital blockchain records.

**Who Can Do It**: Revenue Department or Registration Department

**Smart Contract Function**: `CreateParcelFromLegacyData`

**Process**:
1. Revenue officer takes old land register
2. Enters all property details (survey number, location, area, owner)
3. Uploads scanned copy of old Record of Rights
4. System creates "GENESIS" ownership event (first record)
5. Property is saved on blockchain with status "ACTIVE"

**Business Rules**:
- Land ID must be unique (cannot create duplicate)
- All mandatory fields must be filled
- Original document should be scanned and uploaded
- Genesis event marks the starting point of blockchain history

**Code Location**: `LandRegistryContract.CreateParcelFromLegacyData()`

---

### Feature 2: View Land Parcel Details

**What It Does**: Shows complete information about any property.

**Who Can Do It**: Everyone (with land ID)

**Smart Contract Function**: `GetParcel`

**What You Can See**:
- Current owner name and ID
- Property location and size
- Property type and status
- Market value
- Active mortgages
- Active disputes
- All attached documents

**Use Cases**:
- Citizen checking their property
- Buyer verifying property before purchase
- Bank checking property for loan
- Court checking property in dispute case

**Code Location**: `LandRegistryContract.GetParcel()`

---

### Feature 3: View Ownership History

**What It Does**: Shows complete chain of all previous owners.

**Who Can Do It**: Everyone

**Smart Contract Function**: `GetOwnershipHistory`

**What You See**:
```
Property: MH-MUM-001
Survey No: 123/4

Ownership Chain:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. GENESIS (01-Jan-1980)
   Owner: Ram Kumar
   Source: Government Allotment
   ────────────────────────────────────

2. SALE (15-Mar-1995)
   From: Ram Kumar
   To: Vijay Sharma
   Amount: ₹5,00,000
   Stamp Duty: ₹25,000
   Registration No: REG/1995/123
   ────────────────────────────────────

3. INHERITANCE (20-Aug-2015)
   From: Vijay Sharma (deceased)
   To: Raj Sharma (son)
   Court Order: INH/2015/456
   ────────────────────────────────────

4. SALE (10-Nov-2024)
   From: Raj Sharma
   To: Priya Patel
   Amount: ₹75,00,000
   Stamp Duty: ₹3,75,000
   Registration No: REG/2024/789
   Biometric Verified: ✓
```

**Benefits**:
- Proves clear title (no gaps in ownership)
- Helps resolve inheritance disputes
- Shows price history
- Verifies legitimacy of ownership

**Code Location**: `LandRegistryContract.GetOwnershipHistory()`

---

### Feature 4: Property Sale Transfer

**What It Does**: Officially transfers property from seller to buyer.

**Who Can Do It**: Registration Department (Sub-Registrar)

**Process**: Two-step workflow

#### Step 1: Propose Sale Transfer

**Smart Contract Function**: `ProposeSaleTransfer`

**What Happens**:
1. Buyer and Seller visit Sub-Registrar office
2. Both provide Aadhaar cards (biometric verification)
3. Registrar checks property status:
   - ✅ Must be ACTIVE (not frozen or disputed)
   - ✅ No active mortgages
   - ✅ Seller must be current owner
4. Sale deed is executed (legal document)
5. Sale deed is scanned and uploaded
6. System records:
   - Who owned before (seller)
   - Who owns now (buyer)
   - Sale price
   - Stamp duty paid
   - Registration number
   - Biometric verification done
7. Ownership is transferred immediately
8. System emits "OwnershipTransferred" event

#### Step 2: Finalize Sale Transfer

**Smart Contract Function**: `FinalizeSaleTransfer`

**What Happens**:
- Registrar confirms transaction
- Property officially changes hands
- New owner can now exercise ownership rights

**Business Rules**:
- Property cannot be in "FROZEN" or "UNDER_DISPUTE" status
- Property cannot have active mortgages (must be paid off first)
- Seller must be the current owner
- Biometric verification is mandatory for high-value transactions
- Stamp duty must be paid as per government rates

**Documents Generated**:
- Sale deed document reference
- Ownership event record
- Transaction receipt

**Code Location**: 
- `LandRegistryContract.ProposeSaleTransfer()`
- `LandRegistryContract.FinalizeSaleTransfer()`

---

### Feature 5: Raise Dispute

**What It Does**: Files a legal dispute and freezes the property.

**Who Can Do It**: Revenue Department or GovTech

**Smart Contract Function**: `RaiseDispute`

**When Used**:
- Someone claims fake documents were used
- Boundary dispute between neighbors
- Multiple people claiming ownership
- Inheritance dispute among family members
- Government notices illegal construction

**Process**:
1. Complainant files complaint with Revenue Department
2. Revenue officer creates dispute record:
   - Dispute type (Fraud, Ownership, Boundary, etc.)
   - Complainant details
   - Defendant details (if known)
   - Description of issue
   - Court case number (if filed)
   - Police FIR (if criminal case)
3. System immediately:
   - Creates dispute record on blockchain
   - Changes property status to "UNDER_DISPUTE"
   - Freezes the property (no sale/mortgage allowed)
   - Emits "DisputeRaised" event

**Effect of Dispute**:
- ❌ Property cannot be sold
- ❌ Property cannot be mortgaged
- ❌ No transfers allowed
- ✅ Can only be unfrozen after dispute is resolved

**Code Location**: `LandRegistryContract.RaiseDispute()`

---

### Feature 6: Resolve Dispute

**What It Does**: Closes a dispute and optionally transfers ownership based on court order.

**Who Can Do It**: Revenue Department or GovTech

**Smart Contract Function**: `ResolveDispute`

**Process**:

#### Case 1: Dispute Resolved, Owner Unchanged
```
Example: Boundary dispute settled amicably

1. Court/Revenue gives judgment
2. Revenue officer enters resolution details
3. System:
   - Marks dispute as "RESOLVED"
   - Checks if any other disputes exist
   - If no more disputes: Property status → "ACTIVE"
   - Property is unfrozen
```

#### Case 2: Dispute Resolved, Owner Changed by Court
```
Example: Court finds documents were fake, orders transfer

1. Court gives order to transfer property to rightful owner
2. Revenue officer enters:
   - Resolution details
   - New owner details (as per court order)
3. System:
   - Marks dispute as "RESOLVED"
   - Creates "COURT_ORDER" ownership event
   - Transfers property to new owner
   - Changes status to "ACTIVE"
   - Property is unfrozen
```

**Business Rules**:
- Only authorized departments can resolve
- Resolution details must be entered
- If court orders ownership change, new owner must be specified
- Property remains frozen until ALL disputes are resolved
- If multiple disputes exist, property stays frozen until all are closed

**Code Location**: `LandRegistryContract.ResolveDispute()`

---

### Feature 7: Create Mortgage

**What It Does**: Records a bank loan against the property.

**Who Can Do It**: Banks only

**Smart Contract Function**: `CreateMortgage`

**When Used**:
- Person takes home loan
- Farmer takes agricultural loan
- Business owner takes loan against property

**Process**:
1. Person applies for loan at bank
2. Bank verifies property ownership on blockchain
3. Bank checks:
   - ✅ Property status is "ACTIVE" (not frozen/disputed)
   - ✅ Loan applicant is current owner
   - ✅ No fraud cases
4. Bank sanctions loan
5. Bank creates mortgage record:
   - Loan amount
   - Interest rate
   - Loan tenure
   - Sanction letter
6. System:
   - Creates mortgage record
   - Links it to property
   - Changes property status to "MORTGAGED"
   - Emits "MortgageCreated" event

**Mortgage Details Stored**:
- **Borrower**: Property owner's Aadhaar + Name
- **Lender**: Bank name
- **Loan Amount**: e.g., ₹30,00,000
- **Interest Rate**: e.g., 8.5% per annum
- **Tenure**: e.g., 240 months (20 years)
- **Start Date**: When loan began
- **Outstanding Amount**: How much is owed
- **Status**: ACTIVE, CLOSED, DEFAULTED

**Business Rules**:
- Property cannot be in "FROZEN" or "UNDER_DISPUTE" status
- Borrower must be the current owner
- Property can have multiple mortgages (e.g., home loan + top-up loan)
- Property cannot be sold while any mortgage is active

**Code Location**: `LandRegistryContract.CreateMortgage()`

---

### Feature 8: Close Mortgage

**What It Does**: Marks mortgage as paid off and removes lien from property.

**Who Can Do It**: Banks only

**Smart Contract Function**: `CloseMortgage`

**When Used**:
- Person fully pays off home loan
- Loan tenure completes
- Person forecloses loan

**Process**:
1. Borrower pays final loan installment
2. Bank verifies all payments received
3. Bank closes mortgage in system:
   - Enters closure reason (PAID, FORECLOSURE, etc.)
   - Sets outstanding amount to zero
4. System:
   - Marks mortgage as "CLOSED"
   - Removes mortgage from property
   - If no other mortgages: Changes property status to "ACTIVE"
   - Emits "MortgageClosed" event

**Closure Reasons**:
- **PAID**: Loan fully repaid
- **FORECLOSURE**: Borrower paid early
- **TRANSFER**: Loan transferred to another bank
- **SETTLEMENT**: Settled at reduced amount

**Effect**:
- Property lien is removed
- Property can now be sold
- Owner gets clear title

**Code Location**: `LandRegistryContract.CloseMortgage()`

---

### Feature 9: Search Parcels by Owner

**What It Does**: Finds all properties owned by a person.

**Who Can Do It**: Everyone

**Smart Contract Function**: `QueryParcelsByOwner`

**Use Cases**:
- Person checking their own properties
- Government checking someone's land holdings
- Bank checking borrower's assets
- Court checking defendant's properties

**Input**: Owner's Aadhaar ID

**Output**: List of all properties owned

**Code Location**: `LandRegistryContract.QueryParcelsByOwner()`

---

### Feature 10: Search Parcels by Status

**What It Does**: Finds all properties with a specific status.

**Who Can Do It**: Government organizations

**Smart Contract Function**: `QueryParcelsByStatus`

**Use Cases**:
- Revenue finding all disputed properties
- Banks finding all mortgaged properties
- Government finding all frozen properties

**Statuses**:
- ACTIVE: Normal, transferable
- MORTGAGED: Has active loans
- UNDER_DISPUTE: Legal case ongoing
- FROZEN: Cannot be transferred
- GOVERNMENT_SEIZED: Taken by government

**Code Location**: `LandRegistryContract.QueryParcelsByStatus()`

---

### Feature 11: Search Parcels by Location

**What It Does**: Finds all properties in a specific district.

**Who Can Do It**: Everyone

**Smart Contract Function**: `QueryParcelsByDistrict`

**Use Cases**:
- Government statistics
- Real estate analysis
- Urban planning

**Input**: State + District

**Output**: All properties in that district

**Code Location**: `LandRegistryContract.QueryParcelsByDistrict()`

---

## Admin Portal Guide

The admin portal is a web interface for system administrators to manage the land registry.

### How to Access

1. **Start the System**:
   ```
   - API Server must be running on port 4000
   - UI Server must be running on port 3000
   ```

2. **Open Admin Login**:
   ```
   http://localhost:3000/admin/login
   ```

3. **Login Credentials**:
   ```
   Username: admin
   Password: admin123
   ```

### Admin Portal Features

#### 1. Dashboard

**URL**: `http://localhost:3000/admin/dashboard`

**What You See**:

**Statistics Cards**:
- 📊 Total Parcels: Total number of land properties
- ✅ Active Parcels: Properties that can be transferred
- ⚠️ Disputed Parcels: Properties with legal cases
- 👥 Registered Users: Total users in system

**Charts**:
- **Pie Chart**: Parcel Status Distribution (Active, Mortgaged, Disputed)
- **Bar Chart**: System Statistics (Parcels, Users, Transactions)

**Code Location**: `ui-citizen-portal/src/pages/admin/Dashboard.tsx`

---

#### 2. Parcel Management

**URL**: `http://localhost:3000/admin/parcels`

**What You Can Do**:

**View All Properties**:
- Table showing all land parcels
- Columns: Land ID, Survey Number, Location, Area, Owner, Status

**Add New Property**:
1. Click "Add Parcel" button
2. Fill form:
   - Land ID
   - Survey Number
   - State, District, Tehsil, Village, Pincode
   - Area and unit
   - Owner details
   - Land type
3. Click "Create Parcel"

**Edit Property**:
1. Click Edit (pencil icon) on any property
2. Update any field
3. Click "Update Parcel"

**Delete Property**:
1. Click Delete (trash icon)
2. Confirm deletion
3. Property is removed

**Status Colors**:
- 🟢 Green: ACTIVE
- 🔵 Blue: MORTGAGED
- 🟠 Orange: UNDER_DISPUTE
- 🔴 Red: FROZEN

**Code Location**: `ui-citizen-portal/src/pages/admin/ParcelManagement.tsx`

---

#### 3. User Management

**URL**: `http://localhost:3000/admin/users`

**What You See**:
- Table of all registered users
- Search box to filter users
- Columns: User ID, Name, Email, Role, Status, Parcels Owned

**User Roles**:
- 👑 Admin: Full system access
- 🏛️ Government: Revenue/Registration officials
- 🏦 Bank Officer: Bank employees
- 👤 Citizen: Regular users

**User Status**:
- ✅ Active: Can use system
- ❌ Inactive: Blocked from system

**Code Location**: `ui-citizen-portal/src/pages/admin/UserManagement.tsx`

---

#### 4. Admin Layout

**Navigation Sidebar**:
- 📊 Dashboard: Statistics and overview
- 🏠 Parcel Management: Manage properties
- 👥 User Management: Manage users

**Top Bar**:
- Admin name
- Logout button

**Mobile View**:
- Hamburger menu (☰) opens sidebar
- Responsive design for phones/tablets

**Code Location**: `ui-citizen-portal/src/components/AdminLayout.tsx`

---

#### 5. Admin Authentication

**How It Works**:
1. User enters credentials
2. System checks username and password
3. If correct: 
   - Saves "adminAuth" token in browser
   - Redirects to dashboard
4. If incorrect:
   - Shows error message

**Protected Routes**:
- All admin pages require login
- If not logged in, redirected to login page
- Token stored in browser localStorage

**Logout**:
- Click Logout button
- Token is removed
- Redirected to login page

**Code Location**: 
- Login: `ui-citizen-portal/src/pages/admin/AdminLogin.tsx`
- Protection: `ui-citizen-portal/src/components/PrivateRoute.tsx`

---

## Technical Components

### 1. Chaincode (Smart Contract)

**Technology**: TypeScript + Hyperledger Fabric SDK

**Location**: `chaincode/src/`

**Structure**:
```
chaincode/src/
├── contracts/
│   └── land-registry-contract.ts    (Main smart contract)
├── models/
│   ├── land-parcel.ts               (Property data model)
│   ├── ownership-event.ts           (Transfer data model)
│   ├── mortgage-record.ts           (Loan data model)
│   ├── dispute-record.ts            (Dispute data model)
│   └── document-ref.ts              (Document data model)
└── utils/
    └── access-control.ts            (Security & permissions)
```

**What It Does**:
- Validates all transactions
- Enforces business rules
- Stores data on blockchain
- Emits events
- Controls access

**Programming Language**: TypeScript (compiles to JavaScript)

---

### 2. API Server

**Technology**: Node.js + Express.js

**Location**: `api-server/`

**What It Does**:
- Receives requests from web portal
- Connects to blockchain network
- Executes smart contract functions
- Returns results to web portal

**Current Mode**: Mock Mode (not connected to actual blockchain)

**API Endpoints**:

**Public Endpoints**:
```
GET /api/v1/public/parcels/:id          - Get parcel details
GET /api/v1/public/parcels/:id/history  - Get ownership history
```

**Admin Endpoints**:
```
GET  /api/v1/admin/stats                - Get statistics
GET  /api/v1/admin/parcels              - Get all parcels
POST /api/v1/admin/parcels              - Create parcel
PUT  /api/v1/admin/parcels/:landId      - Update parcel
DELETE /api/v1/admin/parcels/:landId    - Delete parcel
GET  /api/v1/admin/users                - Get all users
```

**Code Location**: `api-server/server.js`

---

### 3. Web Portal (Citizen Portal + Admin Portal)

**Technology**: React + TypeScript + Material-UI

**Location**: `ui-citizen-portal/`

**Components**:

**Citizen Portal** (Public):
- Home page
- Search properties
- View ownership history
- Check property status

**Admin Portal** (Protected):
- Dashboard with statistics
- Parcel management
- User management
- Login/Logout

**Styling**: Material-UI (Google's Material Design)
- Clean, modern interface
- Responsive (works on phone, tablet, desktop)
- Consistent colors and fonts

**Code Location**: `ui-citizen-portal/src/`

---

### 4. Blockchain Network

**Technology**: Hyperledger Fabric

**What It Is**: 
- Private, permissioned blockchain
- Only authorized organizations can participate
- Data is replicated across all organizations
- Consensus mechanism: Raft (multiple orderers vote)

**Network Components**:

**Peers** (Store data):
- Revenue Peer0, Peer1
- Registration Peer0
- Bank Peer0
- Each peer maintains full copy of blockchain

**Orderers** (Order transactions):
- Orderer0, Orderer1, Orderer2
- Use Raft consensus
- Ensure all peers get transactions in same order

**Certificate Authority**:
- Issues digital certificates
- Manages identities

**Database**:
- CouchDB (NoSQL document database)
- Stores blockchain state
- Enables rich queries

**Code Location**: `network/`

---

### 5. Configuration Files

**package.json**:
- Lists all software dependencies
- Defines build and run commands

**tsconfig.json**:
- TypeScript compiler settings

**connection-profile.yaml**:
- Blockchain network connection details
- Peer addresses, certificates

**docker-compose.yaml**:
- Defines how to run blockchain containers

**Code Location**: Various directories

---

## Running the System

### Prerequisites

**What You Need Installed**:
1. **Node.js** (version 18 or higher) - JavaScript runtime
2. **Docker Desktop** - To run blockchain containers
3. **Git** - Version control
4. **Windows 10/11** with **WSL2** - For Docker

### Step-by-Step Guide

#### Step 1: Install Dependencies

Open PowerShell and run:

```powershell
# Install chaincode dependencies
cd chaincode
npm install

# Install API server dependencies
cd ..\api-server
npm install

# Install UI dependencies
cd ..\ui-citizen-portal
npm install
```

**What This Does**: Downloads all required software libraries

---

#### Step 2: Start API Server

Open **Terminal 1** (PowerShell):

```powershell
cd api-server
node server.js
```

**Output**:
```
🚀 API Server running on port 4000
📡 Mock mode - using sample data
```

**What This Does**: Starts the API server that connects web portal to blockchain

**Leave This Terminal Open**

---

#### Step 3: Start UI Server

Open **Terminal 2** (PowerShell):

```powershell
cd ui-citizen-portal
npm run build
npx serve dist -l 3000 -s
```

**Output**:
```
Serving!
- Local: http://localhost:3000
- Network: http://192.168.1.100:3000
```

**What This Does**: 
1. Builds optimized production version
2. Starts web server
3. Serves the website

**Leave This Terminal Open**

---

#### Step 4: Access the System

Open your web browser:

**Citizen Portal**: 
```
http://localhost:3000
```

**Admin Portal**: 
```
http://localhost:3000/admin/login
```

**Admin Login**:
```
Username: admin
Password: admin123
```

---

#### Quick Start Script

We created a convenient batch file that starts everything automatically:

**File**: `start-system.bat`

**How to Use**:
1. Double-click `start-system.bat`
2. Two PowerShell windows will open
3. Wait 10 seconds for servers to start
4. Browser opens automatically

**What It Does**:
```batch
@echo off
echo Starting Land Registry System...

REM Start API Server
start "API Server" powershell -NoExit -Command "cd '%~dp0api-server'; node server.js"

REM Wait for API to start
timeout /t 5 /nobreak

REM Start UI Server
start "UI Server" powershell -NoExit -Command "cd '%~dp0ui-citizen-portal'; npx serve dist -l 3000 -s"

REM Wait for UI to start
timeout /t 5 /nobreak

REM Open browser
start http://localhost:3000

echo.
echo ===============================================
echo   Land Registry System Started Successfully
echo ===============================================
echo.
echo   Citizen Portal: http://localhost:3000
echo   Admin Portal:   http://localhost:3000/admin/login
echo.
echo   Admin Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo ===============================================
```

---

### Troubleshooting

#### Problem: Port Already in Use

**Error**: `Port 4000 is already in use`

**Solution**:
```powershell
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process (replace <PID> with actual process ID)
Stop-Process -Id <PID> -Force
```

---

#### Problem: API Server Not Running

**Symptom**: White blank page in admin portal

**Solution**: Restart API server
```powershell
cd api-server
node server.js
```

---

#### Problem: UI Server Not Running

**Symptom**: Cannot access http://localhost:3000

**Solution**: Restart UI server
```powershell
cd ui-citizen-portal
npx serve dist -l 3000 -s
```

---

#### Problem: Admin Login Not Working

**Solution**: Make sure UI server started with `-s` flag (SPA mode)
```powershell
npx serve dist -l 3000 -s
                          ^^^ Important!
```

---

### System Health Check

Run these commands to verify system is running:

```powershell
# Check if ports are listening
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Test API server
Invoke-WebRequest -Uri "http://localhost:4000/api/v1/admin/stats"

# Test UI server
Invoke-WebRequest -Uri "http://localhost:3000/admin/login"
```

**Expected Output**:
- Port 3000: LISTENING
- Port 4000: LISTENING
- API test: StatusCode 200
- UI test: StatusCode 200

---

## Summary

This is a **comprehensive land registration system** that:

✅ **Stores land records securely** on blockchain  
✅ **Prevents fraud** through immutable history  
✅ **Automates processes** with smart contracts  
✅ **Provides transparency** to all stakeholders  
✅ **Manages ownership transfers** digitally  
✅ **Tracks mortgages and disputes** automatically  
✅ **Enables instant verification** of ownership  
✅ **Reduces corruption** through transparency  

**The system has 5 core data models**:
1. **Land Parcel** - The property itself
2. **Ownership Event** - Transfer history
3. **Mortgage Record** - Loans against property
4. **Dispute Record** - Legal cases
5. **Document Reference** - Digital documents

**The smart contract provides 11 key features**:
1. Create land parcels
2. View parcel details
3. View ownership history
4. Transfer ownership (sale)
5. Raise disputes
6. Resolve disputes
7. Create mortgages
8. Close mortgages
9. Search by owner
10. Search by status
11. Search by location

**Access is controlled by roles**:
- Revenue Department
- Registration Department
- Banks
- GovTech (Admin)
- Public Gateway

**The system consists of 5 technical components**:
1. Smart Contract (TypeScript)
2. API Server (Node.js/Express)
3. Web Portal (React)
4. Blockchain Network (Hyperledger Fabric)
5. Admin Portal (React/Material-UI)

---

## Getting Help

If you need assistance:

1. **Read this guide** - Answers most questions
2. **Check code comments** - Every file has explanations
3. **Look at README.md** - Quick technical reference
4. **Check error messages** - They often tell you what's wrong
5. **Ask for help** - Describe the problem and what you tried

---

**Document Version**: 1.0  
**Last Updated**: November 25, 2025  
**Author**: Land Registry System Team
