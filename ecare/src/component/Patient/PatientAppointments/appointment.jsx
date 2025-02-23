import React, { useEffect, useState } from "react";

import { getDoctors } from "../../../services/doctorServices";
import styles from "./appointment.module.css";
import PageTitle from "../../Common/PageTitle";
import { DEPARTMENTS } from "../../../utils/constant";
import DoctorList from "./DoctorList/doctorCarrosel";
import SlotBooking from "./SlotBooking/slotBooking";
import DoctorIcon from "../../../assets/icons/ic_doctor.png";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';

const DoctorProfiles = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDeparments, setselectedDepartments] = useState([]);
  const [filterDocList, setFilterDocList] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelectDepartment = (spec) => {
    setSelectedDoctor(null);
    if (selectedDeparments.includes(spec)) {
      const updatedItems = selectedDeparments.filter((item) => item !== spec);
      setselectedDepartments([...updatedItems]);
    } else {
      setselectedDepartments([...selectedDeparments, spec]);
    }
  };

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
  };

  useEffect(() => {
    if (selectedDeparments.length) {
      const docList = doctors.filter((doc) =>
        selectedDeparments.includes(doc.specialization)
      );
      setFilterDocList(docList);
    } else setFilterDocList(doctors);
  }, [selectedDeparments]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await getDoctors();
        setDoctors(res.data);
        setFilterDocList(res.data);
        const specializationsArr = res.data.reduce((result, item) => {
          if (!result.includes(item.specialization))
            result = [...result, item.specialization];
          return result;
        }, []);
        setDepartments(specializationsArr);
      } catch (error) {
        console.log("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);
  const renderStarRating = (rating) =>{
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon 
          key={`full-${i}`} 
          className={styles.starIcon} 
          sx={{ color: '#FFD700' }}
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalfIcon 
          key="half" 
          className={styles.starIcon} 
          sx={{ color: '#FFD700' }}
        />
      );
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarBorderIcon 
          key={`empty-${i}`} 
          className={styles.starIcon} 
          sx={{ color: '#FFD700' }}
        />
      );
    }

    return stars;
  };

  return (
    <div className={styles.doctorRoot}>
      <PageTitle>Make Appointment</PageTitle>
      <div
        className={
          selectedDoctor ? styles.mainContentHaveDoc : styles.mainContent
        }
      >
        <div className={styles.bookingDetails}>
          <div className={styles.specRoot}>
            <span>Choose category</span>
            <div className={styles.specWrapper}>
              {departments.map((dep) => {
                const specIcon = DEPARTMENTS.filter(
                  (item) => item.name === dep
                );
                const isSelected = selectedDeparments.includes(dep);
                return (
                  <div
                    className={
                      isSelected ? styles.specSelected : styles.specItem
                    }
                    onClick={() => handleSelectDepartment(dep)}
                  >
                    <img
                      src={specIcon[0].icon}
                      alt="specialization icon"
                      className={styles.specIcon}
                    />
                    <span>{dep}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {filterDocList.length && (
            <DoctorList
              doctorsList={filterDocList}
              handleSelectDoctor={handleSelectDoctor}
              selectedDoctor={selectedDoctor}
            />
          )}
          {selectedDoctor && <SlotBooking selectedDoctor={selectedDoctor} />}
        </div>
        {selectedDoctor && (
          <div className={styles.doctorDetails}>
            <img
              src={
                selectedDoctor.profilePhoto
                  ? selectedDoctor.profilePhoto
                  : DoctorIcon
              }
              alt="doctor profile"
              className={styles.docProfile}
            />
            <span
              className={styles.docName}
            >{`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}</span>
            <span className={styles.docSpec}>
              {selectedDoctor.specialization}
            </span>
            <div className={styles.ratingContainer}>
                              <div className={styles.stars}>
                                {renderStarRating(selectedDoctor.rating)}
                              </div>
                              </div>
            <span className={styles.bioTitle}>Biograpghy</span>
            <div className={styles.bio}>
              <span>
                {isExpanded
                  ? `${selectedDoctor.aboutDoctor} `
                  : `${selectedDoctor.aboutDoctor.slice(0, 120)}... `}
              </span>
              <span
                className={styles.readMoreButton}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Read Less" : "Read More"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfiles;
