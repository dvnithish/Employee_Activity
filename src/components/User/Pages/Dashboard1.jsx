import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import { UserOutlined, DashboardOutlined } from "@ant-design/icons";
import logo from './logo.png'; // Adjust path if needed
import '../Css/Dashboard.css'; // Import your CSS

const { Sider, Content } = Layout;

const Dashboard1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || {}; // Retrieve username from location state

  const handleLogout = () => {
    navigate('/firstpage'); // Redirect to login page
  };

  // Function to handle menu item clicks
  const handleMenuClick = (path) => {
    navigate(path, { state: { username } }); // Navigate and pass username in state
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        width={200}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Logo and title */}
        <div style={{ padding: '16px' }}>
          <img src={logo} alt="Logo" style={{ width: '160px', height: 'auto', marginBottom: '16px' }} />
          <h1 className="title" style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0',
            padding: '0 16px'
          }}>
            Productivity Management
          </h1>
          {username && (
            <h2 className="username" style={{
              fontSize: '18px',
              margin: '0',
              padding: '0 16px',
              color: 'gray'
            }}>
              Welcome, {username}
            </h2>
          )}
        </div>
        
        {/* Menu items */}
        <Menu
          defaultSelectedKeys={[""]}
          style={{ borderRight: 0, backgroundColor: 'white', flex: 1 }}
        >
          <Menu.Item
            key="1"
            icon={<DashboardOutlined />}
            style={{ color: 'Black' }}
            onClick={() => handleMenuClick("page1u")}
          >
            Dashboard
          </Menu.Item>
        </Menu>
        
        {/* Logout Button */}
        <div style={{ padding: '16px', marginTop: 'auto' }}>
          <Button
            type="default"
            onClick={handleLogout}
            style={{ width: '100%' }}
          >
            Logout
          </Button>
        </div>
      </Sider>
      
      {/* Main content */}
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
            {/* Main content */}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard1;
