import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, notification, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../components/Admin/Pages/logo.png'; // Adjust path if needed
import './firstpage.css'; // Import the CSS file for custom styles

const { Title } = Typography;

const FirstPage = () => {
  const [formType, setFormType] = useState(''); // Admin or user login
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    const adminEndpoint = 'http://3.110.23.123/api/login.php'; // Admin API endpoint
    const userEndpoint = 'http://3.110.23.123/api/userlogin.php'; // User API endpoint

    const loginRequest = async (endpoint, role) => {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: values.username,
            password: values.password,
          }),
        });
        const data = await response.json();
        if (data.status === 'success') {
          return { success: true, role };
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    };

    // Try admin login first
    let result = await loginRequest(adminEndpoint, 'admin');
    if (!result.success) {
      // If admin login fails, try user login
      result = await loginRequest(userEndpoint, 'user');
    }

    if (result.success) {
      if (result.role === 'admin') {
        navigate('/dashboard/page1');
      } else {
        navigate('/dashboard1/page1u', { state: { username: values.username } });
      }
    } else {
      notification.error({
        message: 'Login Failed',
        description: result.message || 'Please check your username and password.',
      });
    }
  };

  return (
    <div className="container">
      <div className="login-container">
        <Form
          name="login_form"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
        >
          <Form.Item>
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" />
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
    </div>
  );
};

export default FirstPage;
