import React, { useState, useEffect } from 'react';
import { Typography, Table } from 'antd';

const { Title } = Typography;

const Modelpop = ({ date }) => {
  const [data12, setData12] = useState([]);
  const [columns, setColumns] = useState([]);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueRoles, setUniqueRoles] = useState([]);
  const [uniqueProjects, setUniqueProjects] = useState([]);
  const [uniqueShifts, setUniqueShifts] = useState([]);
  const [uniqueTeams, setUniqueTeams] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost/monthdata.php');
      const result = await response.json();
      console.log('Fetched data:', result); // Inspect this log

      setData12(result.data12);
      setColumns(result.columns);
      setUniqueDepartments(result.uniqueDepartments);
      setUniqueRoles(result.uniqueRoles);
      setUniqueProjects(result.uniqueProjects);
      setUniqueShifts(result.uniqueShifts);
      setUniqueTeams(result.uniqueTeams);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ensure the date format matches
  const selectedDateData = Array.isArray(data12)
    ? data12.find(item => item.Date === date)
    : data12[date] || {};

  const dataSource = selectedDateData ? [selectedDateData] : [];

  return (
    <div>
      <Title level={4}>Selected Date</Title>
      <p>{date || 'No date selected'}</p>

      <Title level={5}>Unique Departments</Title>
      <ul>
        {uniqueDepartments.map((department, index) => (
          <li key={index}>{department}</li>
        ))}
      </ul>

      <Title level={5}>Unique Roles</Title>
      <ul>
        {uniqueRoles.map((role, index) => (
          <li key={index}>{role}</li>
        ))}
      </ul>

      <Title level={5}>Unique Projects</Title>
      <ul>
        {uniqueProjects.map((project, index) => (
          <li key={index}>{project}</li>
        ))}
      </ul>

      <Title level={5}>Unique Shifts</Title>
      <ul>
        {uniqueShifts.map((shift, index) => (
          <li key={index}>{shift}</li>
        ))}
      </ul>

      <Title level={5}>Unique Teams</Title>
      <ul>
        {uniqueTeams.map((team, index) => (
          <li key={index}>{team}</li>
        ))}
      </ul>

      <Title level={5}>Selected Date Data</Title>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowKey="EmpID"  // Adjust this if necessary based on your actual data
      />
    </div>
  );
};

export default Modelpop;
