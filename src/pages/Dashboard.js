import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import LabReportPDF from '../components/LabReportPDF';
import DownloadIcon from '@mui/icons-material/Download';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Grid, Card, CardContent,
  List, ListItem, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, Chip, ListItemText
} from '@mui/material';
import { useAppContext } from '../contexts/AppContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { doctors, appointments, bookAppointment, patients, labReports } = useAppContext();
  const patientId = 1; // For demo

  const [open, setOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const myAppointments = appointments.filter(a => a.patientId === patientId);
  const canBook = myAppointments.length === 0;

  // Lab reports for this patient
  const myLabReports = labReports.filter(r => r.patientId === patientId);

  // Get latest report for next appointment
  const latestReport = myLabReports.length > 0 ? myLabReports[myLabReports.length - 1] : null;

  const prepareChartData = () => {
    if (myLabReports.length === 0) return [];
    return myLabReports.map((report, index) => ({
      name: `Report ${index + 1}`,
      albumin: parseFloat(report.albumin) || 0,
      bilirubin: parseFloat(report.bilirubin) || 0,
      alt: parseFloat(report.alt) || 0,
      ast: parseFloat(report.ast) || 0,
    }));
  };

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDoctor(null);
    setAppointmentDate('');
  };

  const handleBookAppointment = () => {
    bookAppointment(patientId, selectedDoctor.id, appointmentDate);
    setOpen(false);
    setSnackOpen(true);
    setSelectedDoctor(null);
    setAppointmentDate('');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, letterSpacing: 1 }}>
            Patient Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            LOGOUT
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4} alignItems="flex-start">
          {/* Show Available Doctors at the top if canBook */}
          {canBook && (
            <Grid item xs={12}>
              <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Available Doctors
                  </Typography>
                  <List>
                    {doctors.map((doc) => (
                      <ListItem key={doc.id}>
                        <ListItemText
                          primary={doc.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {doc.hospital}
                              </Typography>
                              <br />
                              Rating: {doc.rating} | Timing: {doc.timing} | Status: {doc.status}
                            </>
                          }
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={!canBook || doc.status !== 'Available'}
                          onClick={() => handleBookClick(doc)}
                          sx={{ ml: 2 }}
                        >
                          Book
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Left: Prescriptions & Precautions (big, half the page) */}
          <Grid item xs={12} md={7}>
            <Card elevation={4} sx={{ p: 4, minHeight: 400, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, letterSpacing: 1 }}>
                  Prescriptions & Precautions
                </Typography>
                {myLabReports.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    Your doctor’s prescriptions and advice will be shown here.
                  </Typography>
                ) : (
                  <List>
                    {myLabReports.map((report, idx) => (
                      <Box key={idx} sx={{
                        mb: 4, p: 3, borderRadius: 3, bgcolor: "#f3f7fa",
                        border: "1px solid #e0e0e0", boxShadow: 2
                      }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                          Report #{idx + 1}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Doctor:</strong> {doctors.find(d => d.id === report.doctorId)?.name || 'N/A'}
                        </Typography>
                        {report.prescription && (
                          <Typography variant="body1" color="success.main" sx={{ mb: 0.5 }}>
                            <strong>Prescription:</strong> {report.prescription}
                          </Typography>
                        )}
                        {report.precautions && (
                          <Typography variant="body1" color="info.main" sx={{ mb: 0.5 }}>
                            <strong>Precautions (Do's & Don'ts):</strong> {report.precautions}
                          </Typography>
                        )}
                        {report.bedRest && (
                          <Typography variant="body1" color="warning.main" sx={{ mb: 0.5 }}>
                            <strong>Bed Rest:</strong> {report.bedRest}
                          </Typography>
                        )}
                        {report.drugs && (
                          <Typography variant="body1" color="primary.main" sx={{ mb: 0.5 }}>
                            <strong>Drugs:</strong> {report.drugs}
                          </Typography>
                        )}
                        {report.nextDate && (
                          <Typography variant="body1" color="secondary.main" sx={{ mb: 0.5 }}>
                            <strong>Next Appointment:</strong> {report.nextDate}
                          </Typography>
                        )}
                        <PDFDownloadLink
                          document={
                            <LabReportPDF
                              report={report}
                              patient={patients.find(p => p.id === patientId)}
                              doctor={doctors.find(d => d.id === report.doctorId)}
                            />
                          }
                          fileName={`lab-report-${idx+1}.pdf`}
                        >
                          {({ loading }) => (
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={<DownloadIcon />}
                              disabled={loading}
                              sx={{ height: 40, fontSize: 16, mt: 2, bgcolor: "#1976d2", color: "#fff" }}
                            >
                              {loading ? 'Loading...' : 'Download PDF'}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </Box>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Upcoming Appointments and Health Trends stacked */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Upcoming Appointments */}
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      Upcoming Appointments
                    </Typography>
                    {latestReport?.nextDate && (
                      <Chip
                        label={`Next: ${latestReport.nextDate}`}
                        color="secondary"
                        sx={{ fontWeight: 600, fontSize: 15 }}
                      />
                    )}
                  </Box>
                  {myAppointments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      You have no upcoming appointments.
                    </Typography>
                  ) : (
                    myAppointments.map((appt, idx) => {
                      const doctor = doctors.find(d => d.id === appt.doctorId);
                      return (
                        <Box key={idx} sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: '#f9fafc',
                          border: '1px solid #e5eaf2',
                          boxShadow: 0
                        }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {doctor?.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#5a5a5a' }}>
                            {doctor?.hospital} | {appt.date} | {doctor?.timing}
                          </Typography>
                          <Typography variant="body2" sx={{
                            color: appt.prescribed ? 'green' : '#ff9800',
                            fontWeight: 600
                          }}>
                            Status: {appt.prescribed ? 'Consulted' : 'Booked'}
                          </Typography>
                        </Box>
                      );
                    })
                  )}
                </CardContent>
              </Card>
              {/* Health Trends */}
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Health Trends
                  </Typography>
                  <Box sx={{ width: '100%', height: 300 }}>
                    {myLabReports.length > 0 ? (
                      <ResponsiveContainer>
                        <LineChart data={prepareChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="albumin" stroke="#1976d2" name="Albumin" />
                          <Line type="monotone" dataKey="bilirubin" stroke="#43a047" name="Bilirubin" />
                          <Line type="monotone" dataKey="alt" stroke="#ffa000" name="ALT" />
                          <Line type="monotone" dataKey="ast" stroke="#d32f2f" name="AST" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography
                        align="center"
                        sx={{ pt: 10, color: 'text.secondary' }}
                      >
                        No health data available yet. Lab reports are needed to show trends.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
      {/* Booking Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Book Appointment</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Booking with <b>{selectedDoctor?.name}</b> at <b>{selectedDoctor?.hospital}</b>
          </Typography>
          <TextField
            margin="normal"
            label="Appointment Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleBookAppointment}
            disabled={!appointmentDate}
            variant="contained"
          >
            Confirm
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
          Appointment booked successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
