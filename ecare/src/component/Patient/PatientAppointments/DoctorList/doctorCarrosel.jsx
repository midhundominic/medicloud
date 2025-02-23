import React, { useEffect, useMemo, useState } from "react";

import styles from "./doctorList.module.css";
import DoctorIcon from "../../../../assets/icons/ic_doctor.png";
import EastIcon from "@mui/icons-material/East";
import WestIcon from "@mui/icons-material/West";
import { IconButton } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';

const DoctorList = ({ doctorsList, handleSelectDoctor, selectedDoctor }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemPerPage, setItemPerPage] = useState(3);
  const [filterList, setFilterList] = useState([doctorsList]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 425) setItemPerPage(1);
      else if (window.innerWidth <= 768) setItemPerPage(2);
      else setItemPerPage(selectedDoctor ? 2 : 3);
    };

    window.addEventListener("resize", handleResize); // Add event listener
    handleResize();
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768) setItemPerPage(2);
  }, [selectedDoctor]);

  useEffect(() => {
    if (currentPage !== 0) setCurrentPage(0);
  }, [doctorsList]);

  useEffect(() => {
    const activePage = currentPage * itemPerPage;
    const filterList = doctorsList.slice(activePage, activePage + itemPerPage);
    setFilterList(filterList);
  }, [doctorsList, currentPage, itemPerPage]);

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    setCurrentPage(currentPage - 1);
  };

  const listContainerStyle = useMemo(() => {
    let style = styles.listContainer1;
    if (itemPerPage === 3) style = styles.listContainer3;
    else if (itemPerPage === 2) style = styles.listContainer2;
    else style = styles.listContainer1;

    return style;
  }, [itemPerPage]);

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
    <div className={styles.docListRoot}>
      <div className={styles.titleContainer}>
        <span>Choose doctor</span>
        <div className={styles.iconsWrapper}>
          <IconButton disabled={currentPage === 0}>
            <WestIcon onClick={handlePrev} />
          </IconButton>
          <IconButton
            disabled={
              currentPage >= Math.ceil(doctorsList.length / itemPerPage) - 1
            }
          >
            <EastIcon onClick={handleNext} />
          </IconButton>
        </div>
      </div>

      <div className={listContainerStyle}>
        {filterList.map((doc) => {
          const isSelected = doc._id === selectedDoctor?._id;
          return (
            <div
              className={
                isSelected ? styles.selectedDocCard : styles.doctorCard
              }
              key={doc._id}
              onClick={() => handleSelectDoctor(doc)}
            >
              <img
                src={
                  doc.profilePhoto
                    ? doc.profilePhoto
                    : DoctorIcon
                }
                alt="doctor profile"
                className={styles.docProfile} 
                onError={(e)=>{
                  e.target.onerror = null;
                  e.target.src = DoctorIcon;
                }}
              />
              <div className={styles.docInfo}>
                <span
                  className={styles.docName}
                >{`${doc.firstName} ${doc.lastName}`}</span>
                <span className={styles.docCaption}>{doc.specialization}</span>
                <div className={styles.ratingContainer}>
                  <div className={styles.stars}>
                    {renderStarRating(doc.rating)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorList;
