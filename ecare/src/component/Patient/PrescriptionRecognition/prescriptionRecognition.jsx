// import React, { useState } from 'react';
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CircularProgress,
//   Typography,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
// } from '@mui/material';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import { toast } from 'react-toastify';
// import styles from './prescriptionRecognition.module.css';
// import { analyzePrescriptionImage } from '../../../services/prescriptionRecognitionServices';

// const PrescriptionRecognition = () => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [results, setResults] = useState(null);
//   const [error, setError] = useState(null);

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       if (file.type.startsWith('image/')) {
//         setSelectedImage(file);
//         setResults(null);
//         setError(null);
//       } else {
//         toast.error('Please upload an image file');
//       }
//     }
//   };

//   const processImage = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await analyzePrescriptionImage(selectedImage);
      
//       if (response.success) {
//         setResults(response.data.analysis);
//         toast.success('Prescription analyzed successfully');
//       } else {
//         throw new Error(response.message || 'Error analyzing prescription');
//       }
//     } catch (err) {
//       console.error('Error:', err);
//       setError('Error processing prescription. Please try again.');
//       toast.error(err.message || 'Error processing prescription');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box className={styles.container}>
//       <Typography variant="h4" gutterBottom>
//         Prescription Recognition
//       </Typography>

//       <Card className={styles.uploadCard}>
//         <CardContent>
//           <input
//             accept="image/*"
//             type="file"
//             onChange={handleImageUpload}
//             style={{ display: 'none' }}
//             id="prescription-image-upload"
//           />
//           <label htmlFor="prescription-image-upload">
//             <Button
//               variant="outlined"
//               component="span"
//               startIcon={<CloudUploadIcon />}
//               fullWidth
//               className={styles.uploadButton}
//             >
//               Upload Prescription Image
//             </Button>
//           </label>

//           {selectedImage && (
//             <Box className={styles.imagePreview}>
//               <img
//                 src={URL.createObjectURL(selectedImage)}
//                 alt="Prescription preview"
//               />
//               <Button
//                 variant="contained"
//                 onClick={processImage}
//                 disabled={loading}
//                 className={styles.processButton}
//               >
//                 {loading ? <CircularProgress size={24} /> : 'Analyze Prescription'}
//               </Button>
//             </Box>
//           )}

//           {error && (
//             <Typography color="error" className={styles.error}>
//               {error}
//             </Typography>
//           )}
//         </CardContent>
//       </Card>

//       {results && (
//         <Paper className={styles.resultsContainer}>
//           <Typography variant="h6" gutterBottom>
//             Analysis Results
//           </Typography>

//           <Box className={styles.resultSection}>
//             <Typography variant="subtitle1" color="primary">
//               Detected Medicines
//             </Typography>
//             {results.medicines.map((medicine, index) => (
//               <Accordion key={index} className={styles.medicineAccordion}>
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Typography>{medicine.name}</Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <List>
//                     <ListItem>
//                       <ListItemText 
//                         primary="Dosage"
//                         secondary={medicine.dosage || 'Not specified'}
//                       />
//                     </ListItem>
//                     <ListItem>
//                       <ListItemText 
//                         primary="Frequency"
//                         secondary={medicine.frequency || 'Not specified'}
//                       />
//                     </ListItem>
//                     {medicine.details && (
//                       <>
//                         <ListItem>
//                           <ListItemText 
//                             primary="Usage"
//                             secondary={medicine.details.usage || 'Not specified'}
//                           />
//                         </ListItem>
//                         <ListItem>
//                           <ListItemText 
//                             primary="Warnings"
//                             secondary={medicine.details.warnings || 'Not specified'}
//                             className={styles.warningText}
//                           />
//                         </ListItem>
//                         {medicine.details.commonDosages?.length > 0 && (
//                           <ListItem>
//                             <ListItemText 
//                               primary="Common Dosages"
//                               secondary={medicine.details.commonDosages.join(', ')}
//                             />
//                           </ListItem>
//                         )}
//                       </>
//                     )}
//                   </List>
//                 </AccordionDetails>
//               </Accordion>
//             ))}
//           </Box>

//           {results.diagnosis && (
//             <Box className={styles.resultSection}>
//               <Typography variant="subtitle1" color="primary">
//                 Possible Diagnosis
//               </Typography>
//               <Typography variant="body1">
//                 {results.diagnosis}
//               </Typography>
//             </Box>
//           )}

//           <Box className={styles.resultSection}>
//             <Typography variant="subtitle1" color="primary">
//               Medication Plan
//             </Typography>
//             <List>
//               {results.medicationPlan.map((instruction, index) => (
//                 <ListItem key={index}>
//                   <ListItemText primary={instruction} />
//                 </ListItem>
//               ))}
//             </List>
//           </Box>
//         </Paper>
//       )}
//     </Box>
//   );
// };

// export default PrescriptionRecognition;