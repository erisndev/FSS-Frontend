import React from "react";
import { motion } from "framer-motion";
import { Users, Crown, Edit, Trash2, Mail, Calendar } from "lucide-react";

const TeamMemberCard = ({ member, onEdit, onRemove }) => {
  const isTeamLeader = member.role === "team_leader";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-cyan-400/20 rounded-lg p-3 sm:p-4 hover:border-cyan-400/40 transition-all duration-200"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          {/* Info - Mobile */}
          <div className="flex-1 sm:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-medium text-sm">
                {member.user?.name || "Unknown"}
              </h3>
              {isTeamLeader && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                  <Crown className="w-3 h-3" />
                  <span>Leader</span>
                </span>
              )}
              {!member.isActive && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info - Desktop */}
        <div className="hidden sm:block flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white font-medium text-base">
              {member.user?.name || "Unknown"}
            </h3>
            {isTeamLeader && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                <Crown className="w-3 h-3" />
                <span>Team Leader</span>
              </span>
            )}
            {!member.isActive && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">
                Inactive
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{member.user?.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isTeamLeader && (
          <div className="flex items-center gap-2 sm:self-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(member)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors text-xs sm:text-sm"
              title="Edit Permissions"
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Edit</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRemove(member._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-xs sm:text-sm"
              title="Remove Member"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Remove</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Mobile Info */}
      <div className="sm:hidden mt-3 space-y-1.5 pl-13">
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{member.user?.email || "No email"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Permissions */}
      {member.permissions && Object.values(member.permissions).some(v => v) && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-cyan-400/10">
          <p className="text-gray-400 text-xs font-medium mb-2">Permissions</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {Object.entries(member.permissions).map(
              ([key, value]) =>
                value && (
                  <span
                    key={key}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-md"
                  >
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                )
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TeamMemberCard;
