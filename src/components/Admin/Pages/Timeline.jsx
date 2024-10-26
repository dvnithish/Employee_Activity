import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import '../Css/timeline.css';

const ApexChart = ({ data }) => {
  const [series, setSeries] = useState([]);
  const [chartHeight, setChartHeight] = useState(250); // Default height

  const options = {
    chart: {
      height: chartHeight,
      type: 'rangeBar'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        rangeBarGroupRows: true
      }
    },
    fill: {
      type: 'solid'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: function (value) {
          return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          // Log the value being formatted
          console.log('Y-axis label value:', value);
    
          // Find the series object that matches the label value
          const seriesObj = series.find(s => s.name === value);
          if (seriesObj) {
            // Return the EMPNAME and EMPID information on separate lines
            return (`${seriesObj.name} -${seriesObj.EMPID}`);
          }
    
          // Return the value if no matching series object is found
          return value;
        }
      }
    },
    
   
    legend: {
      show: false // Hide the legend
    },
      tooltip: {
        custom: function (opts) {
          const fromTime = new Date(opts.y1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const toTime = new Date(opts.y2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const seriesName = opts.seriesName || '';
          const fillColor = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].fillColor;
          const reson1 = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].reson; // Correct reference for REASON
          const description = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].description;
          const status = fillColor === '#00E396' ? 'ACTIVE':fillColor === '#FF4560' ? 'INACTIVE' :
                          fillColor === '#8c8c8c' ? 'MISSING' :fillColor === '#1890ff' ? reson1:
                            'UNKNOWN'; // Optional: handle unexpected colors
          const reson = status === 'ACTIVE' ? 'ACTIVE' : reson1;
          


        return (
          `<div class="apexcharts-tooltip-rangebar" style="border-left: 4px solid ${fillColor}; padding-left: 8px; ">
            <div> <span class="series-name" style="color: ${fillColor}">${seriesName}</span></div>
            <div> <span class="status"><strong>${status}</strong> </span> <span class="category">from ${fromTime} to ${toTime}</span></div>
            <div><strong>REASON:</strong> ${reson}</div>
                ${['INACTIVE', 'Client Meeting', 'Global Meeting','Stand-Up Meeting'].includes(status) ? `<div><strong>description:</strong> ${description}</div>` : ''}

          </div>`
        );
      }
    }

  };

  useEffect(() => {
    if (data) {
      const processedSeries = processData(data);
      setSeries(processedSeries);
      if(processedSeries.length === 1){
           // Update chart height based on the number of distinct EMPNAME
          const height = processedSeries.length * 100; // 100px per EMPNAME
          setChartHeight(height);
          console.log(processedSeries.length+"   "+height);
      }
      else if(processedSeries.length > 1 && processedSeries.length < 6)
      {
        const height = processedSeries.length * 70; // 100px per EMPNAME
          setChartHeight(height);
          console.log(processedSeries.length+"   "+height);
      }
      else{
        const height = processedSeries.length * 50; // 100px per EMPNAME
          setChartHeight(height);
          console.log(processedSeries.length+"   "+height);
      }
      
      
    } else {
      // Calculate the height initially based on the initial data
      const initialHeight = calculateInitialHeight(data);
      setChartHeight(initialHeight);
    }
  }, [data]);
  

  const calculateInitialHeight = (data) => {
    if (!Array.isArray(data)) {
      return 0; // Default height if data is not valid
    }
    const uniqueEMPNAMEs = new Set(data.map(item => item.EMPNAME));
    return uniqueEMPNAMEs.size * 70; // 100px per unique EMPNAME
  };

  const processData = (data) => {
    if (!Array.isArray(data)) {
      console.error('Invalid data format:', data);
      return [];
    }

    const series = {};

    data.forEach(item => {
      const EMPNAME = item.EMPNAME;
      const EMPID = item.EMPID;
      const REASON = item.REASON;
      const description=item.description;
      const status = item.ACTIVE_INACTIVE;
      const color = 
          status === 'ACTIVE' ? '#00E396' : 
          status === 'INACTIVE' && (REASON === 'Global Meeting' || REASON === 'Client Meeting' || REASON === 'Stand-Up Meeting') ? '#1890ff' :
          status === 'INACTIVE' ? '#FF4560' :
          status === 'MISSING' ? '#8c8c8c' : 

          '#FFFFFF'; // Fallback color if status is not recognized
      if (!series[EMPNAME]) {
        series[EMPNAME] = {
          name: EMPNAME,
          data: [],
          EMPID:EMPID,
          reson:REASON,
          description:description,
        };
      }
      series[EMPNAME].data.push({
        x: EMPNAME,
        y: [
          new Date(item.FROM_TIME).getTime(),
          new Date(item.TO_TIME).getTime()
        ],
        fillColor: color,
        reson: REASON, // Include REASON in each data point
        description:description,
      });
    });

    return Object.values(series);
  };

  return (
    <div>
      <div id="chart">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="rangeBar" 
          height={chartHeight} 
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default ApexChart;
