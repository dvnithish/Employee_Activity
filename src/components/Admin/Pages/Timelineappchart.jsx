import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import '../Css/timeline.css';

const ApexChart1 = ({ data }) => {
  const [series, setSeries] = useState([]);
  const [chartHeight, setChartHeight] = useState(); // Default height

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
          // Find the series object that matches the label value
          const seriesObj = series.find(s => s.name === value);
          if (seriesObj) {
            // Return the USERNAME and APPLICATION_NAME information
            return `${seriesObj.name} - ${seriesObj.applicationName}`;
          }
          
          return value;
        }
      }
    },
    legend: {
      position: 'right'
    },
    tooltip: {
      custom: function (opts) {
        const fromTime = new Date(opts.y1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const toTime = new Date(opts.y2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const seriesName = opts.seriesName || '';
        const fillColor = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].fillColor;
        const usageType = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].usageType;
        const applicationName = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].applicationName;
        const web = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].web;

        console.log(`Processing APPLICATION_NAME: ${applicationName}`);
        return (
          `<div class="apexcharts-tooltip-rangebar" style="border-left: 4px solid ${fillColor}; padding-left: 8px;">
            <div><span class="series-name" style="color: ${fillColor}">${seriesName}</span></div>
            <div><span class="usage-type">${usageType}</span> <span class="category">from ${fromTime} to ${toTime}</span></div>
            <div><strong>Application:</strong> ${applicationName}</div>
            <div><strong>Website name:</strong> ${web}</div>

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
      return 250; // Default height if data is not valid
    }
    const uniqueUsernames = new Set(data.map(item => item.USERNAME));
    return uniqueUsernames.size * 100; // 100px per unique USERNAME
  };

  const processData = (data) => {
    if (!Array.isArray(data)) {
      console.error('Invalid data format:', data);
      return [];
    }
  
    const series = {};
  
    data.forEach(item => {
      const EMPNAME = item.EMPNAME;
      const APPLICATION_NAME = item.APPLICATION_NAME;
      const usageType = item.USAGE_TYPE;
      const web=item.WEBSITE_NAME;
      let color;
  
      switch (usageType) {
        case 'PRODUCTIVE':
          color = '#00E396';
          break;
        case 'UNPRODUCTIVE':
          color = '#FF4560';
          break;
        case 'APPLICATION':
          color = '#00E396'; // Example color for application
          break;
        default:
          color = '#999'; // Default color
      }
  
      // Print the application name to the console
      console.log(`Processing APPLICATION_NAME: ${APPLICATION_NAME}`);
  
      if (!series[EMPNAME]) {
        series[EMPNAME] = {
          name: EMPNAME,
          data: [],
          applicationName: APPLICATION_NAME,
          web:web
        };
      }
  
      series[EMPNAME].data.push({
        x: EMPNAME,
        y: [
          new Date(item.OPEN_TIME_CN).getTime(),
          new Date(item.CLOSE_TIME_CN).getTime()
        ],
        fillColor: color,
        usageType: usageType,
        applicationName: APPLICATION_NAME,
        web:web
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

export default ApexChart1;
