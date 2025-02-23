import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextInput from '../../Common/TextInput';
import RadioButton from '../../Common/RadioButton';
import DatePicker from '../../Common/DatePicker';
import { updateProfilePatient, getProfilePatient } from '../../../services/profileServices';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const initialFormState = {
  name: '',
  dateOfBirth: null,
  gender: '',
  weight: '',
  height: '',
  address: '',
  district: '',
  city: '',
  pincode: '',
  phone: '',
};

const ProfileCompletionDialog = ({ open, onClose, onComplete }) => {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Safely get userData with default empty object
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const response = await getProfilePatient();
        
        // Safely access profile data with default empty object
        const profileData = response?.data || {};
        console.log("w3342",profileData);
        
        setFormData(prevData => ({
          ...prevData,
          // Use nullish coalescing to handle undefined/null values
          name: profileData.name ?? userData.name ?? '',
          dateOfBirth: profileData.dateOfBirth
                  ? dayjs(profileData.dateOfBirth)
                  : null,
          gender: profileData.gender ?? '',
          weight: profileData.weight ?? '',
          height: profileData.height ?? '',
          address: profileData.address ?? '',
          district: profileData.district ?? '',
          city: profileData.city ?? '',
          pincode: profileData.pincode ?? '',
          phone: profileData.phone ?? '',
        }));
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Safely get userData for fallback
        try {
          const userData = JSON.parse(localStorage.getItem('userData')) || {};
          setFormData(prevData => ({
            ...prevData,
            name: userData.name || ''
          }));
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError);
        }
      }
    };

    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      
      // Validate required fields
      const requiredFields = ['name', 'dateOfBirth', 'gender', 'weight', 'height', 'address', 'district', 'city', 'pincode', 'phone'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await updateProfilePatient({
        ...formData,
        email: userData.email,
        isProfileComplete: true  // Explicitly set to true when all fields are filled
      });

      if (response) {
        toast.success('Profile updated successfully');
        // Wait for the backend to update before proceeding
        await onComplete?.();
        onClose?.();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Complete Your Profile</DialogTitle>
      <DialogContent>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <TextInput
            type="text"
            title="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            isRequired={true}
          />

          <DatePicker
            name="dateOfBirth"
            title="Date of birth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            isRequired
          />

          <RadioButton
            isRequired
            name="gender"
            title="Gender"
            value={formData.gender}
            labels={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "others", label: "Others" },
            ]}
            onChange={handleChange}
          />

          <TextInput
            type="text"
            title="Weight (kg)"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Enter your weight"
            isRequired={true}
          />

          <TextInput
            type="text"
            title="Height (cm)"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="Enter your height"
            isRequired={true}
          />

          <TextInput
            type="text"
            title="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            isRequired={true}
          />

          <TextInput
            type="text"
            title="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Enter your district"
            isRequired={true}
          />

          <TextInput
            type="text"
            title="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            isRequired={true}
          />

          <TextInput
            type="text"
            title="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Enter your pincode"
            isRequired={true}
          />

          <TextInput
            type="tel"
            title="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            isRequired={true}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileCompletionDialog; 