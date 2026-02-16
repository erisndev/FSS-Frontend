import React from "react";
import { Mail, Send, X as XIcon } from "lucide-react";

const PendingInvitationCard = ({ invitation, onResend, onCancel }) => {
  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <div
      className={`bg-slate-800/50 border rounded-lg p-4 ${
        isExpired ? "border-red-400/20" : "border-yellow-400/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-medium">{invitation.name}</h3>
              <span
                className={`px-2 py-0.5 text-xs rounded ${
                  isExpired
                    ? "bg-red-500/20 text-red-300"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                {isExpired ? "Expired" : "Pending"}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{invitation.email}</p>
            <p className="text-gray-400 text-xs mt-1">
              Sent: {new Date(invitation.createdAt).toLocaleDateString()} •
              Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onResend(invitation._id)}
            className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
            title="Resend Invitation"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCancel(invitation._id)}
            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Cancel Invitation"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingInvitationCard;
