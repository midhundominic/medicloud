import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import Logo from '../../../assets/images/logo.png';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Roboto',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    opacity: 0.05,
    width: 400,
    height: 400,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '1pt solid #1a237e',
    paddingBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    color: '#1a237e',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  receiptBox: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    border: '1pt solid #e0e0e0',
    marginBottom: 15,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
    paddingBottom: 3,
    borderBottom: '1pt solid #e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
  },
  label: {
    color: '#666',
    fontSize: 10,
    flex: 1,
  },
  value: {
    color: '#333',
    fontSize: 10,
    flex: 2,
    fontWeight: 500,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginVertical: 10,
    padding: 8,
    backgroundColor: '#e8eaf6',
    borderRadius: 4,
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    color: '#666',
    fontSize: 8,
    borderTop: '1pt solid #e0e0e0',
    paddingTop: 10,
  },
  brandText: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 24,
    color: '#1a237e',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 10,
    color: '#666',
  },
});

const PaymentReceiptTemplate = ({ payment, appointment, patient, doctor }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark */}
      <Image src={Logo} style={styles.watermark} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image src={Logo} style={styles.logo} />
          <View style={styles.brandText}>
            <Text style={styles.brandName}>medicloud</Text>
            <Text style={styles.tagline}>Your Health, Our Priority</Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            Date: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>

      {/* Receipt Content */}
      <View style={styles.receiptBox}>
        <Text style={styles.receiptTitle}>Payment Receipt</Text>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{patient?.name || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{patient?.email || 'N/A'}</Text>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Doctor:</Text>
            <Text style={styles.value}>
              Dr. {doctor?.firstName} {doctor?.lastName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Specialization:</Text>
            <Text style={styles.value}>{doctor?.specialization || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {appointment?.appointmentDate ? 
                new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'
              }
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{appointment?.timeSlot || 'N/A'}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID:</Text>
            <Text style={styles.value}>{payment?._id || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Date:</Text>
            <Text style={styles.value}>
              {payment?.createdAt ? 
                new Date(payment.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'
              }
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Time:</Text>
            <Text style={styles.value}>
              {payment?.createdAt ? 
                new Date(payment.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'
              }
            </Text>
            </View>
            <View style={styles.row}>
            <Text style={styles.label}>Payment Amount:</Text>
            <Text style={styles.value}>₹{payment?.amount?.toFixed(2) || '0.00'}</Text>
            </View>
        </View>

        {/* Amount */}
       
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>This is a computer-generated receipt and does not require a signature.</Text>
        <Text style={{ marginTop: 3 }}>For any queries, please contact support@medicloud.com</Text>
        <Text style={{ marginTop: 3 }}>Thank you for choosing medicloud for your healthcare needs</Text>
      </View>
    </Page>
  </Document>
);

export default PaymentReceiptTemplate;