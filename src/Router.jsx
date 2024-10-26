import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './FilterContext'; // Adjust path as needed
import LoginPage from './components/Admin/Pages/LoginPage';
import RegistrationPage from './components/Admin/Pages/RegistrationPage';
import Dashboard from './components/Admin/Pages/Dashboard';
import Dashboard1 from './components/User/Pages/Dashboard1';
import Page1u from './components/User/Pages/Page1u';
import Shifts from './components/Admin/Pages/Shifts';
import Productive from './components/Admin/Pages/Productive';
import Page1 from './components/Admin/Pages/Page1';
import Page2 from './components/Admin/Pages/Page2';
import Page3 from './components/Admin/Pages/Page3';
import Page4 from './components/Admin/Pages/Page4';
import UrlVisits from './components/Admin/Pages/url_visits';
import ApplicationUsage from './components/Admin/Pages/application_usage';
import FirstPage from './components/FirstPage';

const AppRouter = () => (
  <Router>
    <FilterProvider>
    <Routes>
      <Route path="/firstpage" element={<FirstPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="page1" element={<Page1 />} />
        <Route path="page2" element={<Page2 />} />
        <Route path="page3" element={<Page3 />} />
        <Route path="page4" element={<Page4 />} />
        <Route path="Shifts" element={<Shifts />} />
        <Route path="Productive" element={<Productive />} />

        <Route path="urlvisits" element={<UrlVisits />} />
        <Route path="applicationusage" element={<ApplicationUsage />} />
        <Route path="" element={<Navigate to="page1" />} />
      </Route>
      <Route path="/dashboard1" element={<Dashboard1 />} >
        <Route path="page1u" element={<Page1u />} />


      </Route>
      <Route path="" element={<Navigate to="/firstpage" />} />
    </Routes>
    </FilterProvider>
  </Router>
);

export default AppRouter;
