˜ 
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const success = await login(email, password);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Incorrect username or password. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Dark background
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4, // 32px based on shape, or strict 16px if preferred
        }}
      >
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Logo Placeholder */}
          <Box sx={{ width: 48, height: 48, bgcolor: 'primary.main', borderRadius: '12px', mb: 3 }} />

          <Typography component="h1" variant="h4" fontWeight="700" color="text.primary" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter your credentials to access the workspace
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
              <Link href="#" variant="body2" color="primary" underline="hover">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                mb: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              Sign In
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" color="primary" underline="hover" fontWeight="600">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};


export default LoginPage;
˜ "(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382^file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/auth/LoginPage.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan