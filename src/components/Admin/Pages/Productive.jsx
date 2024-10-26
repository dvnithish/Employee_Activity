import React, { useState, useRef, useEffect } from 'react';
import { Select, Spin, Alert, Button, DatePicker, Table, Modal, Input } from 'antd';
import { fetchUniqueEmpIds, sendData, fetchAllData, postData } from './apitime'; // Update import
import './Productive.css';

const { Option } = Select;

function Productive() {
  const [empIds, setEmpIds] = useState([]);
  const [error, setError] = useState(null);
  const [loadingEmpIds, setLoadingEmpIds] = useState(true);
  const [loadingResponseData, setLoadingResponseData] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [responseData, setResponseData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingAllData, setLoadingAllData] = useState(false);
  const dataFetchedRef = useRef(false);
  const [selectedUnproductiveRow, setSelectedUnproductiveRow] = useState(null);
  const [temporaryProductive, setTemporaryProductive] = useState([]);
  const [temporaryRestricted, setTemporaryRestricted] = useState([]);
  const [pendingWebsite, setPendingWebsite] = useState(null);
  const [pendingArrowColor, setPendingArrowColor] = useState(null);
  const [productiveData, setProductiveData] = useState([]);
  const [restrictedData, setRestrictedData] = useState([]);
  const [urlInput, setUrlInput] = useState(''); // New state for URL input

  const loadEmpIds = async () => {
    if (dataFetchedRef.current) return;

    setLoadingEmpIds(true);
    try {
      const ids = await fetchUniqueEmpIds();
      setEmpIds(ids);
      dataFetchedRef.current = true;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEmpIds(false);
    }
  };

  const loadAllData = async () => {
    setLoadingAllData(true);
    try {
      const data = await fetchAllData();
      setAllData(data.data || []);
      partitionData(data.data || []);
    } catch (err) {
      setError(`Error fetching all data: ${err.message}`);
    } finally {
      setLoadingAllData(false);
    }
  };

  useEffect(() => {
    loadEmpIds();
    loadAllData();
  }, []);

  const partitionData = (data) => {
    const productive = data.filter(item => item.PRODUCTIVE_YN === 'Y');
    const restricted = data.filter(item => item.PRODUCTIVE_YN === 'N');
    setProductiveData(productive);
    setRestrictedData(restricted);
  };

  const handleFilterClick = async () => {
    if (!selectedEmpId || !selectedDate) {
      alert('Please select an Employee ID and a date to filter.');
      return;
    }

    setLoadingResponseData(true);
    try {
      const response = await sendData({ empId: selectedEmpId, date: selectedDate });
      const filteredData = response.data
        .filter(item => item.USAGE_TYPE === 'UNPRODUCTIVE')
        .map(item => ({ WEBSITE_NAME: item.WEBSITE_NAME }));

      const uniqueData = [...new Map(filteredData.map(item => [item.WEBSITE_NAME, item])).values()];
      
      setResponseData(uniqueData);
    } catch (err) {
      setError(`Error sending data: ${err.message}`);
    } finally {
      setLoadingResponseData(false);
    }
  };

  const handleResetClick = () => {
    setSelectedEmpId(null);
    setSelectedDate(null);
    setResponseData([]);
    setSelectedUnproductiveRow(null);
    setTemporaryProductive([]);
    setTemporaryRestricted([]);
    setUrlInput(''); // Reset URL input
  };

  const showUpdateModal = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedUnproductiveRow(null);
    setPendingWebsite(null);
    setPendingArrowColor(null);
    setUrlInput(''); // Clear URL input on cancel
    setTemporaryProductive([]);
    setTemporaryRestricted([]);
  };

  const handleRowSelectionChange = (selectedRowKeys) => {
    if (selectedRowKeys.length > 0) {
      const selectedRow = responseData.find(item => item.WEBSITE_NAME === selectedRowKeys[0]);
      setSelectedUnproductiveRow(selectedRow);
      setUrlInput(''); // Clear URL input when selecting a row
    } else {
      setSelectedUnproductiveRow(null);
    }
  };

  const handleArrowClick = (color) => {
    const websiteName = selectedUnproductiveRow ? selectedUnproductiveRow.WEBSITE_NAME : urlInput;

    if (websiteName) {
      // Restore the previously selected website back to the unproductive list
      if (pendingWebsite) {
        if (pendingArrowColor === 'green') {
          setTemporaryProductive(prev => prev.filter(item => item.APP_WEBSITE_URL !== pendingWebsite));
        } else if (pendingArrowColor === 'red') {
          setTemporaryRestricted(prev => prev.filter(item => item.APP_WEBSITE_URL !== pendingWebsite));
        }
        setResponseData(prev => [...prev, { WEBSITE_NAME: pendingWebsite }]); // Return to unproductive
      }

      // Update the pending website and color
      if (color === 'green') {
        setTemporaryProductive(prev => [...prev, { APP_WEBSITE_URL: websiteName }]);
      } else if (color === 'red') {
        setTemporaryRestricted(prev => [...prev, { APP_WEBSITE_URL: websiteName }]);
      }

      setPendingWebsite(websiteName);
      setPendingArrowColor(color);
      setResponseData(prev => prev.filter(item => item.WEBSITE_NAME !== websiteName)); // Remove from unproductive
    }
  };

  const handleApplyClick = async () => {
    const websiteToSubmit = urlInput || pendingWebsite; // Use URL input or pending website

    if (websiteToSubmit && pendingArrowColor) {
      const type = pendingArrowColor === 'green' ? 'Y' : 'N'; // Set Y for productive, N for restricted
      const actionType = pendingArrowColor === 'green' ? 'PRODUCTIVE' : 'RESTRICTED';

      try {
        // Send data to the server
        await postData({ websiteName: websiteToSubmit, type });
        alert(`Successfully moved ${websiteToSubmit} to ${actionType}`);
        
        // Update productive or restricted data
        if (pendingArrowColor === 'green') {
          setProductiveData(prev => [...prev, { APP_WEBSITE_URL: websiteToSubmit }]);
        } else if (pendingArrowColor === 'red') {
          setRestrictedData(prev => [...prev, { APP_WEBSITE_URL: websiteToSubmit }]);
        }

        // Close modal after a successful operation
        handleCancel();
        
      } catch (err) {
        setError(`Error applying changes: ${err.message}`);
      } finally {
        // Reset pending selections after applying
        setPendingWebsite(null);
        setPendingArrowColor(null);
        setSelectedUnproductiveRow(null);
        setUrlInput(''); // Reset URL input after applying
      }
    } else {
      alert('Please select a URL and its type before applying.');
    }
  };

  if (loadingEmpIds) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

  return (
    <div className="productive-container">
      <h2>Select Employee ID</h2>
      <p style={{color:'red' ,fontSize:'10px'}}>NOTE: Select the employee for upadting productive website</p>
      <div className="row-container">
  <Select
    style={{ maxWidth: '150px' }}
    placeholder="Employee ID"
    onChange={(value) => setSelectedEmpId(value)}
    allowClear
    value={selectedEmpId}
    size="large"
  >
    {empIds.map((id) => (
      <Option key={id} value={id}>
        {id}
      </Option>
    ))}
  </Select>
  <DatePicker
    style={{ width: '150px' }}
    onChange={(date) => setSelectedDate(date ? date.format('YYYY-MM-DD') : null)}
    placeholder="Select a date"
    size="small"
  />
  <Button
    type="primary"
    onClick={handleFilterClick}
    size="small"
  >
    Filter
  </Button>
  <Button
    onClick={handleResetClick}
    size="small"
  >
    Reset
  </Button>
  <Button
    type="default"
    onClick={showUpdateModal}
    size="small"
    disabled={responseData.length === 0}
  >
    UPDATE PRODUCTIVE WEBSITE
  </Button>
</div>

      <div className='responsive-table-container'>
        <Table
          dataSource={restrictedData}
          columns={[{ title: 'RESTRICTED WEBSITES', dataIndex: 'APP_WEBSITE_URL', key: 'websiteUrl' }]}
          rowKey="APP_WEBSITE_URL"
          pagination={false}
          size="middle"
          rowSelection={false}
        />
      </div>


      {loadingResponseData ? (
        <Spin size="large" style={{ marginTop: '20px' }} />
      ) : responseData.length > 0 ? (
        <div className="responsive-table-container">
          {/* Additional table for unproductive data if needed */}
        </div>
      ) : (
        <div style={{ marginTop: '20px', fontSize: '16px', color: '#888' }}>
          No data for the selected filters.
        </div>
      )}

      <Modal
        title="All Website Data"
        visible={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
      >
        <Input
                placeholder="Enter URL (optional)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{ marginBottom: '10px', width: '100%' }}
              />
        {loadingAllData ? (
          <Spin size="large" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ width: '30%' }}>
              <Table
                dataSource={responseData}
                columns={[{ title: 'UNPRODUCTIVE', dataIndex: 'WEBSITE_NAME', key: 'websiteName' }]}
                rowKey="WEBSITE_NAME"
                pagination={false}
                size="middle"
                rowSelection={{
                  type: 'radio',
                  onChange: handleRowSelectionChange,
                  selectedRowKeys: selectedUnproductiveRow ? [selectedUnproductiveRow.WEBSITE_NAME] : [],
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '0 10px' }}>
              
              <Button 
                type="default" 
                style={{ color: 'red', marginBottom: '5px', backgroundColor: pendingArrowColor === 'red' ? '#ffcccc' : 'transparent' }} 
                onClick={() => handleArrowClick('red')}
                disabled={!selectedUnproductiveRow && !urlInput}
              >
                ➜
              </Button>
              <Button 
                type="default" 
                style={{ color: 'green', marginBottom: '5px', backgroundColor: pendingArrowColor === 'green' ? '#ccffcc' : 'transparent' }} 
                onClick={() => handleArrowClick('green')}
                disabled={!selectedUnproductiveRow && !urlInput}
              >
                ➜
              </Button>
              <Button type="primary" style={{ marginTop: '10px' }} onClick={handleApplyClick}>
                Apply
              </Button>
            </div>
            <div style={{ width: '30%' }}>
              <Table
                dataSource={[...productiveData, ...temporaryProductive]}
                columns={[{ title: 'PRODUCTIVE', dataIndex: 'APP_WEBSITE_URL', key: 'websiteUrl' }]}
                rowKey="APP_WEBSITE_URL"
                pagination={false}
                size="middle"
                rowSelection={false}
              />
            </div>
            <div style={{ width: '30%' }}>
              <Table
                dataSource={[...restrictedData, ...temporaryRestricted]}
                columns={[{ title: 'RESTRICTED', dataIndex: 'APP_WEBSITE_URL', key: 'websiteUrl', color: 'red' }]}
                rowKey="APP_WEBSITE_URL"
                pagination={false}
                size="middle"
                rowSelection={false}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Productive;
