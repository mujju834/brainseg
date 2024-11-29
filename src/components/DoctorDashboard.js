// src/components/DoctorDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Alert,
  Modal,
  Image,
  Spinner,
  Card,
  Row,
  Col,
  Badge,
  Form,
  Table,
} from 'react-bootstrap';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';

function DoctorDashboard() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [totalPatients, setTotalPatients] = useState(0);
  const [mostRecentCaseDate, setMostRecentCaseDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false); // New state for logout modal

  const token = localStorage.getItem('token');

  useEffect(() => {
    const firstName = localStorage.getItem('first_name') || '';
    setDoctorName(firstName);

    fetchReports();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalPatients(res.data.reports.length);
      if (res.data.reports.length > 0) {
        const sortedReports = res.data.reports.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setMostRecentCaseDate(
          new Date(sortedReports[0].created_at).toLocaleString()
        );
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to fetch analytics data.');
    }
  };

  const fetchReports = async (username = '') => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          username: username.trim() || undefined,
        },
      });
      setReports(res.data.reports);
      setError('');
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          username: searchUsername.trim() || undefined,
        },
      });
      setReports(res.data.reports);
      setError('');
    } catch (err) {
      console.error('Failed to search reports:', err);
      setError('Failed to search reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setNotes(report.doctor_notes || '');
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
    setNotes('');
  };

  const handleSaveNotes = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/reports/${selectedReport.id}`,
        {
          doctor_notes: notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchReports();
      setSaving(false);
      handleCloseReportModal();
      setError('');
    } catch (err) {
      console.error('Failed to save notes:', err);
      setError('Failed to save notes.');
      setSaving(false);
    }
  };

  const getBase64ImageFromURL = async (url) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('Could not load image at ' + url);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = () => {
          reject(new Error('Could not convert image to base64'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleGeneratePDF = async (report) => {
    try {
      setShowPDFModal(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text('Brain Tumor Classification Report', 105, 20, null, null, 'center');

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Patient Username: ${report.patient_username || 'Unknown'}`, 14, 30);
      doc.text(`Filename: ${report.filename}`, 14, 38);
      doc.text(`Date: ${new Date(report.created_at).toLocaleString()}`, 14, 46);

      const predictions = [
        ['Model', 'Prediction', 'Confidence'],
        ['CNN', report.cnn_results, `${report.cnn_confidence[report.cnn_results]}`],
        ['ResNet-50', report.resnet_results, `${report.resnet_confidence[report.resnet_results]}`],
      ];

      doc.autoTable({
        startY: 50,
        head: [predictions[0]],
        body: predictions.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [0, 123, 255] },
        styles: { fontSize: 11 },
      });

      const cnnConfidenceScores = [
        ['Category', 'Confidence'],
        ['Glioma', `${report.cnn_confidence['Glioma']}`],
        ['Meningioma', `${report.cnn_confidence['Meningioma']}`],
        ['No Tumor', `${report.cnn_confidence['No Tumor']}`],
        ['Pituitary', `${report.cnn_confidence['Pituitary']}`],
      ];

      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        head: [cnnConfidenceScores[0]],
        body: cnnConfidenceScores.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [0, 123, 255] },
        styles: { fontSize: 11 },
        title: 'Custom CNN Confidence Scores',
      });

      const resnetConfidenceScores = [
        ['Category', 'Confidence'],
        ['Glioma', `${report.resnet_confidence['Glioma']}`],
        ['Meningioma', `${report.resnet_confidence['Meningioma']}`],
        ['No Tumor', `${report.resnet_confidence['No Tumor']}`],
        ['Pituitary', `${report.resnet_confidence['Pituitary']}`],
      ];

      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        head: [resnetConfidenceScores[0]],
        body: resnetConfidenceScores.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [0, 123, 255] },
        styles: { fontSize: 11 },
        title: 'ResNet-50 Confidence Scores',
      });

      doc.setFontSize(12);
      doc.text('Doctor Notes:', 14, doc.autoTable.previous.finalY + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.doctor_notes || 'N/A'}`, 14, doc.autoTable.previous.finalY + 18, { maxWidth: 180 });

      if (report.gradcam_cnn_path) {
        const img1 = await getBase64ImageFromURL(`${process.env.REACT_APP_BASE_URL}/${report.gradcam_cnn_path}`);
        if (img1) {
          doc.addPage();
          doc.setFontSize(16);
          doc.text('Grad-CAM CNN Visualization', 105, 20, null, null, 'center');
          doc.setFontSize(12);
          doc.addImage(img1, 'JPEG', 15, 30, 180, 90);
        } else {
          doc.addPage();
          doc.setFontSize(16);
          doc.text('Grad-CAM CNN Visualization', 105, 20, null, null, 'center');
          doc.setFontSize(12);
          doc.text('Image could not be loaded.', 14, 30);
        }
      }

      if (report.gradcam_resnet_path) {
        const img2 = await getBase64ImageFromURL(`${process.env.REACT_APP_BASE_URL}/${report.gradcam_resnet_path}`);
        if (img2) {
          doc.addPage();
          doc.setFontSize(16);
          doc.text('Grad-CAM ResNet-50 Visualization', 105, 20, null, null, 'center');
          doc.setFontSize(12);
          doc.addImage(img2, 'JPEG', 15, 30, 180, 90);
        } else {
          doc.addPage();
          doc.setFontSize(16);
          doc.text('Grad-CAM ResNet-50 Visualization', 105, 20, null, null, 'center');
          doc.setFontSize(12);
          doc.text('Image could not be loaded.', 14, 30);
        }
      }

      doc.save(`report_${report.id}.pdf`);
      setShowPDFModal(false);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF.');
      setShowPDFModal(false);
    }
  };

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
      <Container fluid className="py-5 bg-light">
        <Container>
          <Card className="mb-4 bg-primary text-white">
            <Card.Body className="text-center position-relative">
              <Card.Title as="h1">Welcome, Dr. {doctorName}</Card.Title>
              <Card.Text>
                Access patient analyses and assist with diagnosis using AI-powered insights.
              </Card.Text>
              <Button
                variant="outline-light"
                className="position-absolute top-0 end-0 m-3"
                onClick={() => setShowLogoutModal(true)} // Open logout confirmation modal
              >
                <i className="fas fa-sign-out-alt me-2"></i> Logout
              </Button>
            </Card.Body>
          </Card>

          {/* Logout Confirmation Modal */}
          <Modal
            show={showLogoutModal}
            onHide={() => setShowLogoutModal(false)}
            centered
            backdrop="static"
            keyboard={false}
            animation={true} // Enable animation
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Logout</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <p className="lead">Are you sure you want to logout?</p>
              <div className="my-3">
                <i className="fas fa-exclamation-triangle fa-3x text-warning"></i>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
              >
                Logout
              </Button>
            </Modal.Footer>
          </Modal>

          <Row className="mb-4">
            <Col md={6}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>
                    <i className="fas fa-users fa-2x mb-3"></i>
                  </Card.Title>
                  <Card.Text className="fs-4">Total Patients Analyzed</Card.Text>
                  <Badge bg="primary" className="fs-3">
                    {totalPatients}
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>
                    <i className="fas fa-calendar-check fa-2x mb-3"></i>
                  </Card.Title>
                  <Card.Text className="fs-4">Most Recent Case Date</Card.Text>
                  <Badge bg="success" className="fs-3">
                    {mostRecentCaseDate || 'N/A'}
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Retrieve Patient History</Card.Title>
              <Form
                className="d-flex flex-column flex-md-row align-items-md-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                <Form.Group controlId="patientUsername" className="mb-3 mb-md-0 me-md-3 flex-grow-1">
                  <Form.Label>
                    <i className="fas fa-user me-2"></i> Patient Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter patient username"
                    name="searchUsername"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  <i className="fas fa-search me-2"></i> Search
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <h3 className="mb-4 text-center text-secondary">All Patient Reports</h3>
          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && reports.length === 0 && (
            <p className="text-center">No reports available.</p>
          )}
          <Row xs={1} md={2} lg={3} className="g-4">
            {reports.map((report) => (
              <Col key={report.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title className="text-truncate">{report.filename}</Card.Title>
                    <Card.Text>
                      <strong>Patient Username:</strong> {report.patient_username || 'Unknown'}
                    </Card.Text>
                    <Card.Text>
                      <strong>CNN Prediction:</strong>{' '}
                      <Badge bg={getBadgeVariant(report.cnn_results)}>
                        {report.cnn_results}
                      </Badge>
                    </Card.Text>
                    <Card.Text>
                      <strong>ResNet-50 Prediction:</strong>{' '}
                      <Badge bg={getBadgeVariant(report.resnet_results)}>
                        {report.resnet_results}
                      </Badge>
                    </Card.Text>
                    <Card.Text>
                      <strong>Date:</strong> {new Date(report.created_at).toLocaleString()}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="text-center">
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleView(report)}
                    >
                      <i className="fas fa-eye me-1"></i> View Details
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleGeneratePDF(report)}
                    >
                      <i className="fas fa-file-pdf me-1"></i> Generate PDF
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          <Modal
            show={showPDFModal}
            onHide={() => {}}
            centered
            backdrop="static"
            keyboard={false}
          >
            <Modal.Body className="text-center">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="lead">Generating PDF...</p>
            </Modal.Body>
          </Modal>

          <Modal
            show={showReportModal}
            onHide={handleCloseReportModal}
            size="lg"
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
                    <h5 className="mb-3">Basic Information</h5>
                    <Table bordered hover size="sm">
                      <tbody>
                        <tr>
                          <th>Patient Username</th>
                          <td>{selectedReport.patient_username || 'Unknown'}</td>
                        </tr>
                        <tr>
                          <th>Filename</th>
                          <td>{selectedReport.filename}</td>
                        </tr>
                        <tr>
                          <th>Date</th>
                          <td>{new Date(selectedReport.created_at).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </Table>

                    <h5 className="mb-3">Predictions</h5>
                    <Table bordered hover size="sm">
                      <tbody>
                        <tr>
                          <th>CNN Prediction</th>
                          <td>
                            <Badge bg={getBadgeVariant(selectedReport.cnn_results)}>
                              {selectedReport.cnn_results} (
                              {selectedReport.cnn_confidence[selectedReport.cnn_results]}%)
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <th>ResNet-50 Prediction</th>
                          <td>
                            <Badge bg={getBadgeVariant(selectedReport.resnet_results)}>
                              {selectedReport.resnet_results} (
                              {selectedReport.resnet_confidence[selectedReport.resnet_results]}%)
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </Table>

                    <h5 className="mb-3">Custom CNN Confidence Scores</h5>
                    <Table bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Glioma', 'Meningioma', 'No Tumor', 'Pituitary'].map((category) => (
                          <tr key={category}>
                            <td>{category}</td>
                            <td>{selectedReport.cnn_confidence[category]}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <h5 className="mb-3">ResNet-50 Confidence Scores</h5>
                    <Table bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Glioma', 'Meningioma', 'No Tumor', 'Pituitary'].map((category) => (
                          <tr key={category}>
                            <td>{category}</td>
                            <td>{selectedReport.resnet_confidence[category]}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <h5 className="mb-3">Doctor Notes</h5>
                    <Form>
                      <Form.Group controlId="formNotes">
                        <Form.Label>Add/Edit Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter your notes here..."
                        />
                      </Form.Group>
                    </Form>
                  </Col>
                  <Col md={6}>
                    <h5 className="mb-3">Grad-CAM Visualizations</h5>
                    {selectedReport.gradcam_cnn_path && (
                      <>
                        <p>
                          <strong>CNN Grad-CAM:</strong>
                        </p>
                        <Image
                          src={`${process.env.REACT_APP_BASE_URL}/${selectedReport.gradcam_cnn_path}`}
                          alt="Grad-CAM CNN"
                          fluid
                          rounded
                          className="mb-4 shadow-sm"
                        />
                      </>
                    )}
                    {selectedReport.gradcam_resnet_path && (
                      <>
                        <p>
                          <strong>ResNet-50 Grad-CAM:</strong>
                        </p>
                        <Image
                          src={`${process.env.REACT_APP_BASE_URL}/${selectedReport.gradcam_resnet_path}`}
                          alt="Grad-CAM ResNet-50"
                          fluid
                          rounded
                          className="shadow-sm"
                        />
                      </>
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
              <Button
                variant="primary"
                onClick={handleSaveNotes}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : (
                  'Save Notes'
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </Container>

      <Container fluid className="bg-dark text-white text-center py-3">
        <p className="mb-0">&copy; 2024 Intelligent MRI Diagnostic System. All rights reserved.</p>
      </Container>
    </>
  );
}

export default DoctorDashboard;
