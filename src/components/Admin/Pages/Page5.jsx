import React, { useEffect, useState } from 'react';

// Corrected component name to `Active`

const Page5 = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://3.110.23.123/api/DUMP.php');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching the data:', error);
      }
    };

    fetchData();
  }, []);
  function Active(props) {
    return (
      <div>
        I am {props.EMPNAME}
      </div>
    );
  }
  

  return (
    <div>
      <h1>Employee Status</h1>
      {data.map((item) => (
        <Active
          key={item.EMPID} // Use a unique identifier as key
          EMPID={item.EMPID}
          EMPNAME={item.EMPNAME}
          SHIFT={item.SHIFT}
          LAST_SEEN={item.LAST_SEEN}
          CURRENT_STATUS={item.CURRENT_STATUS}
          // Pass additional props if needed
          // EMPNAME={item.EMPNAME}
        />
      ))}
    </div>
  );
};

export default Page5;
