import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';
import { createTest, getAllTests, updateTest, deleteTest } from '../../../services/labTestServices';

const LabTest = () => {
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({ label: '', amount: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await getAllTests();
      setTests(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Error fetching tests');
      setTests([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTest(editingId, newTest);
        toast.success('Test updated successfully');
      } else {
        await createTest(newTest);
        toast.success('Test added successfully');
      }
      setNewTest({ label: '', amount: '' });
      setEditingId(null);
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving test');
    }
  };

  const handleEdit = (test) => {
    setNewTest({ label: test.label, amount: test.amount });
    setEditingId(test._id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTest(id);
      toast.success('Test deleted successfully');
      fetchTests();
    } catch (error) {
      toast.error('Error deleting test');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <h2>Manage Laboratory Tests</h2>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Test Name"
              value={newTest.label}
              onChange={(e) => setNewTest({ ...newTest, label: e.target.value })}
              required
            />
            <TextField
              label="Amount"
              type="number"
              value={newTest.amount}
              onChange={(e) => setNewTest({ ...newTest, amount: e.target.value })}
              required
            />
            <Button type="submit" variant="contained">
              {editingId ? 'Update Test' : 'Add Test'}
            </Button>
          </Box>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(tests) && tests.map((test) => (
              <TableRow key={test._id}>
                <TableCell>{test.label}</TableCell>
                <TableCell>Rs.{test.amount}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(test)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(test._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LabTest;
