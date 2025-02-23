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
} from "@mui/material";
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
  updateMedicine
} from "../../../services/medicineservices";


const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    medicineType: "tablet",
    stock: {
      quantity: 0,
      unitsPerPack: 0,
      batchNumber: "",
      expiryDate: "",
      type: "strip"
    },
    price: 0,
    manufacturer: "",
    description: "",
  });
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (medicineId, newStock) => {
    try {
      await updateMedicineStock(medicineId, { stockQuantity: newStock });
      fetchMedicines();
    } catch (error) {
      toast.error("Error updating stock");
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    try {
      await deleteMedicine(medicineId);
      toast.success("Medicine deleted successfully");
      fetchMedicines(); // Refresh the list
    } catch (error) {
      toast.error("Error deleting medicine");
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const stockType = newMedicine.medicineType === 'tablet' ? 'strip' : 
                       newMedicine.medicineType === 'syrup' ? 'bottle' : 'unit';
      
      const medicineData = {
        name: newMedicine.name,
        medicineType: newMedicine.medicineType,
        manufacturer: newMedicine.manufacturer,
        description: newMedicine.description,
        price: newMedicine.price,
        genericName: newMedicine.genericName,
        brandName: newMedicine.brandName,
        dosageForm: newMedicine.dosageForm,
        strength: newMedicine.strength,
        rxnormId: newMedicine.rxnormId,
        stock: {
          batchNumber: newMedicine.stock?.batchNumber,
          quantity: newMedicine.stock?.quantity,
          expiryDate: newMedicine.stock?.expiryDate,
          unitsPerPack: newMedicine.stock?.unitsPerPack,
          type: stockType
        }
      };

      await addMedicine(medicineData);
      toast.success("Medicine added successfully");
      setNewMedicine({
        name: "",
        medicineType: "tablet",
        stock: {
          quantity: 0,
          unitsPerPack: 0,
          batchNumber: "",
          expiryDate: "",
          type: "strip"
        },
        price: 0,
        manufacturer: "",
        description: "",
      });
      setOpenDialog(false);
      fetchMedicines();
    } catch (error) {
      toast.error(error.message || "Error adding medicine");
    }
  };

  const handleMedicineSearch = async (searchTerm) => {
    if (searchTerm.length < 3) {
      setMedicineSuggestions([]);
      return;
    }
    
    try {
      const response = await getMedicineSuggestions(searchTerm);
      setMedicineSuggestions(response.suggestions || []);
    } catch (error) {
      // Don't show toast for search errors
      console.error('Error fetching medicine suggestions:', error);
      setMedicineSuggestions([]); // Reset suggestions on error
    }
  };

  const handleMedicineSelect = (medicine) => {
    if (medicine) {
      setNewMedicine({
        ...newMedicine,
        name: medicine.name,
        genericName: medicine.genericName,
        brandName: medicine.brandName,
        dosageForm: medicine.dosageForm,
        strength: medicine.strength,
        rxnormId: medicine.rxnormId,
        stock: {
          ...newMedicine.stock,
          type: newMedicine.medicineType === 'tablet' ? 'strip' : 
                newMedicine.medicineType === 'syrup' ? 'bottle' : 'unit'
        }
      });
    }
    setSelectedMedicine(medicine);
  };

  const filteredMedicines = medicines.filter(medicine => 
    (medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     medicine?.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
  );

  const renderMedicineStock = (medicine) => {
    const stockType = medicine.medicineType === 'tablet' ? 'strips' :
                     medicine.medicineType === 'syrup' ? 'bottles' : 'units';
    
    const stockArray = medicine.stockQuantity[stockType] || [];
    const totalStock = stockArray.reduce((total, batch) => total + batch.quantity, 0);
    
    return totalStock;
  };

  const getMedicinePrice = (medicine) => {
    if (!medicine.price) return 0;
    
    switch (medicine.medicineType) {
      case 'tablet':
        return medicine.price.perStrip || 0;
      case 'syrup':
        return medicine.price.perBottle || 0;
      default:
        return medicine.price.perUnit || 0;
    }
  };

  const handleEditMedicine = async (medicineId) => {
    try {
      const response = await getMedicineDetails(medicineId);
      
      if (!response || !response.success || !response.data) {
        throw new Error('Invalid response format');
      }
      
      const medicineData = response.data;
      
      setEditingMedicine({
        _id: medicineData._id,
        name: medicineData.name,
        medicineType: medicineData.medicineType,
        manufacturer: medicineData.manufacturer,
        description: medicineData.description,
        price: getMedicinePrice(medicineData),
        genericName: medicineData.genericName,
        brandName: medicineData.brandName,
        dosageForm: medicineData.dosageForm,
        strength: medicineData.strength,
        stockQuantity: medicineData.stockQuantity
      });
      
      setEditDialogOpen(true);
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      toast.error(error.message || "Error fetching medicine details");
    }
  };

  const handleEditSubmit = async () => {
    try {
      if (!editingMedicine || !editingMedicine._id) {
        throw new Error('Invalid medicine data');
      }

      // Format the price object based on medicine type
      const formattedPrice = {
        perStrip: editingMedicine.medicineType === 'tablet' ? editingMedicine.price : undefined,
        perBottle: editingMedicine.medicineType === 'syrup' ? editingMedicine.price : undefined,
        perUnit: editingMedicine.medicineType === 'other' ? editingMedicine.price : undefined
      };

      const updateData = {
        ...editingMedicine,
        price: formattedPrice
      };

      await updateMedicine(editingMedicine._id, updateData);
      toast.success("Medicine updated successfully");
      setEditDialogOpen(false);
      setEditingMedicine(null);
      fetchMedicines();
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error(error.message || "Error updating medicine");
    }
  };

  return (
    <div className={styles.container}>
      <PageTitle title="Medicine Inventory" />
      <div className={styles.actionBar}>
        <TextField
          placeholder="Search medicines..."
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
        />
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setOpenDialog(true)}
          size="medium"
        >
          <AddIcon />
        </Fab>
      </div>

      <Grid container spacing={3}>
        {medicines.map((medicine) => (
          <Grid item xs={12} sm={6} md={4} key={medicine._id}>
            <Card>
              <div className={styles.medicineCard}>
                <Typography variant="h6">{medicine.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Type: {medicine.medicineType}
                </Typography>
                <Typography variant="body2">
                  Stock: {renderMedicineStock(medicine)} {
                    medicine.medicineType === 'tablet' ? 'strips' :
                    medicine.medicineType === 'syrup' ? 'bottles' : 'units'
                  }
                </Typography>
                <Typography variant="body2">
                  Price: ₹{getMedicinePrice(medicine)}
                </Typography>
                <div className={styles.cardActions}>
                  <Tooltip title="Edit Stock">
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateStock(medicine._id)}
                    >
                      <InventoryIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditMedicine(medicine._id)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteMedicine(medicine._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Medicine Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Medicine</DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            value={selectedMedicine}
            onChange={(event, newValue) => handleMedicineSelect(newValue)}
            options={medicineSuggestions}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.name === value.name}
            onInputChange={(event, value) => {
              if (event) {
                handleMedicineSearch(value);
              }
            }}
            loading={medicineSuggestions === null}
            loadingText="Searching..."
            noOptionsText="No medicines found"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Medicine"
                variant="outlined"
                fullWidth
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {medicineSuggestions === null ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <div>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.genericName} • {option.dosageForm} • {option.strength}
                  </Typography>
                </div>
              </li>
            )}
          />
          
          <TextField
            select
            label="Medicine Type"
            value={newMedicine.medicineType}
            onChange={(e) => setNewMedicine({ 
              ...newMedicine, 
              medicineType: e.target.value 
            })}
            fullWidth
            margin="dense"
            required
          >
            <MenuItem value="tablet">Tablet</MenuItem>
            <MenuItem value="syrup">Syrup</MenuItem>
            <MenuItem value="injection">Injection</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <TextField
            label={`Quantity (${newMedicine.medicineType === 'tablet' ? 'Strips' : 
              newMedicine.medicineType === 'syrup' ? 'Bottles' : 'Units'})`}
            type="number"
            value={newMedicine.stock?.quantity || ''}
            onChange={(e) => setNewMedicine({
              ...newMedicine,
              stock: {
                ...newMedicine.stock,
                quantity: parseInt(e.target.value)
              }
            })}
            fullWidth
            required
            margin="dense"
          />

          <TextField
            label="Units per Pack"
            type="number"
            value={newMedicine.stock?.unitsPerPack || ''}
            onChange={(e) => setNewMedicine({
              ...newMedicine,
              stock: {
                ...newMedicine.stock,
                unitsPerPack: parseInt(e.target.value)
              }
            })}
            fullWidth
            required
            margin="dense"
            helperText={newMedicine.medicineType === 'tablet' ? 'Tablets per strip' : 
              newMedicine.medicineType === 'syrup' ? 'ml per bottle' : 'units per pack'}
          />

          <TextField
            label="Batch Number"
            value={newMedicine.stock?.batchNumber || ''}
            onChange={(e) => setNewMedicine({
              ...newMedicine,
              stock: {
                ...newMedicine.stock,
                batchNumber: e.target.value
              }
            })}
            fullWidth
            required
            margin="dense"
          />

          <TextField
            label="Expiry Date"
            type="date"
            value={newMedicine.stock?.expiryDate || ''}
            onChange={(e) => setNewMedicine({
              ...newMedicine,
              stock: {
                ...newMedicine.stock,
                expiryDate: e.target.value
              }
            })}
            fullWidth
            required
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Medicine Name"
            value={newMedicine.name}
            onChange={(e) =>
              setNewMedicine({ ...newMedicine, name: e.target.value })
            }
            fullWidth
            required
            margin="dense"
          />
          <TextField
            label="Stock Quantity"
            type="number"
            value={newMedicine.stockQuantity}
            onChange={(e) =>
              setNewMedicine({
                ...newMedicine,
                stockQuantity: parseInt(e.target.value),
              })
            }
            fullWidth
            required
            margin="dense"
          />
          <TextField
            label="Price"
            type="number"
            value={newMedicine.price}
            onChange={(e) =>
              setNewMedicine({
                ...newMedicine,
                price: parseFloat(e.target.value),
              })
            }
            fullWidth
            required
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
          />
          <TextField
            label="Manufacturer"
            value={newMedicine.manufacturer}
            onChange={(e) =>
              setNewMedicine({ ...newMedicine, manufacturer: e.target.value })
            }
            fullWidth
            margin="dense"
          />
          <TextField
            label="Description"
            multiline
            rows={3}
            value={newMedicine.description}
            onChange={(e) =>
              setNewMedicine({ ...newMedicine, description: e.target.value })
            }
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAddMedicine} color="primary">
            Add Medicine
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Medicine</DialogTitle>
        <DialogContent dividers>
          {editingMedicine && (
            <>
              <TextField
                label="Medicine Name"
                value={editingMedicine.name}
                onChange={(e) => setEditingMedicine({
                  ...editingMedicine,
                  name: e.target.value
                })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Price"
                type="number"
                value={getMedicinePrice(editingMedicine)}
                onChange={(e) => {
                  const price = {
                    perStrip: editingMedicine.medicineType === 'tablet' ? parseFloat(e.target.value) : undefined,
                    perBottle: editingMedicine.medicineType === 'syrup' ? parseFloat(e.target.value) : undefined,
                    perUnit: editingMedicine.medicineType === 'other' ? parseFloat(e.target.value) : undefined
                  };
                  setEditingMedicine({
                    ...editingMedicine,
                    price
                  });
                }}
                fullWidth
                margin="dense"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
              <TextField
                label="Manufacturer"
                value={editingMedicine.manufacturer}
                onChange={(e) => setEditingMedicine({
                  ...editingMedicine,
                  manufacturer: e.target.value
                })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Description"
                multiline
                rows={3}
                value={editingMedicine.description}
                onChange={(e) => setEditingMedicine({
                  ...editingMedicine,
                  description: e.target.value
                })}
                fullWidth
                margin="dense"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MedicineList;
