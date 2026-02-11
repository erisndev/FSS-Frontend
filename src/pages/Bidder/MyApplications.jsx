import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ApplicationCard from "../../components/UI/ApplicationCard";
import ApplicationModal from "../../components/UI/ApplicationModal";
import ConfirmDeleteModal from "../../components/UI/ConfirmDeleteModal";
import EmptyState from "../../components/UI/EmptyState";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import { applicationApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getMyApplications();
      console.log("Fetched applications:", data);
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    try {
      await applicationApi.withdrawApplication(applicationId);
      toast.success("Application withdrawn successfully");
      fetchApplications();
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Failed to withdraw application");
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleWithdrawClick = (application) => {
    setAppToWithdraw(application);
    setShowWithdrawModal(true);
  };

  if (showLoading) {
    return (
      <DashboardLayout
        title="My Applications"
        subtitle="Track your tender applications"
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Applications"
      subtitle="Track your tender applications"
    >
      <div className="space-y-6">
        {applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Start applying to tenders to see them here."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {applications.map((application, index) => (
              <ApplicationCard
                key={application._id || application.id || index}
                application={application}
                index={index}
                onView={handleViewApplication}
                onWithdraw={handleWithdrawClick}
              />
            ))}
          </div>
        )}

        <ApplicationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          tender={selectedApplication?.tender}
          user={user}
        />

        <ConfirmDeleteModal
          isOpen={showWithdrawModal}
          onClose={() => {
            setShowWithdrawModal(false);
            setAppToWithdraw(null);
          }}
          onConfirm={() => {
            if (appToWithdraw)
              handleWithdrawApplication(appToWithdraw._id || appToWithdraw.id);
            setShowWithdrawModal(false);
            setAppToWithdraw(null);
          }}
          itemName={`your application for "${
            appToWithdraw?.tender?.title || "this tender"
          }"`}
          title="Withdraw Application"
          actionText="Withdraw"
          actionType="withdraw"
        />
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
