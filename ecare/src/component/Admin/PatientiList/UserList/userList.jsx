import React, { useState, useEffect } from "react";
import { Switch, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, MenuItem, Select } from "@mui/material";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import styles from "./userList.module.css";
import PageTitle from '../../../Common/PageTitle';

const UserList = ({
  userType,
  fetchUsers,
  toggleUserStatus,
  editUserDetails,
}) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await fetchUsers();
      const formattedUsers = Array.isArray(fetchedUsers) ? fetchedUsers : [];
      setUsers(formattedUsers.map(user => ({ ...user, isDisabled: user.isDisabled || false })));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
      setUsers([]);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await toggleUserStatus(id, updatedStatus);
      setUsers(users.map(user => user._id === id ? { ...user, isDisabled: updatedStatus } : user));
      toast.success(`User ${updatedStatus ? "disabled" : "enabled"} successfully`);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Error updating user status");
    }
  };

  const handleEdit = (user) => setEditingUser({ ...user });

  const handleSave = async () => {
    try {
      await editUserDetails(editingUser._id, editingUser);
      setUsers(users.map(user => user._id === editingUser._id ? editingUser : user));
      setEditingUser(null);
      toast.success("User details updated successfully");
    } catch (error) {
      toast.error("Error updating user details");
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.userListContainer}>
      <div className={styles.searchContainer}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchField}
        />
      </div>
      <PageTitle>Patients</PageTitle>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Date of Birth</TableCell>
            <TableCell>Date Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow key={user._id}>
              <TableCell>{editingUser && editingUser._id === user._id ? (
                <TextField
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              ) : user.name}</TableCell>
              <TableCell>{editingUser && editingUser._id === user._id ? (
                <TextField
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              ) : user.email}</TableCell>
              <TableCell>{editingUser && editingUser._id === user._id ? (
                <Select
                  value={editingUser.gender}
                  onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              ) : user.gender || "N/A"}</TableCell>
              <TableCell>{editingUser && editingUser._id === user._id ? (
                <TextField
                  type="date"
                  value={editingUser.dateOfBirth ? new Date(editingUser.dateOfBirth).toISOString().split("T")[0] : ""}
                  onChange={(e) => setEditingUser({ ...editingUser, dateOfBirth: e.target.value })}
                />
              ) : user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>{user.date_created ? new Date(user.date_created).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>
                {editingUser && editingUser._id === user._id ? (
                  <>
                    <Button onClick={handleSave} variant="contained" color="primary" size="small">
                      Save
                    </Button>
                    <Button onClick={() => setEditingUser(null)} variant="outlined" color="secondary" size="small">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => handleEdit(user)}>
                      <EditIcon />
                    </IconButton>
                    <Switch
                      checked={!user.isDisabled}
                      onChange={() => handleToggle(user._id, user.isDisabled)}
                      color="primary"
                    />
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;
