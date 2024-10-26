import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { Table, Select, Space, Button, Spin, Alert, Modal } from 'antd';
import { SearchOutlined, ResetOutlined ,DownloadOutlined} from '@ant-design/icons';
import moment from 'moment';
import '../Css/Page3.css';

const months = moment.months();
const currentYear = moment().year();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const { Option } = Select;

const convertTimeToHoursAndMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

const transformData = (data) => {
  if (!data || typeof data !== 'object') return [];
  return Object.keys(data).map(date => ({ date, ...data[date] }));
};

const Page3 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM'));
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState(null);
  // Filter states
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueRoles, setUniqueRoles] = useState([]);
  const [uniqueProjects, setUniqueProjects] = useState([]);
  const [uniqueShifts, setUniqueShifts] = useState([]);
  const [uniqueTeams, setUniqueTeams] = useState([]);
  const [ids, setIds] = useState([]);
  const [names, setNames] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);


  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const[selectedDesignations,setSelectedDesignations]=useState([]);
  const [selectedEMPID, setSelectedEMPID] = useState([]);
  const [selectedEMPNAMES, setSelectedEMPNAMES] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [filteredModalData, setFilteredModalData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const fetchUniqueFilters = async () => {
      try {
        const response = await axios.get('http://3.110.23.123/api/monthdata.php');
        const { uniqueDepartments, uniqueRoles, uniqueProjects, uniqueShifts, uniqueTeams,uniquename,uniqueids,uniquedesignations} = response.data;
        setUniqueDepartments(uniqueDepartments);
        setUniqueRoles(uniqueRoles);
        setUniqueProjects(uniqueProjects);
        setUniqueShifts(uniqueShifts);
        setUniqueTeams(uniqueTeams);
        setIds(uniqueids);
        setNames(uniquename);
        setUniqueDesignations(uniquedesignations)
      } catch (err) {
        setError(err);
      }
    };

    const fetchData = async () => {
      const startDate = moment(`${selectedYear}-${moment().month(selectedMonth).format('MM')}-01`).format('YYYY-MM-DD');
      const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

      setLoading(true);
      try {
        const response = await axios.get('http://3.110.23.123/api/monthdata.php', {
          params: {
            month: selectedMonth,
            year: selectedYear,
            department: selectedDepartments,
            role: selectedRoles,
            project: selectedProjects,
            shift: selectedShifts,
            team: selectedTeams,
            ids:selectedEMPID,
            names:selectedEMPNAMES,
            designations:selectedDesignations,
          }
        });
        const transformedData = transformData(response.data.aggregateByDate);
        setData(transformedData);
        setModalData(response.data.data12);
        setColumns(response.data.columns);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniqueFilters();
    fetchData();
  }, [selectedMonth, selectedYear, selectedDepartments, selectedRoles, selectedProjects,selectedDesignations, selectedShifts, selectedTeams,selectedEMPID,selectedEMPNAMES]);

  const fetchFilteredData = async () => {
    const startDate = moment(`${selectedYear}-${moment().month(selectedMonth).format('MM')}-01`).format('YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    setLoading(true);
    try {
      const response = await axios.get('http://3.110.23.123/api/monthdata.php', {
        params: {
          month: selectedMonth,
          year: selectedYear,
          department: selectedDepartments,
          role: selectedRoles,
          project: selectedProjects,
          shift: selectedShifts,
          team: selectedTeams,
          ids:selectedEMPID,
          names:selectedEMPNAMES,
          designations:selectedDesignations,
        }
      });
      const transformedData = transformData(response.data.aggregateByDate);
      setData(transformedData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedMonth(moment().format('MMMM'));
    setSelectedYear(currentYear);
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setSelectedProjects([]);
    setSelectedShifts([]);
    setSelectedTeams([]);
    setSelectedEMPID([]);
    setSelectedEMPNAMES([]);
    setSelectedDesignations([]);
    fetchFilteredData();
    fetchFilteredData();
  };

  const filterModalDataByDate = (date) => {
    if (!date || !modalData.length) {
      setFilteredModalData([]);
      return;
    }
    const filteredData = modalData.filter(item => item.Date === date);
    setFilteredModalData(filteredData);
  };
  const exportToCSV = (data, columns) => {
    if (!data.length) return;

    // Convert columns to CSV header
    const headers = columns.map(col => col.title).join(',');
    
    // Convert data to CSV rows
    const rows = data.map(row =>
        columns.map(col => row[col.dataIndex] || '').join(',')
    );
    
    // Combine headers and rows
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;

    // Create a link element and click it to trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link); // Required for Firefox

    link.click();
};

  const chartData = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return { series: [], options: {} };
    }

    const dates = data.map(item => item.date);
    const totalIdleHours = data.map(item => convertTimeToHoursAndMinutes(item.total_idle_hours));
    const totalProductiveHours = data.map(item => convertTimeToHoursAndMinutes(item.total_productive_hours));

    return {
      series: [
        { name: 'Total Idle Hours', data: totalIdleHours },
        { name: 'Total Productive Hours', data: totalProductiveHours }
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: { show: true },
          zoom: { enabled: true },
          events: {
            dataPointSelection: (event, chartContext, config) => {
              const { dataPointIndex } = config;
              const selectedDate = data[dataPointIndex].date;
              setSelectedDate(selectedDate);
              filterModalDataByDate(selectedDate); // Filter modal data based on the selected date
              setModalVisible(true); // Show the modal on date click
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 10,
            dataLabels: { enabled: false }
          }
        },
        xaxis: {
          categories: dates,
          type: 'datetime'
        },
        yaxis: {
          labels: {
            formatter: (value) => Math.floor(value)
          }
        },
        legend: { position: 'bottom', horizontalAlign: 'center' },
        fill: { opacity: 1 },
        tooltip: {
          y: {
            formatter: (val) => {
              const roundedVal = Math.round(val);
              const hours = Math.floor(roundedVal);
              const minutes = Math.round((roundedVal - hours) * 60);
              return `${hours}h ${minutes}m`;
            }
          }
        }
      }
    };
  };

  const tableColumns = columns.map(col => ({
    title: col,
    dataIndex: col,
    key: col,
  }));

  const handleMonthChange = (value) => setSelectedMonth(value);
  const handleYearChange = (value) => setSelectedYear(value);

  if (loading) return <Spin size="small" />;
  if (error) return <Alert message="Error" description={error.message} type="error" />;

  const { series, options } = chartData();

  return (
    <div>
      <h3 style={{ marginTop: '-1%' }}>Month View:</h3>
      <div >
        <Select
                                size="small"
                                dropdownClassName="custom-dropdown1"
                                style={{ width: '90px', fontSize: '10px', padding: '2px 6px' }}
                                mode="multiple"
                                placeholder="EMPID"
                                dropdownStyle={{ width: '150px' }}
                                value={selectedEMPID}
                                onChange={setSelectedEMPID}
                                className="custom-select"
                            >
                                {ids.map(ids => (
                                    <Option key={ids} value={ids}>
                                        {ids}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                size="small"
                                dropdownClassName="custom-dropdown1"
                                style={{ width: '90px', fontSize: '10px', padding: '2px 6px' }}
                                mode="multiple"
                                placeholder="EMPNAMES"
                                dropdownStyle={{ width: '150px' }}
                                value={selectedEMPNAMES}
                                onChange={setSelectedEMPNAMES}
                                className="custom-select"
                            >
                                {names.map(names => (
                                    <Option key={names} value={names}>
                                        {names}
                                    </Option>
                                ))}
                            </Select>
          <Select
            size="small"
            style={{ width: '90px', fontSize: '1px', padding: '2px 6px' }}            
            mode="multiple"
            value={selectedDepartments}
            placeholder="Departments"
            dropdownStyle={{ width: '150px' }}
            onChange={setSelectedDepartments}
          >
            {uniqueDepartments.map(dept => (
              <Option key={dept} value={dept}>{dept}</Option>
            ))}
          </Select>
          <Select
            size="small"
            style={{ width: '90px', fontSize: '1px', padding: '2px 6px' }}            
            mode="multiple"
            value={selectedRoles}
            placeholder="Roles"
            dropdownStyle={{ width: '150px' }}
            onChange={setSelectedRoles}
          >
            {uniqueRoles.map(role => (
              <Option key={role} value={role}>{role}</Option>
            ))}
          </Select>
          <Select
            size="small"
            style={{ width: '90px', fontSize: '1px', padding: '2px 6px' }}            
            mode="multiple"
            value={selectedDesignations}
            placeholder="DESIGNATION"
            dropdownStyle={{ width: '150px' }}
            onChange={setSelectedDesignations}
          >
            {uniqueDesignations.map(designations => (
              <Option key={designations} value={designations}>{designations}</Option>
            ))}
          </Select>
          <Select
            size="small"
            style={{ width: '90px', fontSize: '1px', padding: '2px 6px' }}            
            mode="multiple"
            value={selectedProjects}
            placeholder="Projects"
            dropdownStyle={{ width: '150px' }}
            onChange={setSelectedProjects}
          >
            {uniqueProjects.map(project => (
              <Option key={project} value={project}>{project}</Option>
            ))}
          </Select>
          <Select
            size="small"
            style={{ width: '90px', fontSize: '1px', padding: '2px 6px' }}            
            mode="multiple"
            value={selectedShifts}
            placeholder="Shifts"
            dropdownStyle={{ width: '150px' }}
            onChange={setSelectedShifts}
          >
            {uniqueShifts.map(shift => (
              <Option key={shift} value={shift}>{shift}</Option>
            ))}
          </Select>
          <Select
            size="small"
            style={{ width: '90px', fontSize: '1px', padding: '2px 6px' }}            
            mode="multiple"
            value={selectedTeams}
            placeholder="Teams"
            dropdownStyle={{ width: '150px' }}
            onChange={setSelectedTeams}
          >
            {uniqueTeams.map(team => (
              <Option key={team} value={team}>{team}</Option>
            ))}
          </Select>
          <Select
          size="middle"
          style={{ width: 120, marginRight: '10px' }}
          onChange={handleMonthChange}
          dropdownStyle={{ width: '150px' }}
          value={selectedMonth}
        >
          {months.map(month => (
            <Option key={month} value={month}>{month}</Option>
          ))}
        </Select>
        <Select
          size="middle"
          style={{ width: 80 }}
          onChange={handleYearChange}
          dropdownStyle={{ width: '150px' }}
          value={selectedYear}
        >
          {years.map(year => (
            <Option key={year} value={year}>{year}</Option>
          ))}
        </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={fetchFilteredData}
            size="small"
          >
            Filters
          </Button>
          <Button
            type="default"
            onClick={resetFilters}
            size="small"
          >
            Reset
          </Button>
      </div>
      
      <ReactApexChart options={options} series={series} type="bar" height={350} />
      <Modal
        title={`Details for ${selectedDate}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1200}
      >
        <Button 
                    onClick={() => exportToCSV(filteredModalData, tableColumns)}
                    style={{padding: '2px 6px',marginTop:'0.5%',height:'4%'}}
                    icon={<DownloadOutlined />}
                    type="default"
                  >
                    Export CSV
                  </Button>
        <Table
          dataSource={filteredModalData}
          columns={tableColumns}
          pagination={true}
          scroll={{ x: 'max-content' }}
        />
      </Modal>
    </div>
  );
};

export default Page3;
