// apiService.js

// Function to make a GET request to "uniquefilters.php"
export const fetchUniqueFilters = async () => {
    try {
        const response = await fetch('http://3.110.23.123/api/uniquefilters.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching unique filters:', error);
        throw error;
    }
};

// Function to make a GET request to "timeline.php"
export const fetchTimeline = async () => {
    try {
        const response = await fetch('http://3.110.23.123/api/timeline.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching timeline:', error);
        throw error;
    }
};
export const postTimeline = async (payload) => {
    try {
        const response = await fetch('http://localhost/timeline.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload), // Send the payload as JSON
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Read response text
        const text = await response.text();
        console.log('Raw response:', text);

        // Parse JSON response
        const data = JSON.parse(text);
        return data;
    } catch (error) {
        console.error('Error posting timeline:', error);
        throw error;
    }
};
