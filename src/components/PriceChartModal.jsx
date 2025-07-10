import React from 'react';
import PriceChart from './PriceChart';
import './AddPriceForm.css';

const PriceChartModal = ({ product, prices, onClose }) => {
  if (!prices || prices.length === 0) {
    return null;
  }

  // Prepare data for chart.js
  const sortedPrices = [...prices].sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate());

  const data = {
    labels: sortedPrices.map(p => p.createdAt?.toDate().toLocaleDateString() || ''),
    datasets: [
      {
        label: `Precio de ${product.name}`,
        data: sortedPrices.map(p => p.price),
        fill: false,
        borderColor: 'rgb(60, 162, 162)',
        backgroundColor: 'rgba(60, 162, 162, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Evolución del precio de ${product.name}`,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 90,
          callback: function(value, index, ticks) {
            const label = this.getLabelForValue(value);
            // Format label to show day above and month below, parsing date as dd/mm/yyyy
            const parts = label.split('/');
            if (parts.length !== 3) return label;
            const day = parts[0];
            const monthNum = parseInt(parts[1], 10);
            if (isNaN(monthNum)) return label;
            const month = new Date(0, monthNum - 1).toLocaleString('default', { month: 'short' });
            return day + '\n' + month;
          }
        }
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <PriceChart data={data} options={options} />
        <button type="button" onClick={onClose} style={{ marginTop: '10px', padding: '10px 20px' }}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default PriceChartModal;
