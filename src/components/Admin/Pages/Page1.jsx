import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cards from './Cards';
import { Card, Row, Col, Typography, Table, Spin, Alert, Pagination, Button, Dropdown, Menu, Space, Select ,Collapse,Tag} from 'antd';
import { ReloadOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import '../Css/Page1.css';
import { DatePicker } from 'antd';
import Bar from './Bar.jsx';
import Page4 from './Page4.jsx';
import Designation from './Designation';
import Modelpop from './Modelpop.jsx';

const { Title } = Typography;


const { RangePicker } = DatePicker;
const { Option } = Select;

const Page1 = () => {
  // State management for filters and data
  const [uniqueEmpIDCount, setUniqueEmpIDCount] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedEMPID, setSelectedEMPID] = useState([]);
  const [selectedEMPNAMES, setSelectedEMPNAMES] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);
  const [totals, setTotals] = useState({
    total_logged_hours: '00:00:00',
    total_idle_hours: '00:00:00',
    total_productive_hours: '00:00:00',
    total_time_on_system: '00:00:00',
    total_time_away_from_system: '00:00:00'
});
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [ids, setIds] = useState([]);
  const [names, setNames] = useState([]);
  const[designations,setDesignations]=useState([]);
  // State management for table data and pagination
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [columns, setColumns] = useState([]);
  const [aggregateData, setAggregateData] = useState([]);
  const [aggregateColumns, setAggregateColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Set your desired page size here
  const [filteredData, setFilteredData] = useState([]);

  // Fetch filtered data
  const fetchFilteredData = () => {
    setLoading(true);
    // Combine all filters into a single object
    const filters = {
      dateRange: {
        start: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : 'Not Set',
        end: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : 'Not Set'
      },
      department: selectedDepartments,
      role: selectedRoles,
      project: selectedProjects,
      shift: selectedShifts,
      team: selectedTeams,
      ids:selectedEMPID,
      names:selectedEMPNAMES,
      designations:selectedDesignations
    };

    // Construct query parameters
    const queryParams = new URLSearchParams();

    // Add date range
    if (filters.dateRange.start !== 'Not Set') {
      queryParams.append('dateRange[start]', filters.dateRange.start);
    }
    if (filters.dateRange.end !== 'Not Set') {
      queryParams.append('dateRange[end]', filters.dateRange.end);
    }

    // Add array filters
    const filterKeys = ['department', 'role', 'project', 'shift', 'team','ids','names','designations'];
    filterKeys.forEach(key => {
      if (filters[key] && filters[key].length) {
        filters[key].forEach(value => {
          queryParams.append(`${key}[]`, value);
        });
      }
    });

    axios.get('http://3.110.23.123/api/fetch_employee_activity.php', {
      params: queryParams
    })
    .then(response => {
      const { data1,data, columns, uniqueDepartments, uniqueProjects, uniqueRoles,uniqueids,uniquename, uniqueShifts, uniqueTeams, aggregateByDate,totals,unique_empid_count,uniqueDesignation} = response.data;

      // Format aggregate data for table
      const aggregateTableData = Object.keys(aggregateByDate).map(date => ({
        date,
        ...aggregateByDate[date]
      }));

      setData(data);
      setData1(data1);
      setFilteredData(data);

      // Generate table columns from response data
      const tableColumns = columns.map(col => ({
        title: col,
        dataIndex: col,
        key: col,
        render: text => text || 'N/A'
      }));

      // Add columns for aggregated data
      const aggregateTableColumns = [
        {
          title: 'Date',
          dataIndex: 'date',
          key: 'date'
        },
        {
          title: 'Total Logged Hours',
          dataIndex: 'total_logged_hours',
          key: 'total_logged_hours'
        },
        {
          title: 'Total Idle Hours',
          dataIndex: 'total_idle_hours',
          key: 'total_idle_hours'
        },
        {
          title: 'Total Productive Hours',
          dataIndex: 'total_productive_hours',
          key: 'total_productive_hours'
        },
        {
          title: 'Total Time Away From System',
          dataIndex: 'total_time_away_from_system',
          key: 'total_time_away_from_system'
        },
        {
          title: 'Total Time On System',
          dataIndex: 'total_time_on_system',
          key: 'total_time_on_system'
        }
      ];
      

      setColumns(tableColumns);
      setAggregateColumns(aggregateTableColumns);
      setAggregateData(aggregateTableData);
      setTotals(totals);
      setDepartments(uniqueDepartments || []);
      setProjects(uniqueProjects || []);
      setRoles(uniqueRoles || []);
      setShifts(uniqueShifts || []);
      setTeams(uniqueTeams || []);
      setIds(uniqueids||[]);
      setNames(uniquename||[]);
      setUniqueEmpIDCount(unique_empid_count);  
      setDesignations(uniqueDesignation||[]);

      setLoading(false);
    })
    .catch(error => {
      setError(error);
      setLoading(false);
    });
  };
  useEffect(() => {
    fetchFilteredData(); // Fetch data initially when component mounts
  }, []);
  const handleFilterClick = () => {
    fetchFilteredData(); // Fetch data when filter button is clicked
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleReset = () => {
    setDateRange([]);
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setSelectedProjects([]);
    setSelectedShifts([]);
    setSelectedTeams([]);
    setSelectedEMPID([]);
    setSelectedEMPNAMES([]);
    setSelectedDesignations([]);
    fetchFilteredData();
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
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
if (loading) {
  return (
  <div style={{display:"flex",justifyContent:"center"}}><Spin size="small" /></div>);
}


  // Get paginated data for the current page
  //const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);


      return (
        <div className='main'>
          <div className='dropdown'>
            <Card className="flex flex-wrap">
              <RangePicker
                                size="small"
                                style={{ width: '20%', fontSize: '10px', padding: '2px 6px' }}
                                onChange={handleDateRangeChange}
                                value={dateRange}
                                format="YYYY-MM-DD"
                            />
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
                                dropdownClassName="custom-dropdown1"
                                style={{ width: '90px', fontSize: '10px', padding: '2px 6px' }}
                                mode="multiple"
                                placeholder="Departments"
                                dropdownStyle={{ width: '150px' }}
                                value={selectedDepartments}
                                onChange={setSelectedDepartments}
                                className="custom-select"
                            >
                                {departments.map(department => (
                                    <Option key={department} value={department}>
                                        {department}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                size="small"
                                dropdownClassName="custom-dropdown1"
                                style={{ width: '90px', fontSize: '10px', padding: '2px 6px' }}
                                mode="multiple"
                                placeholder="Roles"
                                dropdownStyle={{ width: '150px' }}
                                value={selectedRoles}
                                onChange={setSelectedRoles}
                                className="custom-select"
                            >
                                {roles.map(role => (
                                    <Option key={role} value={role}>
                                        {role}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                size="small"
                                dropdownClassName="custom-dropdown1"
                                style={{ width: '90px', fontSize: '10px', padding: '2px 6px' }}
                                mode="multiple"
                                placeholder="DESIGNATIONS"
                                dropdownStyle={{ width: '150px' }}
                                value={selectedDesignations}
                                onChange={setSelectedDesignations}
                                className="custom-select"
                            >
                                {designations.map(designations => (
                                    <Option key={designations} value={designations}>
                                        {designations}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                size="small"
                                dropdownClassName="custom-dropdown1"
                                style={{ width: '90px', fontSize: '10px', padding: '2px 6px' }}
                                mode="multiple"
                                placeholder="Projects"
                                dropdownStyle={{ width: '150px' }}
                                value={selectedProjects}
                                onChange={setSelectedProjects}
                                className="custom-select"
                            >
                                {projects.map(project => (
                                    <Option key={project} value={project}>
                                        {project}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                size="small"
                                dropdownClassName="custom-dropdown1"
                                style={{ width: '90px', fontSize: '10px', padding: '2px 6px' }}
                                mode="multiple"
                                placeholder="Shift"
                                dropdownStyle={{ width: '150px' }}
                                value={selectedShifts}
                                onChange={setSelectedShifts}
                                className="custom-select"
                            >
                                {shifts.map(shift => (
                                    <Option key={shift} value={shift}>
                                        {shift}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                size="small"
                                dropdownClassName="custom-dropdown1"
                                style={{ width: '80px', fontSize: '10px', padding: '2px 6px' }}
                                mode="multiple"
                                placeholder="Teams"
                                dropdownStyle={{ width: '150px'}}
                                value={selectedTeams}
                                onChange={setSelectedTeams}
                                className="custom-select"
                            >
                                {teams.map(team => (
                                    <Option key={team} value={team}>
                                        {team}
                                    </Option>
                                ))}
                            </Select>
                            <Button 
                    onClick={() => exportToCSV(data1, columns)}
                    style={{padding: '2px 6px',marginTop:'0.5%',height:'4%'}}
                    icon={<DownloadOutlined />}
                    type="default"
                    size="small"
                  >
                    Export CSV
                  </Button>

                  <Button type="primary" size="small" onClick={handleFilterClick} style={{ marginRight: '10px' }}>
                    Filter
                  </Button>
                  <Button onClick={handleReset} size="small"  >
                    Reset
                  </Button>
            </Card>
            </div> 
            
          <div className="grid-container">
      <div className="grid-item left">
        <Card>
        <Cards
                          totals={totals}
                          aggregateData={aggregateData}
                          aggregateColumns={aggregateColumns}
                          employeecount={uniqueEmpIDCount}
                          datadis={data1}
                          columns={columns}
                      />
        </Card>
      </div>
      <div className="grid-item right">
      <Card>
      
                      <Page4 />
            
        </Card>
              </div>
    </div>

            <div className='BAR'>
            <Card  >
                <Bar />
            </Card>

            </div>
            <div className='BAR'>
            <Card  >
                <Designation />
            </Card>

            </div>

        </div>
        
    );
    
};

export default Page1;
