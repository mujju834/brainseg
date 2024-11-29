// src/components/PatientDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Button,
  Form,
  Alert,
  Modal,
  Image,
  Spinner,
  Card,
  Row,
  Col,
  Badge,
} from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function PatientDashboard() {
  const [file, setFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStage, setProcessingStage] = useState('processing'); // 'processing' or 'completed'
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State for Logout Confirmation Modal

  const fileInputRef = useRef(null); // Reference to the file input

  const token = localStorage.getItem('token');
  const firstName = localStorage.getItem('first_name') || '';

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(res.data.reports);
    } catch (err) {
      setError('Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('mri_image', file);
    try {
      setUploading(true);
      setProcessingStage('processing');
      setShowProcessingModal(true);
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Clear the file input field
      }
      fetchReports();
      setProcessingStage('completed');
      setTimeout(() => {
        setShowProcessingModal(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload Failed');
      setShowProcessingModal(false);
    } finally {
      setUploading(false);
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Function to get badge variant based on prediction
  const getBadgeVariant = (prediction) => {
    switch (prediction) {
      case 'Glioma':
        return 'danger';
      case 'Meningioma':
        return 'warning';
      case 'No Tumor':
        return 'success';
      case 'Pituitary':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      {/* <AppNavbar /> */}

      <Container fluid className="py-5 bg-light">
        <Container>
          {/* Header Section */}
          <Card className="mb-4 bg-primary text-white position-relative">
            <Card.Body className="text-center">
              <Card.Title as="h1">Welcome, {firstName}</Card.Title>
              <Card.Text>
                Upload and review your MRI scans with AI-powered analysis.
              </Card.Text>
              <Button
                variant="outline-light"
                className="position-absolute top-0 end-0 m-3"
                onClick={() => setShowLogoutModal(true)}
              >
                <i className="fas fa-sign-out-alt me-2"></i> Logout
              </Button>
            </Card.Body>
          </Card>

          {/* Upload Section */}
          <Card className="mb-5 shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Upload Your MRI Image</Card.Title>
              <Form onSubmit={onUpload}>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    ref={fileInputRef} // Assign the ref to the file input
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt me-2"></i> Submit for Analysis
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Historical Reports */}
          <h3 className="mb-4 text-center text-secondary">Historical Reports</h3>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-center">No reports available.</p>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {reports.map((report) => (
                <Col key={report.id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title className="text-truncate">{report.filename}</Card.Title>
                      <Card.Text>
                        <strong>CNN Prediction:</strong>{' '}
                        <Badge bg={getBadgeVariant(report.cnn_results)}>{report.cnn_results}</Badge>
                      </Card.Text>
                      <Card.Text>
                        <strong>ResNet-50 Prediction:</strong>{' '}
                        <Badge bg={getBadgeVariant(report.resnet_results)}>{report.resnet_results}</Badge>
                      </Card.Text>
                      <Card.Text>
                        <strong>Date:</strong> {new Date(report.created_at).toLocaleString()}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="text-center">
                      <Button variant="info" onClick={() => handleView(report)}>
                        View Details
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </Container>

      {/* Processing Modal */}
      <Modal
        show={showProcessingModal && processingStage !== 'completed'}
        onHide={() => {}}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center">
          {processingStage === 'processing' && (
            <>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="lead">
                CNN (Convolutional Neural Network) and ResNet-50 models are analyzing your image...
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Completed Processing Modal */}
      <Modal
        show={showProcessingModal && processingStage === 'completed'}
        onHide={() => setShowProcessingModal(false)}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center">
          <Spinner animation="grow" variant="success" className="mb-3" />
          <p className="lead">Image analyzed by CNN and ResNet-50 models!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowProcessingModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
        backdrop="static"
        keyboard={false}
        animation={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Are you sure you want to logout?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLogout}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Report Details Modal */}
      <Modal
        show={showReportModal}
        onHide={handleCloseReportModal}
        size="xl"
        aria-labelledby="report-details-modal"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title id="report-details-modal">Report Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport ? (
            <Row>
              <Col md={6}>
                <h5>Filename:</h5>
                <p>{selectedReport.filename}</p>

                <h5>Custom CNN Prediction:</h5>
                <p>
                  <Badge bg={getBadgeVariant(selectedReport.cnn_results)}>
                    {selectedReport.cnn_results} ({selectedReport.cnn_confidence[selectedReport.cnn_results]})
                  </Badge>
                </p>

                <h5>Custom CNN Confidence Scores:</h5>
                <ul>
                  {Object.entries(selectedReport.cnn_confidence).map(([label, score]) => (
                    <li key={label}>
                      <Badge bg={getBadgeVariant(label)} className="me-2">
                        {label}
                      </Badge>
                      {score}
                    </li>
                  ))}
                </ul>

                <h5>ResNet-50 Prediction:</h5>
                <p>
                  <Badge bg={getBadgeVariant(selectedReport.resnet_results)}>
                    {selectedReport.resnet_results} ({selectedReport.resnet_confidence[selectedReport.resnet_results]})
                  </Badge>
                </p>

                <h5>ResNet-50 Confidence Scores:</h5>
                <ul>
                  {Object.entries(selectedReport.resnet_confidence).map(([label, score]) => (
                    <li key={label}>
                      <Badge bg={getBadgeVariant(label)} className="me-2">
                        {label}
                      </Badge>
                      {score}
                    </li>
                  ))}
                </ul>

                <h5>Doctor Notes:</h5>
                <p>{selectedReport.doctor_notes || 'No notes added.'}</p>
              </Col>
              <Col md={6}>
                <h5>Grad-CAM CNN Visualization:</h5>
                {selectedReport.gradcam_cnn_path ? (
                  <>
                    <Image
                      src={`${process.env.REACT_APP_BASE_URL}/${selectedReport.gradcam_cnn_path}`}
                      alt="Grad-CAM CNN"
                      fluid
                      rounded
                      className="mb-4 shadow-sm"
                    />
                  </>
                ) : (
                  <p>No Grad-CAM CNN visualization available.</p>
                )}

                <h5>Grad-CAM ResNet-50 Visualization:</h5>
                {selectedReport.gradcam_resnet_path ? (
                  <>
                    <Image
                      src={`${process.env.REACT_APP_BASE_URL}/${selectedReport.gradcam_resnet_path}`}
                      alt="Grad-CAM ResNet-50"
                      fluid
                      rounded
                      className="shadow-sm"
                    />
                  </>
                ) : (
                  <p>No Grad-CAM ResNet-50 visualization available.</p>
                )}
              </Col>
            </Row>
          ) : (
            <p>No report selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReportModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>

  );
}

export default PatientDashboard;
