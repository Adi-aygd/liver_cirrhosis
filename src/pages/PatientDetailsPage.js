import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Grid, Card, CardContent,
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DownloadIcon from '@mui/icons-material/Download';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import LabReportPDF from '../components/LabReportPDF';
import { useAppContext } from '../contexts/AppContext';

export default function PatientDetailsPage() {
  const navigate = useNavigate();
  const { patients, labReports, doctors } = useAppContext();
  const [patientId, setPatientId] = useState(null);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('viewingPatientId');
    if (!id) {
      navigate('/doctor'); // Redirect if no patient selected
      return;
    }

    setPatientId(parseInt(id));
    const foundPatient = patients.find(p => p.id === parseInt(id));
    if (foundPatient) {
      setPatient(foundPatient);
    }
  }, [navigate, patients]);

  // Filter lab reports for this patient
  const patientReports = labReports.filter(r => r.patientId === patientId);
  const patientPrescriptions = patient?.prescriptions || [];

  // Chart data preparation
  const prepareChartData = () => {
    if (patientReports.length === 0) return [];
    return patientReports.map((report, index) => ({
      name: `Report ${index + 1}`,
      albumin: parseFloat(report.albumin) || 0,
      bilirubin: parseFloat(report.bilirubin) || 0,
      alt: parseFloat(report.alt) || 0,
      ast: parseFloat(report.ast) || 0,
    }));
  };

  if (!patient) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography>Loading patient data...</Typography>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Patient Details: {patient.name}
          </Typography>
          <Button color="inherit" onClick={() => navigate('/doctor')}>Back to Dashboard</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Patient Info Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Patient Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><strong>Name:</strong> {patient.name}</Typography>
                <Typography><strong>Age:</strong> {patient.age}</Typography>
                <Typography><strong>Gender:</strong> {patient.gender}</Typography>
                <Typography><strong>Contact:</strong> {patient.contact}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Health Trend Chart */}
          <Grid item xs={12} md={8}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Health Trends</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: '100%', height: 300 }}>
                  {patientReports.length > 0 ? (
                    <ResponsiveContainer>
                      <LineChart data={prepareChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="albumin" stroke="#8884d8" name="Albumin" />
                        <Line type="monotone" dataKey="bilirubin" stroke="#82ca9d" name="Bilirubin" />
                        <Line type="monotone" dataKey="alt" stroke="#ffc658" name="ALT" />
                        <Line type="monotone" dataKey="ast" stroke="#ff8042" name="AST" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography align="center" sx={{ pt: 10, color: 'text.secondary' }}>
                      No health data available yet.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Lab Reports with PDF Download */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Lab Reports</Typography>
                <Divider sx={{ mb: 2 }} />
                {patientReports.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No lab reports available.
                  </Typography>
                ) : (
                  <List>
                    {patientReports.map((report, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={`Report #${idx + 1}`}
                          secondary={
                            <>
                              <Typography variant="body2">
                                <strong>Stage:</strong> {report.stage || 'Stage 1'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Doctor:</strong> {doctors.find(d => d.id === report.doctorId)?.name || 'N/A'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Date:</strong> {new Date(report.createdAt || Date.now()).toLocaleDateString()}
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
                          fileName={`lab-report-${idx+1}.pdf`}
                        >
                          {({ loading }) => (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DownloadIcon />}
                              disabled={loading}
                            >
                              {loading ? 'Loading...' : 'PDF'}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Prescriptions */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Prescriptions & Treatment</Typography>
                <Divider sx={{ mb: 2 }} />
                {patientPrescriptions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No prescriptions available.
                  </Typography>
                ) : (
                  <List>
                    {patientPrescriptions.map((pres, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={`Prescription #${idx + 1}`}
                          secondary={
                            <>
                              <Typography variant="body2">
                                <strong>Prescription:</strong> {pres.prescription}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Precautions:</strong> {pres.precautions}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Next Appointment:</strong> {pres.nextDate}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Doctor:</strong> {doctors.find(d => d.id === pres.doctorId)?.name || 'N/A'}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/doctor')}
                  sx={{ mt: 2 }}
                >
                  Write New Prescription
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
