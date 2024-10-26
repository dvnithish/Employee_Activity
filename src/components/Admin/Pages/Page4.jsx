import React, { useEffect, useState } from 'react';
import VirtualList from 'rc-virtual-list';
import { Avatar, List, message, Button } from 'antd';
import '../Css/Page4.css';
import StatusTb from './StatusTb';

const ContainerHeight = 170; // Height of the virtual list container
const fakeDataUrl = 'http://3.110.23.123/api/DUMP.php'; // Your API URL

const Active = ({ EMPID, EMPNAME, CURRENT_STATUS, LAST_SEEN }) => {
  const statusColor = {
    ACTIVE: '#6ECB5A',
    INACTIVE: '#f5222d',
    OFFLINE: '#8c8c8c',
  }[CURRENT_STATUS.toUpperCase()] || '#d9d9d9';

  return (
    <List.Item key={EMPID}>
      <List.Item.Meta />
      <div style={{ display: 'flex' }}>
        <div style={{ padding: '5px' }}>
          <Avatar style={{ backgroundColor: statusColor }}>{EMPNAME.charAt(0)}</Avatar>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', marginTop: '3%' }}>
          <div><b>{EMPNAME}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px' }}>
            <div>{CURRENT_STATUS}</div>
            {(CURRENT_STATUS.toUpperCase() === 'INACTIVE' || CURRENT_STATUS.toUpperCase() === 'OFFLINE') && (
              <div>Last seen: {LAST_SEEN}</div>
            )}
          </div>
        </div>
      </div>
    </List.Item>
  );
};

const Page4 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const fetchData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(fakeDataUrl);
      const result = await response.json();

      const newActiveCount = result.filter(item => item.CURRENT_STATUS.toUpperCase() === 'ACTIVE').length;
      const newInactiveCount = result.filter(item => item.CURRENT_STATUS.toUpperCase() === 'INACTIVE').length;
      const newOfflineCount = result.filter(item => item.CURRENT_STATUS.toUpperCase() === 'OFFLINE').length;

      setActiveCount(newActiveCount);
      setInactiveCount(newInactiveCount);
      setOfflineCount(newOfflineCount);

      setData(result);
      message.success(`${result.length} more items loaded!`);
    } catch (error) {
      console.error('Error fetching the data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onScroll = (e) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    if (Math.abs(scrollHeight - scrollTop - ContainerHeight) <= 1) {
      fetchData();
    }
  };

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
  };

  const handleReload = () => {
    setSelectedFilter('All');
  };

  const filteredData = data.filter(item => {
    if (selectedFilter === 'All') return true;
    return item.CURRENT_STATUS.toUpperCase() === selectedFilter.toUpperCase();
  });

  return (
    <div className="page-container">
      <div className="button-container">
        <Button
          size="small"
          className="filter-button active"
          onClick={() => handleFilterClick('ACTIVE')}
        >
          Active: {activeCount}
        </Button>
        <Button
          size="small"
          className="filter-button inactive"
          onClick={() => handleFilterClick('INACTIVE')}
        >
          Inactive: {inactiveCount}
        </Button>
        <Button
          size="small"
          className="filter-button offline"
          onClick={() => handleFilterClick('OFFLINE')}
        >
          Offline: {offlineCount}
        </Button>
        <Button
          size="small"
          className="filter-button all"
          onClick={handleReload}
        >
          All
        </Button>
      </div>

      <div className="virtual-list-container">
        <VirtualList
          data={filteredData}
          height={ContainerHeight}
          itemHeight={4}
          itemKey="EMPID"
          onScroll={onScroll}
        >
          {(item) => (
            <Active
              {...item}
              activeCount={activeCount}
              inactiveCount={inactiveCount}
            />
          )}
        </VirtualList>
      </div>

      <div className="status-table-container">
        <StatusTb data={data} />
      </div>
    </div>
  );
};

export default Page4;
