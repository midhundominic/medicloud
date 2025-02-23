import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

import styles from "./slotBooking.module.css";
import Button from "../../../Common/Button";
import { TIME_SLOTS } from "../../../../utils/constant";
import {
  createAppointment,
  getUnavailableTimeSlots,
} from "../../../../services/appointmentServices";
import {
  createPaymentOrder,
  verifyPayment,
  savePaymentDetails,
} from "../../../../services/paymentServices";
import { usePatient } from "../../../../context/patientContext";
import ProfileCompletionDialog from "../../PatientProfile/ProfileCompletionDialog";
import { getProfilePatient } from "../../../../services/profileServices";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const SlotBooking = ({ selectedDoctor }) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2024-10-22");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const response = await getProfilePatient();
      const profileData = response?.data?.data;
      setPatientProfile(profileData);
    } catch (error) {
      console.error("Error fetching patient profile:", error);
    }
  };

  const { patient } = usePatient();

  const nextSevenDays = useMemo(() => {
    const days = [];
    let i = 0;
    while (days.length < 7) {
      const day = dayjs().add(i, "day");
      if (day.day() !== 0) {
        days.push(day);
      }
      i++;
    }
    return days;
  }, []);

  useEffect(() => {
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    handleDateSelect(tomorrow);
  }, [selectedDoctor]);

  const handleDateSelect = async (date) => {
    setIsLoading(true);
    setSelectedDate(date);
    setSelectedTimeSlot("");
    if (selectedDoctor && date) {
      try {
        const unavailableSlotsRes = await getUnavailableTimeSlots(
          selectedDoctor._id,
          date
        );
        const { unavailableSlots, unavailable } = unavailableSlotsRes.data;

        const now = dayjs();
        const selectedDate = dayjs(date);

        let filteredSlots = TIME_SLOTS;

        if (unavailable) {
          filteredSlots = [];
        } else {
          filteredSlots = TIME_SLOTS.filter((slot) => {
            const slotTime = dayjs(`${date} ${slot}`, "YYYY-MM-DD hh:mm A");
            return (
              !unavailableSlots.includes(slot) &&
              (selectedDate.isAfter(now, "day") || slotTime.isAfter(now))
            );
          });
        }

        setAvailableTimeSlots(filteredSlots);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error("Error fetching time slots. Please try again later.");
      }
    }
  };

  const handleBookSlot = async () => {
    try {
      // Fetch latest profile data
      const profileResponse = await getProfilePatient();
      const profileData = profileResponse?.data?.data;

      // Check if profile is complete
      if (!profileData?.isProfileComplete === false) {
        setShowProfileDialog(true);
        return;
      }

      // Rest of your booking logic
      const userData = JSON.parse(localStorage.getItem("userData"));
      const patientId = userData?.userId;

      if (!patientId) {
        toast.error("Patient Id is missing. Please log in again.");
        return;
      }

      // Load Razorpay script and proceed with payment
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please try again later.");
        return;
      }

      const orderData = await createPaymentOrder(200 * 100); // Convert to paise

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_EYA3vypm9ZHRuN",
        amount: orderData.amount,
        currency: "INR",
        name: "Appointment Payment",
        description: "Payment for your appointment",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyResponse.success) {
              const appointmentData = {
                doctorId: selectedDoctor._id,
                patientId: patientId,
                appointmentDate: selectedDate,
                timeSlot: selectedTimeSlot,
              };

              const newAppointment = await createAppointment(appointmentData);

              await savePaymentDetails({
                userId: patientId,
                appointmentId: newAppointment._id,
                amount: 200,
              });
              toast.success("Appointment scheduled and payment successful");
              setAvailableTimeSlots(TIME_SLOTS);
              const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
              handleDateSelect(tomorrow);
              setSelectedTimeSlot("");
            } else {
              toast.error(
                "Payment verification failed!" + verifyResponse.message
              );
            }
          } catch (error) {
            console.error(
              "Error in payment handler:",
              error.response?.data || error.message
            );
            toast.error(
              "Error processing payment: " +
                (error.response?.data?.message || error.message)
            );
          }
        },
        prefill: {
          name: patient?.name || "Patient",
          email: patient?.email || "",
          contact: patient?.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error in handleBookSlot:", error);
      toast.error("Error scheduling appointment or processing payment");
    }
  };

  const handleProfileComplete = async () => {
    try {
      // Fetch latest profile data after update
      const response = await getProfilePatient();
      const profileData = response?.data?.data;
      setPatientProfile(profileData);

      // If profile is complete, close dialog and proceed with booking
      if (profileData?.isProfileComplete) {
        setShowProfileDialog(false);
        // Directly call the payment flow
        const userData = JSON.parse(localStorage.getItem("userData"));
        const patientId = userData?.userId;

        if (!patientId) {
          toast.error("Patient Id is missing. Please log in again.");
          return;
        }

        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error("Razorpay SDK failed to load. Please try again later.");
          return;
        }

        const orderData = await createPaymentOrder(200 * 100);
        // ... rest of the payment handling code
      }
    } catch (error) {
      console.error("Error checking profile completion:", error);
      toast.error("Error updating profile");
    }
  };

  return (
    <div className={styles.slotRoot}>
      <span>Choose date and time</span>
      <div className={styles.dateOptions}>
        {nextSevenDays.map((day, index) => (
          <button
            key={index}
            className={`${styles.dateBtn} ${
              selectedDate === day.format("YYYY-MM-DD")
                ? styles.dateBtnSelected
                : ""
            }
            }`}
            onClick={() => handleDateSelect(day.format("YYYY-MM-DD"))}
          >
            <div>{day.format("ddd").toUpperCase()}</div>
            <div>{day.format("DD")}</div>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.slotLoader}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className={styles.timeSlotOptions}>
            {TIME_SLOTS.map((slot) => {
              const isUnavailable = !availableTimeSlots.includes(slot);
              const slotTime = dayjs(
                `${selectedDate} ${slot}`,
                "YYYY-MM-DD hh:mm A"
              );
              const isPast = slotTime.isBefore(dayjs());
              return (
                <button
                  key={slot}
                  className={`${styles.timeSlotBtn} ${
                    selectedTimeSlot === slot ? styles.timeSlotBtnSelected : ""
                  }
              `}
                  onClick={() => setSelectedTimeSlot(slot)}
                  disabled={isUnavailable || isPast}
                >
                  {slot} {isPast ? " (Past)" : ""}
                </button>
              );
            })}
          </div>
          <div className={styles.btnContainer}>
            <span>{`${dayjs(selectedDate).format("MMM D, dddd")} ${
              selectedTimeSlot && "| " + selectedTimeSlot
            }`}</span>
            <Button
              onClick={handleBookSlot}
              isDisabled={!selectedDate || !selectedTimeSlot}
              styles={{ btnPrimary: styles.customeBtn }}
            >
              Book
            </Button>
            <ProfileCompletionDialog
              open={showProfileDialog}
              onClose={() => setShowProfileDialog(false)}
              onComplete={handleProfileComplete}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SlotBooking;
