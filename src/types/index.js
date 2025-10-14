// Type definitions as JSDoc comments for better IntelliSense

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'bidder' | 'issuer' | 'admin'} role
 * @property {string} createdAt
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Tender
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {number} budget
 * @property {string} deadline
 * @property {'ACTIVE' | 'CLOSED' | 'CANCELLED'} status
 * @property {boolean} isUrgent
 * @property {TenderDocument[]} documents
 * @property {string} issuerId
 * @property {string} issuerName
 * @property {string} createdAt
 * @property {number} [applications.length]
 */

/**
 * @typedef {Object} TenderDocument
 * @property {string} id
 * @property {string} name
 * @property {string} url
 * @property {string} type
 * @property {number} size
 */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} tenderId
 * @property {string} tenderTitle
 * @property {string} bidderId
 * @property {string} bidderName
 * @property {string} bidderEmail
 * @property {'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'} status
 * @property {string} coverLetter
 * @property {number} proposedAmount
 * @property {ApplicationDocument[]} documents
 * @property {ApplicationComment[]} comments
 * @property {string} appliedAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ApplicationDocument
 * @property {string} id
 * @property {string} name
 * @property {string} url
 * @property {string} type
 * @property {number} size
 */

/**
 * @typedef {Object} ApplicationComment
 * @property {string} id
 * @property {string} message
 * @property {string} createdBy
 * @property {string} createdByName
 * @property {string} createdAt
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalTenders
 * @property {number} activeTenders
 * @property {number} totalApplications
 * @property {number} pendingApplications
 * @property {number} totalUsers
 * @property {number} activeUsers
 */

export {};
