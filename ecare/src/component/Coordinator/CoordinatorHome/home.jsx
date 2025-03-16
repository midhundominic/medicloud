import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Chip, TextField, InputAdornment, Dialog, 
  DialogTitle, DialogContent, DialogActions, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Grid, Typography, Divider
} from "@mui/material";
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import MedicationIcon from '@mui/icons-material/Medication';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { toast } from "react-toastify";
import styles from "./coordinatorHome.module.css";
import { getPrescriptionPayments, updateDeliveryStatus } from "../../../services/prescriptionPaymentServices";

const Home = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await getPrescriptionPayments();
      console.log("Home prescription response", response);
      if (response.success) {
        setPrescriptions(response.data);
      } else {
        toast.error("Failed to fetch prescriptions");
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Error fetching prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryUpdate = async (prescriptionId, status) => {
    try {
      setUpdatingDelivery(true);
      const response = await updateDeliveryStatus(prescriptionId, status);
      if (response.success) {
        toast.success(`Prescription marked as ${status}`);
        // Update local state
        setPrescriptions(prescriptions.map(p => 
          p._id === prescriptionId ? { ...p, deliveryStatus: status } : p
        ));
        setDetailsOpen(false);
      } else {
        toast.error(response.message || "Failed to update delivery status");
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("Error updating delivery status");
    } finally {
      setUpdatingDelivery(false);
    }
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setDetailsOpen(true);
  };

  const filteredPrescriptions = prescriptions
    .filter(prescription => {
      // Filter by status
      if (filterStatus !== "all" && prescription.deliveryStatus !== filterStatus) {
        return false;
      }
      
      // Filter by search term
      const patientName = prescription.patient?.name?.toLowerCase() || "";
      const prescriptionId = prescription._id?.toLowerCase() || "";
      const searchLower = searchTerm.toLowerCase();
      
      return patientName.includes(searchLower) || prescriptionId.includes(searchLower);
    });

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>Pharmacy Dashboard</h2>
        <div className={styles.notificationWrapper}>
          <NotificationsNoneRoundedIcon
            style={{ color: "white", fontSize: "20px" }}
          />
          <div className={styles.notificationStatus} />
        </div>
      </div>
      
      <div className={styles.filterContainer}>
        <TextField
          placeholder="Search by patient name or ID"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl variant="outlined" size="small" className={styles.filterSelect}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
          </Select>
        </FormControl>
      </div>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Prescription ID</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Delivery Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription._id}>
                    <TableCell>{prescription._id.substring(0, 8)}...</TableCell>
                    <TableCell>{prescription.patient?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₹{prescription.amount?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>
                      <Chip 
                        label={prescription.isPaid ? "Paid" : "Unpaid"} 
                        color={prescription.isPaid ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={prescription.deliveryStatus || "Processing"} 
                        color={getStatusColor(prescription.deliveryStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(prescription)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No prescriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Prescription Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPrescription && (
          <>
            <DialogTitle className={styles.dialogTitle}>
              <div className={styles.dialogTitleContent}>
                <Typography variant="h6">Prescription Details</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  ID: {selectedPrescription._id}
                </Typography>
              </div>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} className={styles.detailsContainer}>
                {/* Patient Information */}
                <Grid item xs={12} md={6}>
                  <div className={styles.detailsSection}>
                    <div className={styles.sectionHeader}>
                      <PersonIcon className={styles.sectionIcon} />
                      <h3>Patient Information</h3>
                    </div>
                    <Divider className={styles.sectionDivider} />
                    <p><strong>Name:</strong> {selectedPrescription.patient?.name || "Not available"}</p>
                    <p><strong>Email:</strong> {selectedPrescription.patient?.email || "Not available"}</p>
                    <p><strong>Phone:</strong> {selectedPrescription.patient?.phone || "Not available"}</p>
                  </div>
                </Grid>
                
                {/* Address Information */}
                <Grid item xs={12} md={6}>
                  <div className={styles.detailsSection}>
                    <div className={styles.sectionHeader}>
                      <LocationOnIcon className={styles.sectionIcon} />
                      <h3>Delivery Address</h3>
                    </div>
                    <Divider className={styles.sectionDivider} />
                    <p><strong>House:</strong> {selectedPrescription.patient?.address || "Not available"}</p>
                    <p><strong>City:</strong> {selectedPrescription.patient?.city || "Not available"}</p>
                    <p><strong>District:</strong> {selectedPrescription.patient?.district || "Not available"}</p>
                    <p><strong>Pincode:</strong> {selectedPrescription.patient?.pincode || "Not available"}</p>
                  </div>
                </Grid>
                
                {/* Payment Information */}
                <Grid item xs={12} md={6}>
                  <div className={styles.detailsSection}>
                    <div className={styles.sectionHeader}>
                      <PaymentIcon className={styles.sectionIcon} />
                      <h3>Payment Information</h3>
                    </div>
                    <Divider className={styles.sectionDivider} />
                    <p><strong>Amount:</strong> ₹{selectedPrescription.amount?.toFixed(2) || "0.00"}</p>
                    <p><strong>Payment Status:</strong> {selectedPrescription.isPaid ? "Paid" : "Unpaid"}</p>
                    <p><strong>Payment Date:</strong> {selectedPrescription.paymentDate ? new Date(selectedPrescription.paymentDate).toLocaleString() : "Not paid yet"}</p>
                    {/* <p><strong>Payment ID:</strong> {selectedPrescription.razorpayPaymentId || "N/A"}</p> */}
                  </div>
                </Grid>
                
                {/* Delivery Status */}
                <Grid item xs={12} md={6}>
                  <div className={styles.detailsSection}>
                    <div className={styles.sectionHeader}>
                      <LocalShippingIcon className={styles.sectionIcon} />
                      <h3>Delivery Status</h3>
                    </div>
                    <Divider className={styles.sectionDivider} />
                    <div className={styles.deliveryStatus}>
                      <p><strong>Current Status:</strong></p>
                      <Chip 
                        label={selectedPrescription.deliveryStatus || "Processing"} 
                        color={getStatusColor(selectedPrescription.deliveryStatus)}
                        className={styles.statusChip}
                      />
                    </div>
                    
                    {selectedPrescription.deliveryStatus === "delivered" && selectedPrescription.deliveredAt && (
                      <p><strong>Delivered on:</strong> {new Date(selectedPrescription.deliveredAt).toLocaleString()}</p>
                    )}
                    
                    {selectedPrescription.isPaid && (
                      <div className={styles.statusActions}>
                        <p><strong>Update Status:</strong></p>
                        <div className={styles.statusButtons}>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            disabled={updatingDelivery || selectedPrescription.deliveryStatus === "processing"}
                            onClick={() => handleDeliveryUpdate(selectedPrescription._id, "processing")}
                          >
                            Processing
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            disabled={updatingDelivery || selectedPrescription.deliveryStatus === "shipped"}
                            onClick={() => handleDeliveryUpdate(selectedPrescription._id, "shipped")}
                            startIcon={<LocalShippingIcon />}
                          >
                            Shipped
                          </Button>
                          <Button 
                            variant="contained" 
                            color="success"
                            disabled={updatingDelivery || selectedPrescription.deliveryStatus === "delivered"}
                            onClick={() => handleDeliveryUpdate(selectedPrescription._id, "delivered")}
                            startIcon={<CheckCircleIcon />}
                          >
                            Delivered
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Grid>
                
                {/* Medicines */}
                <Grid item xs={12}>
                  <div className={styles.detailsSection}>
                    <div className={styles.sectionHeader}>
                      <MedicationIcon className={styles.sectionIcon} />
                      <h3>Medicines</h3>
                    </div>
                    <Divider className={styles.sectionDivider} />
                    
                    {selectedPrescription.medicineDetails?.length > 0 ? (
                      <div className={styles.medicinesTable}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Medicine Name</TableCell>
                              {/* <TableCell>Quantity</TableCell>
                              <TableCell>Price</TableCell>
                              <TableCell>Total</TableCell> */}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedPrescription.prescription.medicines.map((med, index) => (
                              <TableRow key={index}>
                                <TableCell>{med.medicine?.name || "Unknown Medicine"}</TableCell>
                                {/* <TableCell>{med.quantity || 0}</TableCell>
                                <TableCell>₹{med.price?.toFixed(2) || "0.00"}</TableCell>
                                <TableCell>₹{((med.quantity || 0) * (med.price || 0)).toFixed(2)}</TableCell> */}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p>No medicines in this prescription</p>
                    )}
                    
                    {/* Prescription Details */}
                    {selectedPrescription.prescription?.medicines?.length > 0 && (
                      <div className={styles.prescriptionDetails}>
                        <h4>Prescription Instructions</h4>
                        <ul className={styles.medicinesList}>
                          {selectedPrescription.prescription.medicines.map((med, index) => (
                            <li key={index} className={styles.medicineItem}>
                              <span className={styles.medicineName}>{med.medicine?.name}</span>
                              <span className={styles.medicineDetails}>
                                {med.frequency}, {med.days} days
                                {med.beforeFood ? ', before food' : ''}
                                {med.isSOS ? ', SOS' : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "delivered":
      return "success";
    case "shipped":
      return "info";
    case "processing":
      return "warning";
    default:
      return "default";
  }
};

export default Home;
