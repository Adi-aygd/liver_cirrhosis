import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Grid, Card, CardContent,
  TextField, InputAdornment, List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import { PDFDownloadLink } from '@react-pdf/renderer';
import LabReportPDF from '../components/LabReportPDF';
import { useAppContext } from '../contexts/AppContext';

const FIRST_REPORT_FIELDS = [
  'age', 'sex', 'albumin', 'bilirubin', 'alt', 'ast', 'alp',
  'inr', 'platelets', 'sodium', 'creatinine', 'ascites',
  'hepatomegaly', 'spiders', 'edema'
];
const SUBSEQUENT_FIELDS = [
  ...FIRST_REPORT_FIELDS, 'stage', 'bedrest', 'drugs'
];

export default function LabDashboard() {
  const navigate = useNavigate();
  const {
    patients,
    labReports,
    addLabReport,
    appointments,
    doctors
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  // Lab report form fields
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    albumin: '',
    bilirubin: '',
    alt: '',
    ast: '',
    alp: '',
    inr: '',
    platelets: '',
    sodium: '',
    creatinine: '',
    ascites: '',
    hepatomegaly: '',
    spiders: '',
    edema: '',
    stage: '',
    bedrest: '',
    drugs: ''
  });

  // Handle patient search
  const handleSearch = () => {
    setHasSearched(true);
    const results = patients.filter(patient =>
      patient.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setOpen(true);
  };

  const handleCreateReport = () => {
    setOpen(false);
    setReportOpen(true);
    setFormData(prev => ({
      ...prev,
      age: selectedPatient.age,
      sex: selectedPatient.gender === 'Male' ? 'M' : 'F'
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitReport = () => {
    // Assign doctorId from the latest appointment
    const latestAppointment = appointments
      .filter(a => a.patientId === selectedPatient.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const doctorId = latestAppointment?.doctorId || 1;

    // Pick only the fields for this report type
    const isFirstReport = patientLabReports.length === 0;
    const fields = isFirstReport ? FIRST_REPORT_FIELDS : SUBSEQUENT_FIELDS;
    const reportData = {};
    fields.forEach(field => {
      reportData[field] = formData[field];
    });

    addLabReport(selectedPatient.id, doctorId, reportData);
    setReportOpen(false);
    setSnackOpen(true);
  };

  // Show lab reports for this patient
  const patientLabReports = selectedPatient
    ? labReports.filter(r => r.patientId === selectedPatient.id)
    : [];

  // Which fields to show in the form
  const isFirstReport = patientLabReports.length === 0;
  const reportFields = isFirstReport ? FIRST_REPORT_FIELDS : SUBSEQUENT_FIELDS;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Lab Assistant Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            LOGOUT
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Search Patient
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by username or name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSearch}
                          disabled={!searchTerm}
                        >
                          Search
                        </Button>
                      </InputAdornment>
                    ),
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          {hasSearched && (
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Search Results
                  </Typography>
                  {searchResults.length > 0 ? (
                    <List>
                      {searchResults.map((patient) => (
                        <ListItem
                          key={patient.id}
                          sx={{
                            border: '1px solid #eee',
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: '#e8f5e9'
                          }}
                          secondaryAction={
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleViewPatient(patient)}
                            >
                              VIEW
                            </Button>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={patient.name}
                            secondary={
                              <>
                                Username: {patient.username} | Age: {patient.age}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No patients found matching your search.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {labReports.length === 0
                    ? "No recent reports created."
                    : `Total reports created: ${labReports.length}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lab Statistics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reports created today: {labReports.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reports pending: 0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* All patients and their reports */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            All Patients & Reports
          </Typography>
          <Grid container spacing={3}>
            {patients.map((patient) => {
              const reports = labReports
                .map((r, idx) => ({ ...r, _idx: idx }))
                .filter(r => r.patientId === patient.id);
              return (
                <Grid item xs={12} md={6} key={patient.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {patient.name} (Age: {patient.age}, Gender: {patient.gender})
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Contact: {patient.contact}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mb: 2 }}
                        onClick={() => handleViewPatient(patient)}
                      >
                        Create New Report
                      </Button>
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>Lab Reports</Typography>
                      <List>
                        {reports.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No lab reports for this patient yet.
                          </Typography>
                        ) : (
                          reports.map((report, idx) => (
                            <ListItem key={idx} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                <ListItemText
                                  primary={`Report #${idx + 1} - Stage: ${report.stage || 'N/A'}`}
                                  secondary={
                                    <>
                                      <Typography variant="body2">
                                        <strong>Date:</strong> {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>Albumin:</strong> {report.albumin} | <strong>Bilirubin:</strong> {report.bilirubin}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>ALT:</strong> {report.alt} | <strong>AST:</strong> {report.ast}
                                      </Typography>
                                    </>
                                  }
                                />
                                <PDFDownloadLink
                                  document={
                                    <LabReportPDF
                                      report={report}
                                      patient={patient}
                                      doctor={doctors.find(d => d.id === report.doctorId)}
                                    />
                                  }
                                  fileName={`lab-report-${patient?.name?.replace(/\s/g, '_') || 'patient'}-${idx+1}.pdf`}
                                >
                                  {({ loading }) => (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<DownloadIcon />}
                                      disabled={loading}
                                      sx={{ ml: 2, mt: 1 }}
                                    >
                                      {loading ? 'Loading...' : 'PDF'}
                                    </Button>
                                  )}
                                </PDFDownloadLink>
                              </Box>
                              {/* Show prescription and notes for this report */}
                              {(report.prescription || report.precautions || report.bedRest || report.drugs || report.nextDate) && (
                                <Box sx={{ mt: 1, mb: 1, pl: 1 }}>
                                  {report.prescription && (
                                    <Typography variant="body2" color="success.main">
                                      <strong>Prescription:</strong> {report.prescription}
                                    </Typography>
                                  )}
                                  {report.precautions && (
                                    <Typography variant="body2" color="info.main">
                                      <strong>Precautions (Do's & Don'ts):</strong> {report.precautions}
                                    </Typography>
                                  )}
                                  {report.bedRest && (
                                    <Typography variant="body2" color="warning.main">
                                      <strong>Bed Rest:</strong> {report.bedRest}
                                    </Typography>
                                  )}
                                  {report.drugs && (
                                    <Typography variant="body2" color="primary.main">
                                      <strong>Drugs:</strong> {report.drugs}
                                    </Typography>
                                  )}
                                  {report.nextDate && (
                                    <Typography variant="body2" color="secondary.main">
                                      <strong>Next Appointment:</strong> {report.nextDate}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </ListItem>
                          ))
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>
      {/* Patient Details Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Patient Details</DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <>
              <Typography variant="h6">{selectedPatient.name}</Typography>
              <Typography variant="body1">Age: {selectedPatient.age} | Gender: {selectedPatient.gender}</Typography>
              <Typography variant="body1">Contact: {selectedPatient.contact}</Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Lab Reports for this patient: {patientLabReports.length}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateReport}
          >
            Create Lab Report
          </Button>
        </DialogActions>
      </Dialog>
      {/* Create Report Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Lab Report</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Patient: {selectedPatient?.name}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {reportFields.map(field => (
              <Grid item xs={12} md={6} key={field}>
                <TextField
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  value={formData[field]}
                  onChange={handleFormChange}
                  fullWidth
                  margin="dense"
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f4f8', borderRadius: 1 }}>
            <Typography variant="subtitle1">ML Model Prediction:</Typography>
            <Typography variant="body2">
              The prediction will appear here after submitting the form.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitReport}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
      {/* Success Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: '100%' }}>
          Lab report created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
