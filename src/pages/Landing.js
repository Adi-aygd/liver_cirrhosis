import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScienceIcon from '@mui/icons-material/Science';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #43cea2 0%, #185a9d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          minWidth: 350,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, letterSpacing: 1, color: '#185a9d' }}
        >
          Liver Cirrhosis Portal
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          gutterBottom
          sx={{ color: 'text.secondary' }}
        >
          Select your role to continue
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonIcon />}
              sx={{
                mb: 2,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                color: '#fff',
                borderRadius: 3,
                boxShadow: '0 4px 14px 0 rgba(67,206,162,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.04)',
                  boxShadow: '0 8px 24px 0 rgba(24,90,157,0.18)',
                  background: 'linear-gradient(90deg, #185a9d 0%, #43cea2 100%)',
                },
              }}
              onClick={() => navigate('/dashboard')}
            >
              Patient
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<LocalHospitalIcon />}
              sx={{
                mb: 2,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
                color: '#fff',
                borderRadius: 3,
                boxShadow: '0 4px 14px 0 rgba(247,151,30,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.04)',
                  boxShadow: '0 8px 24px 0 rgba(255,210,0,0.18)',
                  background: 'linear-gradient(90deg, #ffd200 0%, #f7971e 100%)',
                },
              }}
              onClick={() => navigate('/doctor')}
            >
              Doctor
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ScienceIcon />}
              sx={{
                mb: 2,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                color: '#fff',
                borderRadius: 3,
                boxShadow: '0 4px 14px 0 rgba(67,233,123,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.04)',
                  boxShadow: '0 8px 24px 0 rgba(56,249,215,0.18)',
                  background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                },
              }}
              onClick={() => navigate('/lab')}
            >
              Lab Assistant
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AdminPanelSettingsIcon />}
              sx={{
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
                color: '#fff',
                borderRadius: 3,
                boxShadow: '0 4px 14px 0 rgba(255,88,88,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.04)',
                  boxShadow: '0 8px 24px 0 rgba(240,152,25,0.18)',
                  background: 'linear-gradient(90deg, #f09819 0%, #ff5858 100%)',
                },
              }}
              onClick={() => navigate('/admin')}
            >
              Admin
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
