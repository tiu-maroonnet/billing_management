import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  type?: 'line' | 'bar';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      fill?: boolean;
      tension?: number;
    }[];
  };
  title?: string;
  height?: number;
  showLegend?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  type = 'line',
  data,
  title = 'Revenue Overview',
  height = 300,
  showLegend = true,
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (value >= 1000000) {
              return 'Rp' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return 'Rp' + (value / 1000).toFixed(0) + 'K';
            }
            return 'Rp' + value;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const,
    },
  };

  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || (type === 'bar' 
        ? 'rgba(139, 0, 0, 0.7)' 
        : 'rgba(139, 0, 0, 0.1)'),
      borderColor: dataset.borderColor || 'rgb(139, 0, 0)',
      borderWidth: dataset.borderWidth || 2,
      fill: dataset.fill !== undefined ? dataset.fill : true,
      tension: dataset.tension || 0.4,
    })),
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div style={{ height: `${height}px` }}>
        {type === 'line' ? (
          <Line options={options} data={chartData} />
        ) : (
          <Bar options={options} data={chartData} />
        )}
      </div>
    </div>
  );
};

export default RevenueChart;