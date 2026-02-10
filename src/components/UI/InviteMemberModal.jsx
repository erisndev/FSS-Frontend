import React, { useState } from "react";
import { Mail, User, Shield } from "lucide-react";
import { teamMemberApi } from "../../services/api";
import toast from "react-hot-toast";

const InviteMemberModal = ({ organizationId, presets, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    permissionPreset: "LIMITED_ACCESS",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invitationData = {
        ...formData,
        email: formData.email.toLowerCase().trim()
      };
      await teamMemberApi.sendInvitation(organizationId, invitationData);
      toast.success("Invitation sent successfully! The member will receive an email.");
      onSuccess();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(
        error?.response?.data?.message || "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-slate-900 border border-cyan-400/20 rounded-xl p-6 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Invite Team Member</h2>
        <p className="text-gray-400 text-sm mb-6">
          Send an invitation email to add a new member to your team
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
                placeholder="Enter member's full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
                placeholder="Enter member's email"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              An invitation link will be sent to this email
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Permission Level
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <select
                value={formData.permissionPreset}
                onChange={(e) =>
                  setFormData({ ...formData, permissionPreset: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
              >
                <option value="FULL_ACCESS">Full Access - Can do everything except manage team</option>
                <option value="LIMITED_ACCESS">Limited Access - Can create and edit tenders</option>
                <option value="VIEWER">Viewer Only - Can only view tenders and applications</option>
              </select>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-3">
            <p className="text-xs text-gray-300">
              <strong className="text-cyan-400">Note:</strong> The invited member will receive an email with a link to set their password and join your team. The invitation will expire in 7 days.
            </p>
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
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
