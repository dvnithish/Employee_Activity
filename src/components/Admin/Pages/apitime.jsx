// src/api.js
const API_URL = 'http://3.110.23.123/api/uniquefilters.php'; // Your PHP API endpoint
const POST_API_URL = 'http://3.110.23.123/api/timeapp.php'; // Your POST API endpoint
const RESTRICTED_API_URL = 'http://3.110.23.123/api/restricted.php'; // Your new GET API endpoint

export const fetchUniqueEmpIds = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();

  // Extract only the EMPID values
  const empIds = data.data.EMPID || []; // Adjust according to your data structure

  return empIds;
};

// New function to send selected employee ID and date
export const sendData = async ({ empId, date }) => {
  const response = await fetch(POST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ empId, date }), // Send employee ID and date
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
};

// New function to get all data from the restricted endpoint
export const fetchAllData = async () => {
  const response = await fetch(RESTRICTED_API_URL);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();

  return data; // Return the entire data structure received from the API
};
export const postData = async ({ websiteName, type }) => {
  const response = await fetch('http://localhost/insert.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ websiteName, type }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
};