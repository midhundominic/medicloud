// CancelAppointment.jsx
import React from "react";
import { toast } from "react-toastify";
import swal from 'sweetalert2';
import { cancelAppointment } from "../../../services/appointmentServices";

const CancelAppointment = ({ appointmentId, onCancel }) => {
  const handleCancel = async () => {
        
        const result = await swal.fire({
          title: 'Are you sure?',
          text: "Are you sure wan't to cancel appointment",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, cancel it!',
          cancelButtonText: 'No, keep it',
          customClass: {
            container: 'sweet-alert-container',
            popup: 'sweet-alert-popup',
            title: 'sweet-alert-title',
            confirmButton: 'sweet-alert-confirm-button',
            cancelButton: 'sweet-alert-cancel-button'
          }
       });

        if(result.isConfirmed){
          try{
            await cancelAppointment(appointmentId);

            await swal.fire({
              title:'Canceled',
              text:'Your Appointment has been cancelled',
              icon: 'Success',
              timer: 2000,
              showConfirmButton: false
            });
            onCancel(appointmentId);
    
          }catch(error){

          Swal.fire({
          title: 'Error!',
          text: 'Failed to cancel appointment. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  //   try {
  //     await cancelAppointment(appointmentId);
  //     toast.success("Appointment canceled successfully");
  //     onCancel(appointmentId); // Update parent component state
  //   } catch (error) {
  //     toast.error("Error canceling appointment");
  //   }
  // };

  return (
    <button onClick={handleCancel} className="cancel-btn">
      Cancel
    </button>
  );
};

export default CancelAppointment;
