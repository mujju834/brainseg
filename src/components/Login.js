// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: 'patient',
    email: '',
    password: '',
    license_number: ''
  });
  const [error, setError] = useState('');

  const { role, email, password, license_number } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onRoleChange = e => {
    setFormData({
      ...formData,
      role: e.target.value,
      license_number: ''
    });
    setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        role,
        email,
        password
      };
      if (role === 'doctor') {
        payload.license_number = license_number;
      }

      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/login`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Assuming the backend returns a token, role, first_name, last_name, and email
      const { token, role: userRole, first_name, last_name, email: userEmail } = res.data;

      // Store token and user information in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('first_name', first_name);
      localStorage.setItem('last_name', last_name);
      localStorage.setItem('email', userEmail);

      // Navigate to specific dashboards based on the user's role
      if (userRole === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (userRole === 'patient') {
        navigate('/patient-dashboard');
      } else {
        navigate('/dashboard'); // Default dashboard for other roles, if any
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <Container fluid className="d-flex flex-column min-vh-100 bg-light">
      <Row className="flex-grow-1 justify-content-center align-items-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="mb-4 text-center">User Login</h2>
            <p className="text-center">Access your account to upload and review MRI scans with ease.</p>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={onSubmit}>
              {/* Role Selection */}
              <Form.Group controlId="formRole" className="mb-3">
                <Form.Label>Login As</Form.Label>
                <Form.Select
                  name="role"
                  value={role}
                  onChange={onRoleChange}
                  required
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </Form.Select>
              </Form.Group>

              {/* Email */}
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              {/* Password */}
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              {/* Conditional License Number for Doctors */}
              {role === 'doctor' && (
                <Form.Group controlId="formLicenseNumber" className="mb-3">
                  <Form.Label>Medical License Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your license number"
                    name="license_number"
                    value={license_number}
                    onChange={onChange}
                    required={role === 'doctor'}
                  />
                </Form.Group>
              )}

              <Button variant="primary" type="submit" className="w-100">
                Login
              </Button>
            </Form>
            <div className="mt-3 text-center">
              Don't have an account? <Link to="/register">Register here</Link>.
            </div>
          </div>
        </Col>
      </Row>
      {/* Footer */}
      <Row>
        <Col>
          <footer className="text-center py-3 bg-dark text-white">
            &copy; 2024 Intelligent MRI Diagnostic System. All rights reserved.
          </footer>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
