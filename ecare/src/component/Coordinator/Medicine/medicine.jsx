import React, { useEffect, useState } from "react";
import {
  TextField,
  IconButton,
  Card,
  Grid,
  Typography,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  InputAdornment,
  CircularProgress,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import styles from "./medicineList.module.css";
import Button from "../../Common/Button";
import PageTitle from "../../Common/PageTitle";
import {
  getMedicinesList,
  addMedicine,
  updateMedicineStock,
  deleteMedicine,
  getMedicineSuggestions,
  getMedicineDetails,
  updateMedicine,
  getMedicineStock
} from "../../../services/medicineServices";

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [stockDetails, setStockDetails] = useState([]);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    medicineType: "tablet",
    manufacturer: "",
    description: "",
    rxnormId: "",
    batchNumber: "",
    quantity: 0,
    expiryDate: null,
    unitPrice: 0
  });
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const medicinesList = await getMedicinesList();
      setMedicines(medicinesList);
    } catch (error) {
      toast.error("Error fetching medicines");
      console.error("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (medicineId) => {
    try {
      setSelectedMedicine(medicineId);
      const response = await getMedicineStock(medicineId);
      setStockDetails(response.data.stockDetails || []);
      setOpenStockDialog(true);
    } catch (error) {
      toast.error("Error fetching stock details");
      console.error("Error fetching stock details:", error);
    }
  };

  const handleAddStock = async () => {
    if (!selectedMedicine) return;
    
    try {
      if (!newMedicine.batchNumber || !newMedicine.quantity || !newMedicine.expiryDate || !newMedicine.unitPrice) {
        toast.error("Please fill all required fields");
        return;
      }
      
      await updateMedicineStock(selectedMedicine, {
        batchNumber: newMedicine.batchNumber,
        quantity: newMedicine.quantity,
        expiryDate: newMedicine.expiryDate,
        unitPrice: newMedicine.unitPrice
      });
      
      toast.success("Stock updated successfully");
      setOpenStockDialog(false);
      fetchMedicines();
      
      // Reset stock fields
      setNewMedicine({
        ...newMedicine,
        batchNumber: "",
        quantity: 0,
        expiryDate: null,
        unitPrice: 0
      });
    } catch (error) {
      toast.error("Error updating stock");
      console.error("Error updating stock:", error);
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    try {
      await deleteMedicine(medicineId);
      toast.success("Medicine deleted successfully");
      fetchMedicines(); // Refresh the list
    } catch (error) {
      toast.error("Error deleting medicine");
      console.error("Error deleting medicine:", error);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      if (!newMedicine.name || !newMedicine.medicineType || !newMedicine.batchNumber || 
          !newMedicine.quantity || !newMedicine.expiryDate || !newMedicine.unitPrice) {
        toast.error("Please fill all required fields");
        return;
      }
      
      const medicineData = {
        name: newMedicine.name,
        medicineType: newMedicine.medicineType,
        manufacturer: newMedicine.manufacturer,
        description: newMedicine.description,
        rxnormId: newMedicine.rxnormId,
        batchNumber: newMedicine.batchNumber,
        quantity: newMedicine.quantity,
        expiryDate: newMedicine.expiryDate,
        unitPrice: newMedicine.unitPrice
      };

      await addMedicine(medicineData);
      toast.success("Medicine added successfully");
      setNewMedicine({
        name: "",
        medicineType: "tablet",
        manufacturer: "",
        description: "",
        rxnormId: "",
        batchNumber: "",
        quantity: 0,
        expiryDate: null,
        unitPrice: 0
      });
      setOpenDialog(false);
      fetchMedicines();
    } catch (error) {
      toast.error(error.message || "Error adding medicine");
      console.error("Error adding medicine:", error);
    }
  };

  const handleMedicineSearch = async (searchTerm) => {
    if (searchTerm.length < 3) {
      setMedicineSuggestions([]);
      return;
    }
    
    try {
      setLoadingSuggestions(true);
      const response = await getMedicineSuggestions(searchTerm);
      setMedicineSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error fetching medicine suggestions:', error);
      setMedicineSuggestions([]); // Reset suggestions on error
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    if (!suggestion) return;
    
    setSelectedSuggestion(suggestion);
    setNewMedicine({
      ...newMedicine,
      name: suggestion.name,
      manufacturer: suggestion.manufacturer || 'Unknown',
      rxnormId: suggestion.rxnormId || ''
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Filter medicines locally for quick search
    if (value.length > 0) {
      const filteredMedicines = medicines.filter(med => 
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setMedicines(filteredMedicines);
    } else {
      fetchMedicines(); // Reset to full list when search is cleared
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedicine({
      ...newMedicine,
      [name]: value
    });
    
    // If changing the name field, trigger medicine search
    if (name === 'name') {
      handleMedicineSearch(value);
    }
  };

  const handleDateChange = (date) => {
    setNewMedicine({
      ...newMedicine,
      expiryDate: date
    });
  };

  return (
    <div className={styles.medicineListContainer}>
      <div className={styles.header}>
        <PageTitle>Medicine Inventory</PageTitle>
        <div className={styles.actions}>
          <TextField
            placeholder="Search medicines..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Fab
            color="primary"
            size="medium"
            onClick={() => setOpenDialog(true)}
            className={styles.addButton}
          >
            <AddIcon />
          </Fab>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <CircularProgress />
        </div>
      ) : (
        <Grid container spacing={3} className={styles.medicineGrid}>
          {medicines.length > 0 ? (
            medicines.map((medicine) => (
              <Grid item xs={12} sm={6} md={4} key={medicine._id}>
                <Card className={styles.medicineCard}>
                  <div className={styles.medicineHeader}>
                    <Typography variant="h6" className={styles.medicineName}>
                      {medicine.name}
                    </Typography>
                    <Chip 
                      label={medicine.medicineType} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </div>
                  <div className={styles.medicineDetails}>
                    <Typography variant="body2" color="textSecondary">
                      Manufacturer: {medicine.manufacturer || "Unknown"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Stock: {medicine.stockQuantity || 0} units
                    </Typography>
                  </div>
                  <div className={styles.medicineActions}>
                    <Tooltip title="Update Stock">
                      <IconButton 
                        onClick={() => handleUpdateStock(medicine._id)}
                        size="small"
                      >
                        <InventoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDeleteMedicine(medicine._id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper className={styles.noMedicines}>
                <Typography variant="h6">No medicines found</Typography>
                <Typography variant="body2">
                  Add a new medicine to get started
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Add Medicine Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Medicine</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddMedicine} className={styles.form}>
            <Autocomplete
              options={medicineSuggestions}
              getOptionLabel={(option) => option.name}
              loading={loadingSuggestions}
              onChange={(event, newValue) => handleSuggestionSelect(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Medicine Name"
                  name="name"
                  value={newMedicine.name}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            
            <TextField
              label="Manufacturer"
              name="manufacturer"
              value={newMedicine.manufacturer}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Medicine Type</InputLabel>
              <Select
                name="medicineType"
                value={newMedicine.medicineType}
                onChange={handleInputChange}
                label="Medicine Type"
                required
              >
                <MenuItem value="tablet">Tablet</MenuItem>
                <MenuItem value="capsule">Capsule</MenuItem>
                <MenuItem value="liquid">Liquid</MenuItem>
                <MenuItem value="injection">Injection</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              name="description"
              value={newMedicine.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={2}
            />
            
            <TextField
              label="Batch Number"
              name="batchNumber"
              value={newMedicine.batchNumber}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              variant="outlined"
            />
            
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={newMedicine.quantity}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{ inputProps: { min: 1 } }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiry Date"
                value={newMedicine.expiryDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    fullWidth
                    margin="normal"
                    variant="outlined"
                  />
                )}
              />
            </LocalizationProvider>
            
            <TextField
              label="Unit Price"
              name="unitPrice"
              type="number"
              value={newMedicine.unitPrice}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{ 
                inputProps: { min: 0, step: 0.01 },
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMedicine} styles={{ btnPrimary: true }}>
            Add Medicine
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Details Dialog */}
      <Dialog
        open={openStockDialog}
        onClose={() => setOpenStockDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Medicine Stock Details</DialogTitle>
        <DialogContent>
          <div className={styles.stockDialogContent}>
            <Typography variant="h6" gutterBottom>
              Current Stock
            </Typography>
            
            {stockDetails.length > 0 ? (
              <TableContainer component={Paper} className={styles.stockTable}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Batch Number</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Purchase Date</TableCell>
                      <TableCell>Unit Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockDetails.map((batch, index) => (
                      <TableRow key={index}>
                        <TableCell>{batch.batchNumber}</TableCell>
                        <TableCell>{batch.quantity}</TableCell>
                        <TableCell>
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(batch.purchaseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>₹{batch.unitPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No stock details available
              </Typography>
            )}
            
            <Typography variant="h6" gutterBottom className={styles.addStockTitle}>
              Add New Stock
            </Typography>
            
            <div className={styles.addStockForm}>
              <TextField
                label="Batch Number"
                name="batchNumber"
                value={newMedicine.batchNumber}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={newMedicine.quantity}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                InputProps={{ inputProps: { min: 1 } }}
              />
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiry Date"
                  value={newMedicine.expiryDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />
                  )}
                />
              </LocalizationProvider>
              
              <TextField
                label="Unit Price"
                name="unitPrice"
                type="number"
                value={newMedicine.unitPrice}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                InputProps={{ 
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStockDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStock} styles={{ btnPrimary: true }}>
            Add Stock
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MedicineList;
