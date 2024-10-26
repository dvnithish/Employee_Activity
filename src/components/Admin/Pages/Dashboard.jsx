import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  LogoutOutlined,
} from "@ant-design/icons"; // Added LogoutOutlined here
import { TimelineOutlined } from '@mui/icons-material';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import logo from './logo.png'; // Adjust path if needed
import '../Css/Dashboard.css';
const logo1 = '/logo1.png'; // Path from the public folder


const { Header, Sider, Content } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/firstpage');
  };

  const handleResize = () => {
    setCollapsed(window.innerWidth < 768);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={200} style={{ position: "fixed", left: 0, top: 0, backgroundColor: 'white' }}>
      <div style={{ padding: '16px', textAlign: 'center' }}>
          <img 
            src={collapsed ? logo1 : logo} 
            alt="Logo" 
            style={{ width: collapsed ? '40px' : '160px', height: 'auto' }} 
          />
        </div>
        {!collapsed && (
          <>
            <h1 className="titel" style={{ marginTop: '0.4rem', padding: '1px 10px 0px 40px' }}>
              Productivity Management
            </h1>
          </>
        )}
        <Menu defaultSelectedKeys={[""]} style={{ borderRight: 0, backgroundColor: 'white', flex: 1 }}>
          <Menu.Item key="1" icon={<DashboardOutlined />} style={{ color: 'Black' }}>
            <Link to="page1" style={{ color: 'Black', textDecoration: 'none' }}>Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />} style={{ color: 'Black' }}>
            <Link to="page2" style={{ color: 'Black', textDecoration: 'none' }}>Users</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<FieldTimeOutlined />} style={{ color: 'Black' }}>
            <Link to="Shifts" style={{ color: 'Black', textDecoration: 'none' }}>Shifts</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<TimelineOutlined />} style={{ color: 'Black' }}>
            <Link to="page3" style={{ color: 'Black', textDecoration: 'none' }}>TimeLine</Link>
          </Menu.Item>
          <Menu.Item key="7" icon={<TimelineOutlined />} style={{ color: 'Black' }}>
            <Link to="Productive" style={{ color: 'Black', textDecoration: 'none' }}>Productive</Link>
          </Menu.Item>
        </Menu>
        <div style={{ padding: '16px', marginTop: 'auto' }}>
          {collapsed ? (
            <Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} style={{ width: '100%' }} />
          ) : (
            <Button type="default" onClick={handleLogout} style={{ width: '100%' }}>
              Logout
            </Button>
          )}
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 70 : 200 }}>
        <Header style={{ padding: 0, backgroundColor: 'white' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
        </Header>
        <Content style={{  minHeight: 280, backgroundColor: '#fff' }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
