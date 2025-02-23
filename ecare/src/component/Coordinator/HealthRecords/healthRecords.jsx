import React, { useState, useEffect } from 'react';
import { getPatients, addHealthRecord, getPatientRecords, updateHealthRecord } from '../../../services/healthDataServices';
import { getCoordinator } from '../../../services/coordinatorServices';
import DynamicForm from '../../Common/DynamicForm';
import Modal from 'react-modal';
import './healthRecords.module.css';

// Set the app element for React Modal for accessibility (only needs to be done once)
Modal.setAppElement('#root');

const CoordinatorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewRecords, setViewRecords] = useState(false);
  const [records, setRecords] = useState([]);
  const [coordinatorId, setCoordinatorId] = useState("");

  useEffect(() => {
    // Fetch all patients
    const fetchPatients = async () => {
      const data = await getPatients();
      setPatients(data);
    };

    // Fetch coordinatorId from localStorage
    const fetchCoordinatorId = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const fetchedCoordinatorId = userData?.coordinatorId;
        
        if (fetchedCoordinatorId) {
          setCoordinatorId(fetchedCoordinatorId); // Set the coordinatorId state
        } else {
          console.error("Coordinator ID not found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching coordinator ID", error);
      }
    };

    fetchPatients();
    fetchCoordinatorId(); // Fetch and set coordinator ID
  }, []);

  // Open Modal and Manage patient records
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
    setViewRecords(false);  // Default to add record mode
  };

  // Fetch and view records
  const handleViewRecords = async () => {
    const data = await getPatientRecords(selectedPatient._id);
    setRecords(data);
    setViewRecords(true);
  };

  // Add or update records for a patient
  const handleAddRecord = async (fields) => {
    if (!coordinatorId) {
      console.error("Coordinator ID is not set.");
      return;
    }

    await addHealthRecord({
      patientId: selectedPatient._id,
      coordinatorId: coordinatorId,
      fields,
    });

    setShowModal(false); // Close modal after saving
  };

  return (
    <div>
      <h1>Patients</h1>
      <ul>
        {patients.map((patient) => (
          <li key={patient._id}>
            {patient.name} ({patient.email})
            <button onClick={() => handlePatientClick(patient)}>Manage</button>
          </li>
        ))}
      </ul>

      {showModal && (
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          contentLabel="Manage Patient"
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
            }
          }}
        >
          {viewRecords ? (
            <div>
              <h2>Health Records for {selectedPatient.name}</h2>
              {records.map((record, index) => (
                <div key={index}>
                  {record.fields.map((field, i) => (
                    <p key={i}>{field.label}: {field.value} {field.unit}</p>
                  ))}
                  <button onClick={() => updateHealthRecord(record._id)}>Edit Record</button>
                  <hr />
                </div>
              ))}
              <button onClick={() => setViewRecords(false)}>Add New Record</button>
            </div>
          ) : (
            <div>
              <DynamicForm onSave={handleAddRecord} />
              <button onClick={handleViewRecords}>View Records</button> {/* View Records Button */}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
