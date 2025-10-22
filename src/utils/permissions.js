// utils/permissions.js

export const canPerformTenderAction = (user, permissions, tender, action) => {
  if (user?.role === 'admin') return true;

  // Individual user (not part of organization)
  if (!user?.organizationId) {
    return tender?.createdBy === user?._id;
  }

  if (!permissions) return false;

  // Ensure same organization context when applicable
  if (tender && tender.organization && user.organizationId && tender.organization !== user.organizationId) {
    return false;
  }

  switch (action) {
    case 'create':
      return !!permissions.canCreateTenders;
    case 'edit':
      return !!permissions.canEditTenders;
    case 'delete':
      return !!permissions.canDeleteTenders;
    case 'view':
      return true;
    default:
      return false;
  }
};

export const canPerformApplicationAction = (user, permissions, tender, action) => {
  if (user?.role === 'admin') return true;

  if (!user?.organizationId) {
    return tender?.createdBy === user?._id;
  }

  if (!permissions) return false;

  if (tender && tender.organization && user.organizationId && tender.organization !== user.organizationId) {
    return false;
  }

  switch (action) {
    case 'view':
      return !!permissions.canViewApplications;
    case 'accept':
    case 'reject':
      return !!permissions.canAcceptReject;
    default:
      return false;
  }
};

export const canManageTeam = (user, permissions) => {
  if (user?.role === 'admin') return true;
  if (!user?.organizationId) return false;
  return !!permissions?.canManageTeam;
};

export const canManageVerifications = (user, permissions) => {
  if (user?.role === 'admin') return true;
  if (!user?.organizationId) return false;
  return !!permissions?.canManageVerificationRequests;
};

export const getPermissionLevel = (permissions) => {
  if (!permissions) return 'None';
  const {
    canCreateTenders,
    canEditTenders,
    canDeleteTenders,
    canViewApplications,
    canAcceptReject,
    canManageTeam,
  } = permissions;

  if (canManageTeam && canDeleteTenders) return 'Team Leader';
  if (canAcceptReject && canEditTenders && !canDeleteTenders) return 'Full Access';
  if (canCreateTenders && !canEditTenders) return 'Limited Access';
  if (canViewApplications && !canCreateTenders) return 'Viewer';
  return 'Custom';
};
