import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './css/dailygraph.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DailyPeopleTrendWithExplanation = () => {
  const [chartData, setChartData] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('https://xh6cftzd0b.execute-api.ap-northeast-1.amazonaws.com/test/askforClaude');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        const labels = data.processed_data.map(item => item.time).reverse();
        const dataValues = data.processed_data.map(item => item.num).reverse();

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Number of People',
              data: dataValues,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              pointRadius: 0,
              lineTension: 0.3,
            },
          ],
        });

        setExplanation(calculateExplanation(data.processed_data));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching graph data:', error);
        setError('Error loading data. Please try again later.');
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  const calculateExplanation = (data) => {
    const total = data.reduce((acc, curr) => acc + curr.num, 0);
    return `The total number of people in the observed period is ${total}. The trend indicates a peak during specific times.`;
  };

  if (loading) return <p className="loading-message">Loading data, please wait...</p>;
  if (error) return <p className="error-message">{error}</p>;

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        type: 'category',
        ticks: {
          autoSkip: false,
          maxTicksLimit: 24,
          callback: function(value, index) {
            const labelTime = new Date(chartData.labels[index]);
            return labelTime.getMinutes() === 0 ? labelTime.toISOString().slice(11, 16) : null;
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.raw} people`;
          }
        }
      }
    }
  };

  return (
    <div className="trend-container">
      <h2 className="trend-title">本日の人流れグラフ</h2>
      {chartData ? (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p className="no-data-message">No graph data available.</p>
      )}

      {explanation && (
        <div className="explanation-container">
          {/* <h3 className="explanation-title">Explanation:</h3>
          <p className="explanation-text">{explanation}</p> */}
        </div>
      )}
    </div>
  );
};

export default DailyPeopleTrendWithExplanation;
