import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import Logo from "../../../assets/images/logo.png";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf", fontWeight: 500 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf", fontWeight: 400, fontStyle: "italic" },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-lightitalic-webfont.ttf", fontWeight: 300, fontStyle: "italic" },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-mediumitalic-webfont.ttf", fontWeight: 500, fontStyle: "italic" },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf", fontWeight: 700, fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Roboto",
    position: "relative",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    opacity: 0.05,
    width: 400,
    height: 400,
    zIndex: -1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: "1pt solid #1a237e",
    paddingBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  brandText: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 24,
    color: "#1a237e",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  doctorInfo: {
    alignItems: "flex-end",
  },
  doctorName: {
    fontSize: 14,
    color: "#1a237e",
    fontWeight: "bold",
  },
  doctorDetails: {
    fontSize: 10,
    color: "#666",
  },
  prescriptionBox: {
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    border: "1pt solid #e0e0e0",
    marginBottom: 15,
  },
  prescriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a237e",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 8,
    paddingBottom: 3,
    borderBottom: "1pt solid #e0e0e0",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
    paddingVertical: 2,
  },
  label: {
    color: "#666",
    fontSize: 10,
    width: "30%",
  },
  value: {
    color: "#333",
    fontSize: 10,
    width: "70%",
    fontWeight: 500,
  },
  medicineSection: {
    marginTop: 20,
  },
  medicineItem: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  medicineText: {
    fontSize: 10,
    color: "#333",
    marginBottom: 2,
  },
  medicineInstruction: {
    fontSize: 9,
    color: "#666",
    fontStyle: "normal",
  },
  footer: {
    marginTop: "auto",
    textAlign: "center",
    color: "#666",
    fontSize: 8,
    borderTop: "1pt solid #e0e0e0",
    paddingTop: 10,
  },
  signature: {
    marginTop: 40,
    alignItems: "flex-end",
    paddingRight: 20,
  },
  signatureText: {
    fontSize: 10,
    color: "#1a237e",
    fontWeight: "bold",
  },
});

const PrescriptionTemplate = ({ prescription, doctor, patient }) => {
  // Add default values and null checks
  const doctorName = doctor
    ? `${doctor.firstName || ""} ${doctor.lastName || ""}`
    : "N/A";
  const doctorSpecialization = doctor?.specialization || "N/A";
  const registrationNumber = doctor?.registrationNumber || "N/A";
  const patientName = patient?.name || "N/A";
  const patientAge = patient?.age || "N/A";
  const patientGender = patient?.gender || "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Image src={Logo} style={styles.watermark} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image src={Logo} style={styles.logo} />
            <View style={styles.brandText}>
              <Text style={styles.brandName}>medicloud</Text>
              <Text style={styles.tagline}>Your Health, Our Priority</Text>
            </View>
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. {doctorName}</Text>
            <Text style={styles.doctorDetails}>{doctorSpecialization}</Text>
            <Text style={styles.doctorDetails}>Reg. No: {registrationNumber}</Text>
          </View>
        </View>

        {/* Prescription Content */}
        <View style={styles.prescriptionBox}>
          <Text style={styles.prescriptionTitle}>Medical Prescription</Text>

          {/* Patient Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{patientName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Age/Gender:</Text>
              <Text style={styles.value}>{patientAge} years / {patientGender}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>

          {/* Medicines */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescribed Medicines</Text>
            {prescription?.medicines?.map((med, index) => (
              <View key={index} style={styles.medicineItem}>
                <Text style={styles.medicineText}>
                  {index + 1}. {med.medicine?.name || "N/A"} - {med.frequency || "N/A"}
                </Text>
                <Text style={styles.medicineInstruction}>
                  Duration: {med.days || 0} days
                  {med.beforeFood ? " (Before Food)" : " (After Food)"}
                  {med.isSOS ? " (SOS)" : ""}
                </Text>
              </View>
            ))}
          </View>

          {/* Tests */}
          {prescription?.tests?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended Tests</Text>
              {prescription.tests.map((test, index) => (
                <View key={index} style={styles.medicineItem}>
                  <Text style={styles.medicineText}>
                    {index + 1}. {test.testName || "N/A"}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Notes */}
          {prescription?.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={[styles.medicineText, { paddingLeft: 10 }]}>
                {prescription.notes}
              </Text>
            </View>
          )}

          {/* Digital Signature */}
          <View style={styles.signature}>
            <Text style={styles.signatureText}>Dr. {doctorName}</Text>
            <Text style={styles.doctorDetails}>{doctorSpecialization}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a digital prescription generated through medicloud</Text>
          <Text style={{ marginTop: 3 }}>For any queries, please contact your healthcare provider</Text>
          <Text style={{ marginTop: 3 }}>Keep this prescription for your records</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PrescriptionTemplate;
