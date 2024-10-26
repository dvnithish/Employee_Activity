// LoginPage.jsx
import React, { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, notification, Card, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import logo from './logo.png'; // Adjust path if needed
import '../Css/LoginPage.css'; // Import the CSS file for custom styles

const { Title } = Typography;

const LoginPage = () => {
  const [loggedIn, setLoggedIn] = useState(false); // State to track login status
  const navigate = useNavigate(); // Hook for navigation

  const onFinish = (values) => {
    console.log('Received values of form: ', values);

    // Send data to PHP server for validation
    fetch('http://3.110.23.123/api/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: values.username,
        password: values.password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          // Set loggedIn to true upon successful login
          setLoggedIn(true);
          // Navigate to dashboard
          navigate('/dashboard/page1');
        } else {
          console.log('Login failed:', data.message);
          // Show error notification
          notification.error({
            message: 'Login Failed',
            description: data.message || 'Please check your username and password.',
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        // Show error notification
        notification.error({
          message: 'Login Failed',
          description: 'An unexpected error occurred. Please try again later.',
        });
      });
  };

  return (
    <div className="login-container">
      
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item>
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" /> {/* Replace with your logo path */}
              <Title level={3} className="company-name">Productivity Management</Title>
            </div>
          </Form.Item>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <a className="login-form-forgot" href="#">
              Forgot password
            </a>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Log in
            </Button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '7px' }}>Or</div>
              <Link to="/register">register now!</Link>
            </div>
          </Form.Item>
        </Form>
    </div>
  );
};

export default LoginPage;
