import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import {
  Users,
  Activity,
  Settings,
  BarChart3,
  UserPlus,
  Shield,
  Download,
  Search,
  TrendingUp,
  FileText,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import {
  teamMemberApi,
  organizationApi,
  activityLogApi,
} from "../../services/api";
import InviteMemberModal from "../../components/UI/InviteMemberModal";
import EditPermissionsModal from "../../components/UI/EditPermissionsModal";
import PendingInvitationCard from "../../components/UI/PendingInvitationCard";
import TeamMemberCard from "../../components/UI/TeamMemberCard";
import StatCard from "../../components/UI/StatCard";
import ActivityLogItem from "../../components/UI/ActivityLogItem";
import toast from "react-hot-toast";

const TeamManagement = () => {
  const { user, isTeamLeader } = useAuth();
  const [activeTab, setActiveTab] = useState("members");
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] =
    useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [permissionPresets, setPermissionPresets] = useState([]);
  const [activityFilters, setActivityFilters] = useState({
    search: "",
    memberId: "",
  });

  useEffect(() => {
    if (!isTeamLeader()) {
      toast.error("Access denied. Team leader privileges required.");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const organizationId = user.organizationId;

      const results = await Promise.allSettled([
        teamMemberApi.getTeamMembers(organizationId),
        teamMemberApi.getPendingInvitations(organizationId),
        organizationApi.getOrganization(organizationId),
        organizationApi.getOrganizationStats(organizationId),
        teamMemberApi.getPermissionPresets(),
      ]);

      // Extract team members
      let fetchedMembers = [];
      if (results[0].status === "fulfilled") {
        const response = results[0].value;
        // Backend returns array directly, not wrapped in { members: [...] }
        fetchedMembers = Array.isArray(response)
          ? response
          : response?.members || [];
      }
      setTeamMembers(fetchedMembers);

      // Extract pending invitations
      setPendingInvitations(
        results[1].status === "fulfilled"
          ? results[1].value.invitations || results[1].value || []
          : [],
      );
      setOrganization(
        results[2].status === "fulfilled"
          ? results[2].value.organization || {
              _id: organizationId,
              companyName: user.company || "",
              contactPhone: "",
              address: "",
            }
          : {
              _id: organizationId,
              companyName: user.company || "",
              contactPhone: "",
              address: "",
            },
      );

      const membersCount =
        results[0].status === "fulfilled"
          ? (results[0].value.members || []).length
          : 0;
      setStats(
        results[3].status === "fulfilled"
          ? results[3].value
          : {
              totalMembers: membersCount + 1,
              activeMembers: membersCount + 1,
              totalTenders: 0,
              activeTenders: 0,
            },
      );

      setPermissionPresets(
        results[4].status === "fulfilled" ? results[4].value.presets || [] : [],
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load some team data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const activitiesRes = await activityLogApi.getOrganizationActivities(
        user.organizationId,
      );
      setActivities(activitiesRes.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    }
  };

  useEffect(() => {
    if (activeTab === "activities" && isTeamLeader()) {
      fetchActivities();
    }
  }, [activeTab]);

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this team member?"))
      return;
    try {
      await teamMemberApi.removeTeamMember(user.organizationId, memberId);
      toast.success("Team member removed successfully");
      fetchData();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      await teamMemberApi.resendInvitation(user.organizationId, invitationId);
      toast.success("Invitation resent successfully");
      fetchData();
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error(
        error?.response?.data?.message || "Failed to resend invitation",
      );
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?"))
      return;
    try {
      await teamMemberApi.cancelInvitation(user.organizationId, invitationId);
      toast.success("Invitation cancelled successfully");
      fetchData();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error(
        error?.response?.data?.message || "Failed to cancel invitation",
      );
    }
  };

  const handleExportActivities = async () => {
    try {
      const data = await activityLogApi.exportActivities(user.organizationId);
      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-log-${new Date().toISOString()}.csv`;
      a.click();
      toast.success("Activity log exported successfully");
    } catch (error) {
      console.error("Error exporting activities:", error);
      toast.error(
        error?.response?.data?.message || "Export feature not available yet",
      );
    }
  };

  const tabs = [
    { id: "members", label: "Team Members", icon: Users },
    { id: "activities", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Organization", icon: Settings },
    { id: "stats", label: "Statistics", icon: BarChart3 },
  ];

  if (!isTeamLeader()) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-400">
              Only team leaders can access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Team Management
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Manage your team members, view activities, and configure settings
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-1">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {activeTab === "members" && (
                <TeamMembersTab
                  members={teamMembers}
                  pendingInvitations={pendingInvitations}
                  user={user}
                  onRemove={handleRemoveMember}
                  onEdit={(member) => {
                    setSelectedMember(member);
                    setShowEditPermissionsModal(true);
                  }}
                  onInvite={() => setShowInviteModal(true)}
                  onResendInvitation={handleResendInvitation}
                  onCancelInvitation={handleCancelInvitation}
                />
              )}

              {activeTab === "activities" && (
                <ActivityLogTab
                  activities={activities}
                  filters={activityFilters}
                  onFilterChange={setActivityFilters}
                  onExport={handleExportActivities}
                  members={teamMembers}
                />
              )}

              {activeTab === "settings" && (
                <OrganizationSettingsTab
                  organization={organization}
                  onUpdate={fetchData}
                />
              )}

              {activeTab === "stats" && <StatisticsTab stats={stats} />}
            </>
          )}
        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal
          organizationId={user.organizationId}
          presets={permissionPresets}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            fetchData();
          }}
        />
      )}

      {showEditPermissionsModal && selectedMember && (
        <EditPermissionsModal
          member={selectedMember}
          organizationId={user.organizationId}
          onClose={() => {
            setShowEditPermissionsModal(false);
            setSelectedMember(null);
          }}
          onSuccess={() => {
            setShowEditPermissionsModal(false);
            setSelectedMember(null);
            fetchData();
          }}
        />
      )}
    </DashboardLayout>
  );
};

// Team Members Tab Component
const TeamMembersTab = ({
  members,
  pendingInvitations,
  user,
  onRemove,
  onEdit,
  onInvite,
  onResendInvitation,
  onCancelInvitation,
}) => {
  // Create team leader card from current user
  const teamLeaderCard = {
    _id: user._id,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      lastLogin: user.lastLogin,
    },
    role: "team_leader",
    permissions: {
      canCreateTenders: true,
      canEditTenders: true,
      canDeleteTenders: true,
      canViewApplications: true,
      canAcceptReject: true,
      canManageTeam: true,
    },
    isActive: true,
    joinedAt: user.createdAt || new Date(),
  };

  // Check if team leader is already in the members list from backend
  const hasTeamLeader = members.some(
    (m) => m.role === "team_leader" || m.user?._id === user._id,
  );

  // Always show team leader first, then other members
  const allMembers = hasTeamLeader ? members : [teamLeaderCard, ...members];

  console.log("Team members from props:", members);
  console.log("Has team leader in list:", hasTeamLeader);
  console.log("All members to display:", allMembers);

  return (
    <div className="space-y-6">
      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
            Pending Invitations ({pendingInvitations.length})
          </h2>
          <div className="grid gap-2 sm:gap-3">
            {pendingInvitations.map((invitation) => (
              <PendingInvitationCard
                key={invitation._id}
                invitation={invitation}
                onResend={onResendInvitation}
                onCancel={onCancelInvitation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Team Members ({allMembers.length})
          </h2>
          <button
            onClick={onInvite}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>

        {allMembers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-400 text-base sm:text-lg mb-1 sm:mb-2">
              No team members yet
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Click "Invite Member" to invite your first team member
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {allMembers.map((member) => (
              <TeamMemberCard
                key={member._id}
                member={member}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Log Tab Component
const ActivityLogTab = ({
  activities,
  filters,
  onFilterChange,
  onExport,
  members,
}) => {
  const filteredActivities = activities.filter((activity) => {
    if (
      filters.search &&
      !activity.action.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.memberId && activity.user?._id !== filters.memberId) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Activity Log
        </h2>
        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
          />
        </div>

        <select
          value={filters.memberId}
          onChange={(e) =>
            onFilterChange({ ...filters, memberId: e.target.value })
          }
          className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
        >
          <option value="">All Members</option>
          {members.map((member) => (
            <option key={member._id} value={member.user?._id}>
              {member.user?.name}
            </option>
          ))}
        </select>
      </div>

      {/* Activity List */}
      <div className="space-y-2 max-h-[60vh] sm:max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-400 text-base sm:text-lg mb-1 sm:mb-2">
              No activities yet
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Team activities will appear here
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityLogItem key={activity._id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
};

// Organization Settings Tab Component
const OrganizationSettingsTab = ({ organization, onUpdate }) => {
  const [formData, setFormData] = useState({
    companyName: organization?.companyName || "",
    contactPhone: organization?.contactPhone || "",
    address: organization?.address || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await organizationApi.updateOrganization(organization._id, formData);
      toast.success("Organization settings updated successfully");
      onUpdate();
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-white">
        Organization Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

// Statistics Tab Component
const StatisticsTab = ({ stats }) => {
  if (!stats) {
    return <div className="text-gray-400">No statistics available</div>;
  }

  const statCards = [
    {
      label: "Total Team Members",
      value: stats.totalMembers || 0,
      icon: Users,
      color: "from-cyan-400 to-blue-500",
    },
    {
      label: "Active Members",
      value: stats.activeMembers || 0,
      icon: CheckCircle,
      color: "from-green-400 to-emerald-500",
    },
    {
      label: "Total Tenders",
      value: stats.totalTenders || 0,
      icon: FileText,
      color: "from-purple-400 to-pink-500",
    },
    {
      label: "Active Tenders",
      value: stats.activeTenders || 0,
      icon: TrendingUp,
      color: "from-yellow-400 to-orange-500",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-white">
        Statistics & Analytics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} index={index} />
        ))}
      </div>
    </div>
  );
};

export default TeamManagement;
