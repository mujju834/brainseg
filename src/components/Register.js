// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Register() {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    role: 'patient', // Default role
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    specialization: '', // Doctor only
    license_number: '', // Doctor only
  });

  // State for handling errors
  const [error, setError] = useState('');

  // Destructure formData for easy access
  const {
    role,
    first_name,
    last_name,
    email,
    username,
    password,
    confirm_password,
    specialization,
    license_number,
  } = formData;

  // Handle input changes
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle role selection change
  const onRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData({
      ...formData,
      role: selectedRole,
      // Reset doctor-specific fields if role is patient
      ...(selectedRole === 'patient' && { specialization: '', license_number: '' }),
    });
    setError(''); // Clear any existing errors when role changes
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();

    // Basic frontend validation for password match
    if (password !== confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Endpoint for unified registration
      const endpoint = `${process.env.REACT_APP_BASE_URL}/api/register`;

      // Prepare data to send
      const data =
        role === 'doctor'
          ? {
              role,
              first_name,
              last_name,
              email,
              username,
              password,
              specialization,
              license_number,
            }
          : {
              role,
              first_name,
              last_name,
              email,
              username,
              password,
            };

      // Make the POST request
      const res = await axios.post(endpoint, data);

      // Assuming the backend returns a token and role
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);

      // Redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      // Handle errors returned from the backend
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration Failed. Please try again.');
      }
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #f0f8ff, #ffffff)',
      }}
    >
      <Row className="w-100" style={{ maxWidth: '600px' }}>
        <Col
          className="d-flex align-items-center justify-content-center"
          style={{
            background: '#ffffff',
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ width: '100%' }}>
            <h2 className="text-center mb-4 text-primary">Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={onSubmit}>
              {/* Role Selection */}
              <Form.Group controlId="formRole" className="mb-3">
                <Form.Label>Register As</Form.Label>
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

              {/* First Name */}
              <Form.Group controlId="formFirstName" className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your first name"
                  name="first_name"
                  value={first_name}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              {/* Last Name */}
              <Form.Group controlId="formLastName" className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your last name"
                  name="last_name"
                  value={last_name}
                  onChange={onChange}
                  required
                />
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

              {/* Username */}
              <Form.Group controlId="formUsername" className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Choose a username"
                  name="username"
                  value={username}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              {/* Password */}
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Create a password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              {/* Confirm Password */}
              <Form.Group controlId="formConfirmPassword" className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm your password"
                  name="confirm_password"
                  value={confirm_password}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              {/* Conditional Fields for Doctor */}
              {role === 'doctor' && (
                <>
                  {/* Specialization */}
                  <Form.Group controlId="formSpecialization" className="mb-3">
                    <Form.Label>Specialization</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your specialization"
                      name="specialization"
                      value={specialization}
                      onChange={onChange}
                      required={role === 'doctor'}
                    />
                  </Form.Group>

                  {/* Medical License Number */}
                  <Form.Group controlId="formLicenseNumber" className="mb-3">
                    <Form.Label>Medical License Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your medical license number"
                      name="license_number"
                      value={license_number}
                      onChange={onChange}
                      required={role === 'doctor'}
                    />
                  </Form.Group>
                </>
              )}

              {/* Submit Button */}
              <Button variant="primary" type="submit" className="w-100">
                Register
              </Button>
            </Form>
            <div className="mt-3 text-center">
              Already have an account? <Link to="/login">Login Here</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
