import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Grid, Card, CardContent,
  List, ListItem, ListItemText, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { PDFDownloadLink } from '@react-pdf/renderer';
import LabReportPDF from '../components/LabReportPDF';
import { useAppContext } from '../contexts/AppContext';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const {
    appointments,
    patients,
    labReports,
    addPrescriptionToReport
  } = useAppContext();

  const doctorId = 1; // For demo

  // Appointments for this doctor
  const myAppointments = appointments.filter(a => a.doctorId === doctorId);

  // New patients: appointments without prescription
  const newPatients = myAppointments.filter(a => !a.prescribed);
  // Existing patients: appointments with prescription
  const existingPatients = myAppointments.filter(a => a.prescribed);

  // Dialog state for viewing patient reports
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Dialog state for prescription editing
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [precautionsText, setPrecautionsText] = useState('');
  const [bedRestText, setBedRestText] = useState('');
  const [drugsText, setDrugsText] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [selectedReportIndex, setSelectedReportIndex] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);

  // Open dialog to view patient reports
  const handleViewPatient = (patientId) => {
    setSelectedPatient(patients.find(p => p.id === patientId));
    setViewOpen(true);
  };

  // Open dialog for a specific report
  const handleOpenPrescriptionDialog = (reportIdx, report) => {
    setSelectedReportIndex(reportIdx);
    setPrescriptionText(report.prescription || '');
    setPrecautionsText(report.precautions || '');
    setBedRestText(report.bedRest || '');
    setDrugsText(report.drugs || '');
    setNextDate(report.nextDate || '');
    setPrescriptionDialogOpen(true);
  };

  // Save prescription/notes to report
  const handleSavePrescription = () => {
    addPrescriptionToReport(
      selectedReportIndex,
      {
        prescription: prescriptionText,
        precautions: precautionsText,
        bedRest: bedRestText,
        drugs: drugsText,
        nextDate: nextDate
      }
    );
    setPrescriptionDialogOpen(false);
    setSnackOpen(true);
  };

  // Get all lab reports for selected patient & this doctor
  const selectedPatientReports = selectedPatient
    ? labReports
        .map((r, idx) => ({ ...r, _idx: idx }))
        .filter(r => r.patientId === selectedPatient.id && r.doctorId === doctorId)
    : [];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Doctor Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            LOGOUT
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* New Patients */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  New Patients (Queue)
                </Typography>
                <List>
                  {newPatients.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No new patients in queue.
                    </Typography>
                  ) : (
                    newPatients.map((appt, idx) => {
                      const patient = patients.find(p => p.id === appt.patientId);
                      return (
                        <ListItem key={idx} alignItems="flex-start">
                          <ListItemText
                            primary={patient?.name}
                            secondary={
                              <>
                                <Typography variant="body2">
                                  <strong>Hospital:</strong> {patient?.hospital || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Appointment:</strong> {appt.date} | {appt.timing}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Contact:</strong> {patient?.contact}
                                </Typography>
                              </>
                            }
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            View
                          </Button>
                        </ListItem>
                      );
                    })
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          {/* Existing Patients */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Existing Patients
                </Typography>
                <List>
                  {existingPatients.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No existing patients.
                    </Typography>
                  ) : (
                    existingPatients.map((appt, idx) => {
                      const patient = patients.find(p => p.id === appt.patientId);
                      return (
                        <ListItem key={idx} alignItems="flex-start">
                          <ListItemText
                            primary={patient?.name}
                            secondary={
                              <>
                                <Typography variant="body2">
                                  <strong>Hospital:</strong> {patient?.hospital || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Next Appointment:</strong> {appt.nextDate}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Contact:</strong> {patient?.contact}
                                </Typography>
                              </>
                            }
                          />
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            View
                          </Button>
                        </ListItem>
                      );
                    })
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Patient Reports Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Patient Reports: {selectedPatient?.name}
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedPatientReports.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No lab reports for this patient yet.
              </Typography>
            ) : (
              selectedPatientReports.map((report, idx) => (
                <ListItem key={idx} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <ListItemText
                      primary={`Report #${idx + 1} - Stage: ${report.stage || 'N/A'}`}
                      secondary={
                        <>
                          <Typography variant="body2">
                            <strong>Date:</strong> {new Date(report.createdAt || Date.now()).toLocaleDateString()}
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
                          patient={selectedPatient}
                          doctor={{ name: "Dr. " + doctorId }}
                        />
                      }
                      fileName={`lab-report-${selectedPatient?.name?.replace(/\s/g, '_') || 'patient'}-${idx+1}.pdf`}
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
                  {report.prescription || report.precautions || report.bedRest || report.drugs || report.nextDate ? (
                    <Box sx={{ mt: 1, mb: 1, pl: 1 }}>
                      <Typography variant="body2" color="success.main">
                        <strong>Prescription:</strong> {report.prescription}
                      </Typography>
                      <Typography variant="body2" color="info.main">
                        <strong>Precautions (Do's & Don'ts):</strong> {report.precautions}
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        <strong>Bed Rest:</strong> {report.bedRest}
                      </Typography>
                      <Typography variant="body2" color="primary.main">
                        <strong>Drugs:</strong> {report.drugs}
                      </Typography>
                      <Typography variant="body2" color="secondary.main">
                        <strong>Next Appointment:</strong> {report.nextDate}
                      </Typography>
                    </Box>
                  ) : null}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenPrescriptionDialog(report._idx, report)}
                    sx={{ mt: 1, alignSelf: 'flex-end' }}
                  >
                    {report.prescription || report.precautions || report.bedRest || report.drugs || report.nextDate
                      ? 'Edit Prescription & Details'
                      : 'Add Prescription & Details'}
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={prescriptionDialogOpen} onClose={() => setPrescriptionDialogOpen(false)}>
        <DialogTitle>Add/Edit Prescription & Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Prescription"
            fullWidth
            margin="normal"
            value={prescriptionText}
            onChange={e => setPrescriptionText(e.target.value)}
          />
          <TextField
            label="Precautions (Do's & Don'ts)"
            fullWidth
            margin="normal"
            value={precautionsText}
            onChange={e => setPrecautionsText(e.target.value)}
          />
          <TextField
            label="Bed Rest"
            fullWidth
            margin="normal"
            value={bedRestText}
            onChange={e => setBedRestText(e.target.value)}
          />
          <TextField
            label="Drugs"
            fullWidth
            margin="normal"
            value={drugsText}
            onChange={e => setDrugsText(e.target.value)}
          />
          <TextField
            label="Next Appointment Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={nextDate}
            onChange={e => setNextDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrescriptionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePrescription}
            disabled={!prescriptionText || !nextDate}
          >
            Save
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
          Prescription and details saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
