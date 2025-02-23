import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Tab, Tabs } from "@mui/material";
import { toast } from "react-toastify";

import { getAppointmentDetails } from "../../../services/doctorServices";
import styles from "./prescription.module.css";
import PageTitle from "../../Common/PageTitle";
import PatientIcon from "../../../assets/icons/ic_businessman.png";
import TabPanel from "../../Common/TabPanel";
import DoctorReview from "./Review/review";
import { calculateAge } from "../../../utils/helper";
import WeightIcon from "../../../assets/icons/ic_weight.png";
import HeightIcon from "../../../assets/icons/ic_height.png";
import PatientRecords from "./Records/records";
import { getAllTests } from '../../../services/labTestServices';

const PrescribeForm = () => {
  const [searchParams] = useSearchParams();

  const [appointment, setAppointment] = useState(null);
  const [activeTab, setActiveTab] = React.useState(0);
  const [labTests, setLabTests] = useState([]);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const details = await getAppointmentDetails(appointmentId);
        console.log(details, "11111111");
        setAppointment(details);
      } catch (error) {
        toast.error("Error fetching appointment details");
      }
    };
    const fetchTests = async () => {
      try {
        const response = await getAllTests();
        setLabTests(response.data);
      } catch (error) {
        toast.error('Error fetching lab tests');
      }
    };
    const appointmentId = searchParams.get("appointmentId");
    // const doctorId = searchParams.get("doctorId");
    if (appointmentId) {
      fetchAppointmentDetails();
      fetchTests();
    }
  }, []);

  const patientInfo = useMemo(() => {
    return appointment?.patientId;
  }, [appointment]);

  console.log("33333333333-patientInfo", patientInfo);

  if (!appointment) return <div>Loading...</div>;

  return (
    <div className={styles.prescriptionRoot}>
      <PageTitle>Prescription</PageTitle>
      <div className={styles.userInfo}>
        <div className={styles.leftContent}>
          <img
            src={
              patientInfo?.profilePhoto
                ? patientInfo.profilePhoto
                : PatientIcon
            }
            className={styles.patientImage}
            alt="patient profile"
          />
          <div className={styles.patientInfo}>
            <span className={styles.name}>{patientInfo?.name}</span>
            <span className={styles.patientData}>{patientInfo?.email}</span>
            {patientInfo?.dateOfBirth && (
              <span className={styles.patientData}>{`${calculateAge(
                patientInfo?.dateOfBirth
              )} | ${patientInfo?.gender}`}</span>
            )}
          </div>
        </div>
        <div className={styles.rightContent}>
          {patientInfo?.weight && (
            <span className={styles.patientData}>
              <img src={WeightIcon} alt="weight" className={styles.icons} />
              {`${patientInfo?.weight} Kg`}
            </span>
          )}
          {patientInfo?.height && (
            <span className={styles.patientData}>
              <img src={HeightIcon} alt="height" className={styles.icons} />
              {`${patientInfo?.height} Cm`}
            </span>
          )}
        </div>
      </div>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="basic tabs example"
          classes={{
            root: styles.tabsRoot,
          }}
        >
          <Tab label="Review" classes={{ root: styles.tabRoot }} />
          <Tab label="Records" classes={{ root: styles.tabRoot }} />
        </Tabs>
      </Box>
      <TabPanel value={activeTab} index={0}>
        <DoctorReview labTests={labTests} />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <PatientRecords patient={patientInfo} />
      </TabPanel>
    </div>
  );
};

export default PrescribeForm;
