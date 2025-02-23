import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Rating,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getAllReviews } from "../../../services/appointmentServices";
import styles from "./reviews.module.css";
import PageTitle from "../../Common/PageTitle";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await getAllReviews();
      setReviews(response.data.data);
    } catch (error) {
      toast.error("Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      `${review.patientId.name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesRating =
      filterRating === "all" || review.rating === parseInt(filterRating);

    return matchesSearch && matchesRating;
  });

  return (
    <Box className={styles.reviewsContainer}>
      <PageTitle>Patient Reviews</PageTitle>

      <Box className={styles.filterSection}>
        <TextField
          placeholder="Search by patient or doctor name..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          className={styles.searchField}
        />

        <FormControl size="small" className={styles.ratingFilter}>
          <InputLabel>Filter by Rating</InputLabel>
          <Select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            label="Filter by Rating"
          >
            <MenuItem value="all">All Ratings</MenuItem>
            {[5, 4, 3, 2, 1].map((rating) => (
              <MenuItem key={rating} value={rating}>
                {rating} Stars
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} className={styles.reviewsGrid}>
        {filteredReviews.map((review) => (
          <Grid item xs={12} md={6} key={review._id}>
            <Card className={styles.reviewCard}>
              <CardContent>
                <Box className={styles.reviewHeader}>
                  <Box className={styles.userInfo}>
                    <Avatar className={styles.avatar}>
                      {review.patientId?.name
                        ? review.patientId.name.charAt(0)
                        : "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {review.patientId.name} 
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {review.patientId.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={<StarIcon />}
                    label={review.rating}
                    color={
                      review.rating >= 4
                        ? "success"
                        : review.rating >= 3
                        ? "warning"
                        : "error"
                    }
                  />
                </Box>

                <Box className={styles.doctorInfo}>
                  <Typography variant="subtitle2">
                    Review for Dr. {review.doctorId.firstName}{" "}
                    {review.doctorId.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {review.doctorId.specialization}
                  </Typography>
                </Box>

                <Box className={styles.reviewContent}>
                  <Rating value={review.rating} readOnly precision={0.5} />
                  <Typography variant="body1" className={styles.reviewText}>
                    {review.review || "No written review provided"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Reviewed on{" "}
                    {dayjs(review.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Reviews;
