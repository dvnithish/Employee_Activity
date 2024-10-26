import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import '../Css/timeline.css';

const ApexChart2 = ({ data }) => {
  const [series, setSeries] = useState([]);
  const [chartHeight, setChartHeight] = useState(250); // Default height

  const options = {
    chart: {
      height: chartHeight,
      type: 'rangeBar',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        rangeBarGroupRows: true,
      },
    },
    fill: {
      type: 'solid',
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: function (value) {
          return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          console.log('Y-axis label value:', value);
          return value;
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      custom: function (opts) {
        const fromTime = new Date(opts.y1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const toTime = new Date(opts.y2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const seriesName = opts.seriesName || '';
        const fillColor = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].fillColor;
        const reson1 = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].reson;
        const description = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].description;
        const status = fillColor === '#00E396' ? 'ACTIVE' : fillColor === '#FF4560' ? 'INACTIVE' :
          fillColor === '#8c8c8c' ? 'MISSING' : fillColor === '#1890ff' ? reson1 : 'UNKNOWN';
        const reson = status === 'ACTIVE' ? 'ACTIVE' : reson1;

        return (
          `<div class="apexcharts-tooltip-rangebar" style="border-left: 4px solid ${fillColor}; padding-left: 8px;">
            <div> <span class="series-name" style="color: ${fillColor}">${seriesName}</span></div>
            <div> <span class="status"><strong>${status}</strong> </span> <span class="category">from ${fromTime} to ${toTime}</span></div>
            <div><strong>REASON:</strong> ${reson}</div>
            ${['INACTIVE', 'Client Meeting', 'Global Meeting', 'Stand-Up Meeting'].includes(status) ? `<div><strong>description:</strong> ${description}</div>` : ''}
          </div>`
        );
      },
    },
  };

  useEffect(() => {
    if (data) {
      const processedSeries = processData(data);
      setSeries(processedSeries);
      if (processedSeries.length === 1) {
        const height = processedSeries.length * 100;
        setChartHeight(height);
      } else if (processedSeries.length > 1 && processedSeries.length < 6) {
        const height = processedSeries.length * 70;
        setChartHeight(height);
      } else {
        const height = processedSeries.length * 50;
        setChartHeight(height);
      }
    } else {
      const initialHeight = calculateInitialHeight(data);
      setChartHeight(initialHeight);
    }
  }, [data]);

  const calculateInitialHeight = (data) => {
    if (!Array.isArray(data)) {
      return 0;
    }
    const uniqueDates = new Set(data.map(item => new Date(item.FROM_TIME).toDateString()));
    return uniqueDates.size * 70;
  };

  const processData = (data) => {
    if (!Array.isArray(data)) {
      console.error('Invalid data format:', data);
      return [];
    }

    const series = {};

    data.forEach(item => {
      const date = new Date(item.FROM_TIME).toDateString();
      const EMPNAME = item.EMPNAME;
      const EMPID = item.EMPID;
      const REASON = item.REASON;
      const description = item.description;
      const status = item.ACTIVE_INACTIVE;

      const color = 
        status === 'ACTIVE' ? '#00E396' : 
        status === 'INACTIVE' && (REASON === 'Global Meeting' || REASON === 'Client Meeting' || REASON === 'Stand-Up Meeting') ? '#1890ff' :
        status === 'INACTIVE' ? '#FF4560' :
        status === 'MISSING' ? '#8c8c8c' : '#FFFFFF';

      if (!series[date]) {
        series[date] = {
          date: date,
          data: [],
          reson: REASON,
          description: description,
          fromTime: new Date(item.FROM_TIME).getTime(),
          toTime: new Date(item.TO_TIME).getTime(),
        };
      }

      series[date].data.push({
        x: date,
        y: [new Date(item.FROM_TIME).getTime(), new Date(item.TO_TIME).getTime()],
        fillColor: color,
        reson: REASON,
        description: description,
      });

      series[date].fromTime = Math.min(series[date].fromTime, new Date(item.FROM_TIME).getTime());
      series[date].toTime = Math.max(series[date].toTime, new Date(item.TO_TIME).getTime());
    });

    return Object.values(series).map(entry => ({
      name: entry.date,
      data: entry.data,
    }));
  };

  return (
    <div>
      {series.length > 0 ? (
        <div id="chart">
          <ReactApexChart
            options={options}
            series={series}
            type="rangeBar"
            height={chartHeight}
          />
        </div>
      ) : (
        <div>No data available select the filter.</div>
      )}
      <div id="html-dist"></div>
    </div>
  );
};

export default ApexChart2;
