import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Add this
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Grid, Card, CardContent,
  TextField, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '../contexts/AppContext';

export default function AdminDashboard() {
  const navigate = useNavigate(); // <-- Add this
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    name: '', username: '', password: '', hospital: '', rating: '', timing: '', age: '', gender: '', contact: ''
  });
  const [snackOpen, setSnackOpen] = useState(false);

  // Use context data and functions
  const {
    doctors,
    labAssistants,
    addDoctor,
    addLabAssistant,
    removeDoctor,
    removeLabAssistant
  } = useAppContext();

  const requiredFields = ['name', 'username', 'password', 'hospital', 'rating', 'timing', 'age', 'gender', 'contact'];
  const isFormValid = requiredFields.every(field => form[field] && form[field].trim() !== '');

  const handleTabChange = (e, newValue) => setTab(newValue);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!isFormValid) {
      alert('Please fill in all fields before adding.');
      return;
    }
    if (tab === 0) {
      addDoctor({ ...form });
    } else {
      addLabAssistant({ ...form });
    }
    setForm({ name: '', username: '', password: '', hospital: '', rating: '', timing: '', age: '', gender: '', contact: '' });
    setSnackOpen(true);
  };

  // Remove doctor/lab assistant by index
  const handleRemove = (idx) => {
    if (tab === 0) {
      removeDoctor(idx);
    } else {
      removeLabAssistant(idx);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          {/* Working logout button */}
          <Button color="inherit" onClick={() => navigate('/')}>
            LOGOUT
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Card elevation={2} sx={{ p: 2 }}>
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab label="Doctors" />
            <Tab label="Lab Assistants" />
          </Tabs>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add {tab === 0 ? 'Doctor' : 'Lab Assistant'}
            </Typography>
            <Grid container spacing={2}>
              {requiredFields.map((field) => (
                <Grid item xs={12} md={4} key={field}>
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    type={field === "password" ? "password" : "text"}
                    value={form[field]}
                    onChange={handleChange}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAdd}
                  sx={{ mt: 1 }}
                  disabled={!isFormValid}
                >
                  Add {tab === 0 ? 'Doctor' : 'Lab Assistant'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Card elevation={2} sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {tab === 0 ? 'Doctors' : 'Lab Assistants'} List
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Timing</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(tab === 0 ? doctors : labAssistants).map((row, idx) => (
                  <TableRow key={row.id || idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.hospital}</TableCell>
                    <TableCell>{row.rating}</TableCell>
                    <TableCell>{row.timing}</TableCell>
                    <TableCell>{row.age}</TableCell>
                    <TableCell>{row.gender}</TableCell>
                    <TableCell>{row.contact}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemove(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: '100%' }}>
          {tab === 0 ? 'Doctor' : 'Lab Assistant'} added successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
