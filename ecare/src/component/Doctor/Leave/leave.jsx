import React, { useState, useEffect } from "react";
import { applyForLeave, fetchLeaveStatus, cancelLeave } from "../../../services/doctorServices";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css"; // Import date picker styles
import DatePicker from "react-datepicker"; // Add this package for range picking
import "./leave.css";

const ApplyLeave = () => {
  const [leaveDates, setLeaveDates] = useState([null, null]); // Store a date range
  const [reason, setReason] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [startDate, endDate] = leaveDates;

  useEffect(() => {
    const getLeaveStatus = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const doctorId = userData?.doctorId;
      if (doctorId) {
        try {
          const status = await fetchLeaveStatus(doctorId);
          setLeaveRequests(status);
        } catch (error) {
          toast.error("Error fetching leave status");
        }
      }
    };
    getLeaveStatus();
  }, []);

  const handleSubmit = async () => {
    const today = new Date();
  
    if (!startDate || !endDate || startDate < today || endDate < today) {
      toast.error("You cannot apply for leave in the past or without selecting dates.");
      return;
    }
  
    // Adjust dates to start and end at midnight local time to avoid time zone issues
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setHours(0, 0, 0, 0); // Start at midnight local time
  
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999); // End at 23:59:59 local time
  
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const doctorId = userData.doctorId;
      if (!doctorId) {
        toast.error("Doctor ID not found");
        return;
      }
  
      await applyForLeave({ doctorId, startDate: adjustedStartDate, endDate: adjustedEndDate, reason });
      toast.success("Leave request submitted");
  
      // Clear fields and update the state with the new request
      setLeaveDates([null, null]); // Clear the date fields
      setReason(""); // Clear the reason field
      setLeaveRequests([
        ...leaveRequests, 
        { startDate: adjustedStartDate, endDate: adjustedEndDate, reason, status: "pending" }
      ]); // Add new request to the state
    } catch (error) {
      toast.error("Error submitting leave request");
    }
  };
  

  const handleCancelLeave = async (leaveId) => {
    try {
      await cancelLeave(leaveId);
      toast.success("Leave request canceled");
      setLeaveRequests(leaveRequests.filter((request) => request._id !== leaveId));
    } catch (error) {
      toast.error("Error canceling leave request");
    }
  };

  return (
    <div className="leave-container">
      <h2>Apply for Leave</h2>
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => setLeaveDates(update)}
        minDate={new Date()} // Prevent past date selection
        isClearable={true}
        placeholderText="Select leave date range"
        className="custom-date-picker" // Add this class for custom styling
      />
      <input
        type="text"
        placeholder="Reason for leave"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>

      <h3>Your Leave Requests</h3>
      <div className="leave-requests">
        {leaveRequests.map((request) => (
          <div key={request._id} className="leave-request">
            <p>Start Date: {new Date(request.startDate).toLocaleDateString()}</p>
            <p>End Date: {new Date(request.endDate).toLocaleDateString()}</p>
            <p>Reason: {request.reason}</p>
            <p>Status: {request.status}</p>
            <button className="cancel-button" onClick={() => handleCancelLeave(request._id)}>Cancel Leave</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplyLeave;
