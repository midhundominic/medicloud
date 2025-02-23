import React from "react";
import styles from "./carousel.module.css";

const Carousel = ({ images, currentIndex }) => {
  return (
    <div className={styles.carouselContainer}>
      <img
        src={images[currentIndex]}
        alt={`Hospital ${currentIndex + 1}`}
        className={styles.carouselImage}
      />
    </div>
  );
};

export default Carousel;
