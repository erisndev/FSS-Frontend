import React, { useState } from "react";
import { teamMemberApi } from "../../services/api";
import toast from "react-hot-toast";

const EditPermissionsModal = ({
  member,
  organizationId,
  onClose,
  onSuccess,
}) => {
  const [permissions, setPermissions] = useState(member.permissions || {});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await teamMemberApi.updateMemberPermissions(organizationId, member._id, {
        permissions,
      });
      toast.success("Permissions updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  const permissionLabels = {
    canCreateTenders: "Create Tenders",
    canEditTenders: "Edit Tenders",
    canDeleteTenders: "Delete Tenders",
    canViewApplications: "View Applications",
    canAcceptReject: "Accept/Reject Applications",
    canManageVerificationRequests: "Manage Verification Requests",
    canManageTeam: "Manage Team",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-slate-900 border border-cyan-400/20 rounded-xl p-6 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Edit Permissions</h2>
        <p className="text-gray-400 mb-4">
          {member.user?.name} ({member.user?.email})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {Object.entries(permissionLabels).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center space-x-3 p-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={permissions[key] || false}
                  onChange={(e) =>
                    setPermissions({
                      ...permissions,
                      [key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-cyan-500 bg-slate-700 border-cyan-400/20 rounded focus:ring-cyan-500"
                />
                <span className="text-white text-sm">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPermissionsModal;
