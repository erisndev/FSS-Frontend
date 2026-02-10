// Centralized document definitions used across tender creation/view and application submission.
// Keep labels stable because the backend stores/returns them.

export const ISSUER_ISSUED_DOCUMENTS = [
  { key: "termsOfReference", label: "Terms of Reference Document" },
  { key: "sbd1", label: "SBD 1" },
  { key: "sbd2", label: "SBD 2" },
  { key: "sbd4DeclarationOfInterest", label: "SBD 4 Declaration of interest" },
  { key: "sbd61", label: "SBD 6.1" },
  { key: "bidTechnicalSubmissionTemplate", label: "Bid Technical Submission Template" },
  { key: "bidFinancialSubmissionTemplate", label: "Bid Financial Submission Template" },
  { key: "annexure1", label: "Annexure 1" },
  { key: "annexure2", label: "Annexure 2" },
  { key: "annexure3", label: "Annexure 3" },
];

export const BIDDER_REQUIRED_DOCUMENTS = [
  { key: "taxClearance", label: "Tax Clearance / Tax Pin from SARS" },
  { key: "csd", label: "CSD" },
  { key: "bbbee", label: "BBBEE Certificate / Sworn Affidavit" },
  { key: "proofOfBusinessAddress", label: "Proof of Business Address" },
  { key: "sbd1", label: "SBD 1" },
  { key: "sbd2", label: "SBD 2" },
  { key: "sbd4", label: "SBD 4" },
  { key: "sbd61", label: "SBD 6.1" },
  { key: "bidTechnicalSubmission", label: "Bid Technical Submission" },
  { key: "bidFinancialSubmission", label: "Bid Financial Submission" },
  { key: "cipcDocuments", label: "CIPC Documents" },
  { key: "certifiedIdCopies", label: "Certified ID Copies of all directors" },
  { key: "companyExperience", label: "Company Experience / References (20)" },
  {
    key: "qualificationsSkillsKnowledge",
    label: "Appropriate Qualifications, Skills, Knowledge (Attach Full CVs) (20)",
  },
  {
    key: "proposedProjectPlan",
    label: "Proposed Project Plan & Scope of Work (30)",
  },
  { key: "approachAndMethodology", label: "Approach and Methodology (30)" },
];
