import React, { useState, useMemo, useEffect } from 'react';
import { Table, Modal, Select, Button } from 'antd';
import axios from 'axios';
import { DownloadOutlined } from '@ant-design/icons';

import '../Css/StatusTb.css';
const { Option } = Select;

const StatusTb = ({ data }) => {
  const [data12, setData12] = useState([]);
  const [employeesByStatus, setEmployeesByStatus] = useState([]);
  const [uniqueEmployeeIds, setUniqueEmployeeIds] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [clickedTotalData, setClickedTotalData] = useState([]); // New state for total data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://3.110.23.123/api/alldata.php');
        setData12(response.data.data);
        setColumns(response.data.columns);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data
      .filter(row => (selectedDepartment ? row['DEPARTMENT'] === selectedDepartment : true))
      .filter(row => (selectedTeam ? row['TEAM'] === selectedTeam : true));
  }, [data, selectedDepartment, selectedTeam]);

  const uniqueShifts = useMemo(() => [...new Set(filteredData.map(row => row['SHIFT'] || ''))], [filteredData]);
  const uniqueDepartments = useMemo(() => [...new Set(filteredData.map(row => row['DEPARTMENT'] || ''))], [filteredData]);
  const uniqueTeams = useMemo(() => [...new Set(filteredData.map(row => row['TEAM'] || ''))], [filteredData]);

  const statusCountByShift = useMemo(() => uniqueShifts.reduce((acc, shift) => {
    acc[shift] = {
      ACTIVE: filteredData.filter(row => row['SHIFT'] === shift && row['CURRENT_STATUS'] === 'ACTIVE').length,
      INACTIVE: filteredData.filter(row => row['SHIFT'] === shift && row['CURRENT_STATUS'] === 'INACTIVE').length,
      OFFLINE: filteredData.filter(row => row['SHIFT'] === shift && row['CURRENT_STATUS'] === 'OFFLINE').length,
    };
    return acc;
  }, {}), [uniqueShifts, filteredData]);

  const totalCounts = useMemo(() => {
    return uniqueShifts.reduce((totals, shift) => {
      totals.ACTIVE += statusCountByShift[shift]?.ACTIVE || 0;
      totals.INACTIVE += statusCountByShift[shift]?.INACTIVE || 0;
      totals.OFFLINE += statusCountByShift[shift]?.OFFLINE || 0;
      return totals;
    }, { ACTIVE: 0, INACTIVE: 0, OFFLINE: 0 });
  }, [statusCountByShift, uniqueShifts]);

  const statusColumns = [
    { title: 'Shift', dataIndex: 'SHIFT', key: 'SHIFT', width: "5%" },
    {
      title: 'Active', dataIndex: 'ACTIVE', key: 'ACTIVE', width: "5%",
      render: (text, record) => (
        record.key === 'total' ? (
          <a onClick={() => handleTotalClick('ACTIVE')}>{text}</a>
        ) : (
          <a onClick={() => handleClick(record.SHIFT, 'ACTIVE')}>{text}</a>
        )
      )
    },
    {
      title: 'Inactive', dataIndex: 'INACTIVE', key: 'INACTIVE', width: "5%",
      render: (text, record) => (
        record.key === 'total' ? (
          <a onClick={() => handleTotalClick('INACTIVE')}>{text}</a>
        ) : (
          <a onClick={() => handleClick(record.SHIFT, 'INACTIVE')}>{text}</a>
        )
      )
    },
    {
      title: 'Offline', dataIndex: 'OFFLINE', key: 'OFFLINE', width: "5%",
      render: (text, record) => (
        record.key === 'total' ? (
          <a onClick={() => handleTotalClick('OFFLINE')}>{text}</a>
        ) : (
          <a onClick={() => handleClick(record.SHIFT, 'OFFLINE')}>{text}</a>
        )
      )
    },
  ];

  const statusData = useMemo(() => [
    ...uniqueShifts.map(shift => ({
      key: shift,
      SHIFT: shift || 'N/A',
      ACTIVE: statusCountByShift[shift]?.ACTIVE || 0,
      INACTIVE: statusCountByShift[shift]?.INACTIVE || 0,
      OFFLINE: statusCountByShift[shift]?.OFFLINE || 0,
    })),
    {
      key: 'total',
      SHIFT: 'Total',
      ACTIVE: totalCounts.ACTIVE,
      INACTIVE: totalCounts.INACTIVE,
      OFFLINE: totalCounts.OFFLINE,
    },
  ], [uniqueShifts, statusCountByShift, totalCounts]);

  const handleClick = (shift, status) => {
    setSelectedShift(shift);
    setSelectedStatus(status);
    setVisible(true);

    const uniqueIds = Array.from(new Set(filteredData
      .filter(row => row['SHIFT'] === shift && row['CURRENT_STATUS'] === status)
      .map(row => row['EMPID'])
    ));
    setUniqueEmployeeIds(uniqueIds);
  };
  const handleTotalClick = async (status) => {
    try {
      // Filter all data based on the selected status
      const totalFilteredData = filteredData.filter(row => row['CURRENT_STATUS'] === status);
      const empIds = totalFilteredData.map(row => row['EMPID']);
      
      // Fetch matching data from data12
      const matchingDataFromData12 = data12.filter(row => empIds.includes(row['EMPID']));
  
      // Update state with functional setter to ensure correct value
      setClickedTotalData(prevData => {
        console.log('Previous Data:', prevData);
        console.log('New Data:', matchingDataFromData12);
        return matchingDataFromData12;
      });
  
      // Show modal and update selected status
      setVisible(true);
      setSelectedStatus(status);
      setSelectedShift(null);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  const exportToCSV = (data, columns) => {
    if (!data.length) return;

    const headers = columns.map(col => col.title).join(',');
    const rows = data.map(row => columns.map(col => row[col.dataIndex] || '').join(','));
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
  };

  const handleCancel = () => {
    setVisible(false);
    setSelectedShift(null);
    setSelectedStatus(null);
    setClickedTotalData([]); // Clear total data when modal is closed
  };

  useEffect(() => {
    if (selectedShift && selectedStatus) {
      const filteredEmployees = filteredData.filter(row =>
        row['SHIFT'] === selectedShift && row['CURRENT_STATUS'] === selectedStatus
      );
      setEmployeesByStatus(filteredEmployees);
    } else if (selectedStatus && !selectedShift) {
      // When only status is selected (for total clicks)
      const filteredEmployees = filteredData.filter(row =>
        row['CURRENT_STATUS'] === selectedStatus
      );
      setEmployeesByStatus(filteredEmployees);
    } else {
      setEmployeesByStatus([]);
    }
  }, [selectedShift, selectedStatus, filteredData]);
  const detailedData = useMemo(() => {
    if (selectedStatus && !selectedShift) {
      return filteredData.filter(row => row['CURRENT_STATUS'] === selectedStatus);
    }
    return data12.filter(employee => uniqueEmployeeIds.includes(employee.EMPID));
  }, [selectedStatus, selectedShift, uniqueEmployeeIds, data12, filteredData]);
  const getDynamicColumns = () => {
    if (data12.length === 0) return [];
    const sample = data12[0];
    const allKeys = Object.keys(sample);
    const filteredKeys = allKeys.filter((key, index) => index !== 15 && index !== 16);
    const filteredKeys1 = filteredKeys.slice(4);
    return filteredKeys1.map(key => ({
      title: key,
      dataIndex: key,
      key: key,
    }));
  };
  const detailedColumns = getDynamicColumns();
  console.log(detailedData);
  return (
    <div className="responsive-container">
      <div className="select-container">
        <Select
          placeholder="Department"
          style={{ width: '100%', maxWidth: 120 }}
          onChange={value => setSelectedDepartment(value)}
          value={selectedDepartment}
        >
          {uniqueDepartments.map(dept => (
            <Option key={dept} value={dept}>{dept}</Option>
          ))}
        </Select>
        <Select
          placeholder="Select Team"
          style={{ width: '100%', maxWidth: 120 }}
          onChange={value => setSelectedTeam(value)}
          value={selectedTeam}
        >
          {uniqueTeams.map(team => (
            <Option key={team} value={team}>{team}</Option>
          ))}
        </Select>
      </div>

      <Table
        columns={statusColumns}
        dataSource={statusData}
        pagination={false}
        bordered
        className="custom-table"
        style={{ marginTop: 20 }}
      />

      <Modal
        title={`Employees with status ${selectedStatus}${selectedShift ? ` in Shift ${selectedShift}` : ''}`}
        visible={visible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Button 
          onClick={() => exportToCSV(selectedShift ? detailedData : clickedTotalData, detailedColumns)}
          style={{ padding: '2px 6px', marginTop: '0.5%' }}
          icon={<DownloadOutlined />}
          type="default"
        >
          Export CSV
        </Button>
        
        <Table
          columns={detailedColumns}
          dataSource={selectedShift ? detailedData : clickedTotalData}
          pagination={false}
          bordered
          className="detailed-table"
        />
      </Modal>
    </div>
  );
};
export default StatusTb;