import React, { useEffect, useState } from "react";
import { getLeaveRequests, updateLeaveStatus } from "../../../services/adminServices";
import { toast } from "react-toastify";
import './leave.css';

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await getLeaveRequests();
        setLeaveRequests(response.data.leaveRequests);
      } catch (error) {
        toast.error("Error fetching leave requests");
      }
    };
    fetchLeaveRequests();
  }, []);

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      await updateLeaveStatus({ leaveId, status });
      toast.success(`Leave ${status} successfully`);
      setLeaveRequests((prev) =>
        prev.map((request) =>
          request._id === leaveId ? { ...request, status } : request
        )
      );
    } catch (error) {
      toast.error("Error updating leave status");
    }
  };

  return (
    <div>
      <h2>Leave Requests</h2>
      {leaveRequests.map((leave) => (
        <div key={leave._id} className="leave-request">
          <p>
            Doctor: {leave.doctorId.firstName} {leave.doctorId.lastName}
          </p>
          <p>Start Date: {new Date(leave.startDate).toLocaleDateString()}</p>
          <p>End Date: {new Date(leave.endDate).toLocaleDateString()}</p>
          <p>Reason: {leave.reason}</p>
          <p>Status: {leave.status}</p>
          <button onClick={() => handleUpdateStatus(leave._id, "approved")}>
            Approve
          </button>
          <button onClick={() => handleUpdateStatus(leave._id, "rejected")}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
};

export default LeaveRequests;
