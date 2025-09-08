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
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
  }>;
}

interface DashboardChartsProps {
  paymentsData?: ChartData;
  debtData?: ChartData;
  abonentsData?: ChartData;
  waterQualityData?: ChartData;
}

export function DashboardCharts({ 
  paymentsData, 
  debtData, 
  abonentsData, 
  waterQualityData 
}: DashboardChartsProps) {
  const { isDark, colors } = useTheme();

  // Настройки для темной темы
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? colors.text : colors.text,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? colors.surface : colors.background,
        titleColor: isDark ? colors.text : colors.text,
        bodyColor: isDark ? colors.textSecondary : colors.textSecondary,
        borderColor: isDark ? colors.border : colors.border,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? colors.textSecondary : colors.textSecondary
        },
        grid: {
          color: isDark ? colors.border : colors.border
        }
      },
      y: {
        ticks: {
          color: isDark ? colors.textSecondary : colors.textSecondary,
          callback: function(value: any) {
            return new Intl.NumberFormat('ru-RU').format(value) + ' сом';
          }
        },
        grid: {
          color: isDark ? colors.border : colors.border
        }
      }
    }
  };

  // Данные по умолчанию для демонстрации
  const defaultPaymentsData: ChartData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [
      {
        label: 'Поступления',
        data: [45000, 52000, 48000, 61000, 55000, 68000],
        borderColor: colors.success,
        backgroundColor: colors.success + '20',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Расходы',
        data: [38000, 42000, 39000, 45000, 41000, 48000],
        borderColor: colors.error,
        backgroundColor: colors.error + '20',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const defaultDebtData: ChartData = {
    labels: ['Зона 1', 'Зона 2', 'Зона 3', 'Зона 4', 'Зона 5'],
    datasets: [
      {
        label: 'Задолженность',
        data: [125000, 89000, 156000, 72000, 103000],
        backgroundColor: [
          colors.error,
          colors.warning,
          colors.error,
          colors.success,
          colors.warning
        ],
        borderColor: isDark ? colors.border : colors.border,
        borderWidth: 1
      }
    ]
  };

  const defaultAbonentsData: ChartData = {
    labels: ['Активные', 'Заблокированные', 'Новые', 'В долгу'],
    datasets: [
      {
        label: 'Количество',
        data: [650, 45, 28, 123],
        backgroundColor: [
          colors.success,
          colors.error,
          colors.accent,
          colors.warning
        ],
        borderColor: isDark ? colors.border : colors.border,
        borderWidth: 2
      }
    ]
  };

  const defaultWaterQualityData: ChartData = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    datasets: [
      {
        label: 'pH уровень',
        data: [7.2, 7.1, 7.3, 7.0, 7.2, 7.1, 7.3],
        borderColor: colors.accent,
        backgroundColor: colors.accent + '20',
        fill: false,
        tension: 0.3
      },
      {
        label: 'Мутность (NTU)',
        data: [0.8, 1.2, 0.9, 1.1, 0.7, 0.8, 0.9],
        borderColor: colors.warning,
        backgroundColor: colors.warning + '20',
        fill: false,
        tension: 0.3
      }
    ]
  };

  const displayPaymentsData = paymentsData || defaultPaymentsData;
  const displayDebtData = debtData || defaultDebtData;
  const displayAbonentsData = abonentsData || defaultAbonentsData;
  const displayWaterQualityData = waterQualityData || defaultWaterQualityData;

  return (
    <div className="space-y-6">
      {/* График платежей */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          💰 Динамика платежей и расходов
        </h3>
        <div className="h-80">
          <Line data={displayPaymentsData} options={chartOptions} />
        </div>
      </div>

      {/* График задолженности по зонам */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          📊 Задолженность по зонам
        </h3>
        <div className="h-80">
          <Bar data={displayDebtData} options={chartOptions} />
        </div>
      </div>

      {/* Круговая диаграмма абонентов */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          👥 Статистика абонентов
        </h3>
        <div className="h-80 flex justify-center">
          <Doughnut 
            data={displayAbonentsData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  position: 'bottom' as const
                }
              }
            }} 
          />
        </div>
      </div>

      {/* График качества воды */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          💧 Качество воды (недельный мониторинг)
        </h3>
        <div className="h-80">
          <Line data={displayWaterQualityData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts; 