import React, { useState, useEffect } from 'react';
import { getCompletedTests, updateTestResult } from '../../../services/coordinatorServices';
import { toast } from 'react-toastify';
import styles from './completedTest.module.css';

const CompletedTests = () => {
  const [completedTests, setCompletedTests] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [results, setResults] = useState({});

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchCompletedTests = async () => {
    try {
      const tests = await getCompletedTests();
      setCompletedTests(tests);
      const initialResults = {};
      const initialEditMode = {};
      tests.forEach(appointment => {
        appointment.prescription.tests.forEach(test => {
          initialResults[`${appointment._id}-${test._id}`] = test.result;
          initialEditMode[`${appointment._id}-${test._id}`] = false;
        });
      });
      setResults(initialResults);
      setEditMode(initialEditMode);
    } catch (error) {
      console.error("Error fetching completed tests:", error);
      toast.error("Failed to fetch completed tests");
    }
  };

  const handleResultChange = (appointmentId, testId, value) => {
    setResults(prev => ({
      ...prev,
      [`${appointmentId}-${testId}`]: value
    }));
  };

  const handleEditResult = (appointmentId, testId) => {
    setEditMode(prev => ({
      ...prev,
      [`${appointmentId}-${testId}`]: true
    }));
  };

  const handleUpdateResult = async (appointmentId, testId) => {
    try {
      const result = results[`${appointmentId}-${testId}`];
      await updateTestResult(appointmentId, testId, result);
      toast.success("Test result updated successfully");
      setEditMode(prev => ({
        ...prev,
        [`${appointmentId}-${testId}`]: false
      }));
      fetchCompletedTests();
    } catch (error) {
      console.error("Error updating test result:", error);
      toast.error("Failed to update test result");
    }
  };

  return (
    <div className={styles.completedTestsContainer}>
      <h2 className={styles.title}>Completed Tests</h2>
      {completedTests.map((appointment) => (
        <div key={appointment._id} className={styles.appointmentCard}>
          <h3 className={styles.patientName}>Patient: {appointment.patientId.name}</h3>
          <p className={styles.doctorName}>Doctor: Dr. {appointment.doctorId.firstName} {appointment.doctorId.lastName}</p>
          <p className={styles.appointmentDate}>Date: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
          {appointment.prescription.tests.map((test) => (
            <div key={test._id} className={styles.testItem}>
              <p className={styles.testName}>Test: {test.name}</p>
              {!editMode[`${appointment._id}-${test._id}`] ? (
                <>
                  <p className={styles.testResult}>Result: {test.result}</p>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditResult(appointment._id, test._id)}
                  >
                    Edit Result
                  </button>
                </>
              ) : (
                <div className={styles.resultInputContainer}>
                  <input
                    type="text"
                    className={styles.resultInput}
                    value={results[`${appointment._id}-${test._id}`]}
                    onChange={(e) => handleResultChange(appointment._id, test._id, e.target.value)}
                  />
                  <button
                    className={styles.submitButton}
                    onClick={() => handleUpdateResult(appointment._id, test._id)}
                  >
                    Update Result
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CompletedTests;