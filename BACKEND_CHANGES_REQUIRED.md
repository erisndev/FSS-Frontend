# Backend changes required: Tender & Application Documents

This frontend update introduces **two standardized document sets**:

## 1) Issuers’ Issued Documents (Tender documents)
Used when **issuer creates/edits/views** a tender and when **bidder views** a tender.

Required tender documents (10):
1. Terms of Reference Document
2. SBD 1
3. SBD 2
4. SBD 4 Declaration of interest
5. SBD 6.1
6. Bid Technical Submission Template
7. Bid Financial Submission Template
8. Annexure 1
9. Annexure 2
10. Annexure 3

### Expected backend representation
Pick ONE representation and keep it consistent across APIs.

**Option A (recommended): array of objects**
```json
{
  "documents": [
    { "label": "Terms of Reference Document", "url": "...", "name": "...", "size": 12345 },
    { "label": "SBD 1", "url": "..." }
  ]
}
```
Notes:
- `label` must match exactly.
- `url` must be a downloadable link.
- `name`, `originalName`, `size` are optional but supported by the UI.

**Option B: object keyed by field name**
```json
{
  "documents": {
    "termsOfReference": { "url": "...", "name": "...", "size": 123 },
    "sbd1": { "url": "..." },
    "annexure3": "https://.../annexure3.pdf"
  }
}
```
If you choose this option, the keys MUST be:
- `termsOfReference`
- `sbd1`
- `sbd2`
- `sbd4DeclarationOfInterest`
- `sbd61`
- `bidTechnicalSubmissionTemplate`
- `bidFinancialSubmissionTemplate`
- `annexure1`
- `annexure2`
- `annexure3`

### Tender create/update endpoints
- Accept file uploads for the 10 tender documents.
- On update:
  - allow replacing individual docs
  - allow removing a doc (set null)

### Migration
If existing tenders currently store 5 docs (Bid File Documents, Compiled Documents, Financial Documents, Technical Proposal, Proof of Experience), decide one of:
- migrate old labels into the new set where applicable, OR
- keep legacy tenders as-is but ensure the API returns documents in the new shape for new tenders.

---

## 2) Bidders’ Required Documents (Application / Compliance documents)
Used when **bidder creates/views** an application and when **issuer views** an application.

Compliance documents required (16):
1. Tax Clearance / Tax Pin from SARS
2. CSD
3. BBBEE Certificate / Sworn Affidavit
4. Proof of Business Address
5. SBD 1
6. SBD 2
7. SBD 4
8. SBD 6.1
9. Bid Technical Submission
10. Bid Financial Submission
11. CIPC Documents
12. Certified ID Copies of all directors
13. Company Experience / References (20)
14. Appropriate Qualifications, Skills, Knowledge (Attach Full CVs) (20)
15. Proposed Project Plan & Scope of Work (30)
16. Approach and Methodology (30)

### Expected backend representation
Similar recommendation as tender documents.

**Recommended: array of uploaded documents**
```json
{
  "complianceDocuments": [
    { "label": "Tax Clearance / Tax Pin from SARS", "url": "..." },
    { "label": "CSD", "url": "..." }
  ]
}
```

Alternative keyed object:
```json
{
  "complianceDocuments": {
    "taxClearance": { "url": "..." },
    "csd": { "url": "..." }
  }
}
```
Keys must be:
- `taxClearance`, `csd`, `bbbee`, `proofOfBusinessAddress`, `sbd1`, `sbd2`, `sbd4`, `sbd61`,
  `bidTechnicalSubmission`, `bidFinancialSubmission`, `cipcDocuments`, `certifiedIdCopies`,
  `companyExperience`, `qualificationsSkillsKnowledge`, `proposedProjectPlan`, `approachAndMethodology`

### Application endpoints
- When creating/updating an application, accept uploads for the 16 compliance docs.
- When viewing an application (issuer or bidder), return the compliance docs with `label` and `url`.

### Validation
- Backend should validate that ALL required compliance documents are present before allowing final submission (if you have a draft vs submitted state).
- Ensure max file size limits and allowed file types match frontend constraints.

---

## Frontend assumptions
- Tender documents are displayed in `ViewTenderModal` under **Issuer Issued Documents**.
- Tender edit screen (`EditTender`) renders upload slots based on the 10-document list.
- Labels are treated as stable identifiers in the array format.

