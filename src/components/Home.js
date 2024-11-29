// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Revolutionizing MRI Diagnostics</h1>
          <p>AI-powered, fast, secure, and reliable MRI analysis for better health decisions.</p>
          <div className="buttons">
            <Link to="/login" className="btn">Login</Link>
            <Link to="/register" className="btn">Register</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-container">
          <div className="feature">
            <h3>AI-Powered Diagnostics</h3>
            <p>Accurate and reliable MRI results using advanced machine learning models.</p>
          </div>
          <div className="feature">
            <h3>Secure Data</h3>
            <p>Your personal health data is encrypted and securely managed for privacy.</p>
          </div>
          <div className="feature">
            <h3>Detailed Reports</h3>
            <p>Comprehensive analysis and insights that help make informed medical decisions.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Intelligent MRI Diagnostic System. All rights reserved.</p>
      </footer>

      {/* Inline Styles */}
      <style jsx="true">{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Arial', sans-serif;
        }

        body {
          background-color: #f4f7f6;
          color: #333;
          line-height: 1.6;
        }

        .hero-section {
          background: linear-gradient(to right, #00c6ff, #0072ff);
          color: white;
          text-align: center;
          padding: 70px 20px;
          border-bottom: 5px solid #ffffff;
        }

        .hero-section h1 {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .hero-section p {
          font-size: 1.1rem;
          margin-bottom: 30px;
        }

        .buttons {
          display: flex;
          justify-content: center;
          gap: 25px;
        }

        .btn {
          background: #ff7f50;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: background-color 0.3s ease;
        }

        .btn:hover {
          background: #e6673f;
        }

        .features-section {
          padding: 60px 20px;
          background: #ffffff;
          text-align: center;
          margin-top: 30px;
        }

        .features-section h2 {
          margin-bottom: 30px;
          font-size: 2.2rem;
          color: #333;
        }

        .features-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 30px;
        }

        .feature {
          background: #f0f4f8;
          padding: 30px;
          border-radius: 10px;
          width: 250px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .feature h3 {
          margin-bottom: 15px;
          font-size: 1.3rem;
          color: #333;
        }

        .feature p {
          font-size: 0.95rem;
          color: #555;
        }

        .footer {
          background: #333;
          color: white;
          text-align: center;
          padding: 25px;
          margin-top: 40px;
        }

        @media (max-width: 768px) {
          .features-container {
            flex-direction: column;
            align-items: center;
          }

          .feature {
            width: 80%;
          }

          .buttons {
            flex-direction: column;
          }

          .btn {
            width: 80%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
