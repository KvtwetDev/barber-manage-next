import React, { useEffect, useState, useMemo } from "react";
import Layout from "../layout";
import { fetchSales } from "../../src/functions/firestoreFunction";
import "../css/Relatorios.css";
import { Bar, Line } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, LineElement, BarElement, scales } from "chart.js";

ChartJS.register(ChartDataLabels, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Relatorios = () => {
  const [totalMonthySales, setTotalMonthySales] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [annualSalesData, setAnnualSalesData] = useState({ years: [], totals: [] });
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [employeeRankingData, setEmployeeRankingData] = useState([]);
  const [employeeSalesCount, setEmployeeSalesCount] = useState([]);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesData = await fetchSales();
        const sales = salesData.sales || [];
        const salesByYear = {};
        const salesByMonth = Array(12).fill(0);

        
        
        const totalSalesValue = sales.reduce((acc, sale) => acc + sale.total, 0);
        setTotalSales(totalSalesValue);

        sales.forEach((sale) => {
          const [day, month, year] = sale.date.data.split("/");
          const saleYear = parseInt(year, 10);

          if (!salesByYear[saleYear]) salesByYear[saleYear] = 0;
          salesByYear[saleYear] += sale.total;
        });

        const years = Object.keys(salesByYear);
        const totalByYear = years.map((year) => salesByYear[year]);
        setAnnualSalesData({ years, totals: totalByYear });

        const currentMonth = new Date().getMonth();
        sales.forEach((sale) => {
          const [day, month, year] = sale.date.data.split("/");
          const saleMonth = parseInt(month, 10) - 1;
          const saleYear = parseInt(year, 10);

          if (saleYear === currentYear) {
            salesByMonth[saleMonth] += sale.total;
          }
        });

        setMonthlySalesData(salesByMonth);

        const totalMonthyValue = sales.filter((sale) => {
          const [day, month, year] = sale.date.data.split("/");
          const saleMonth = parseInt(month, 10) - 1;
          const saleYear = parseInt(year, 10);

          return saleMonth === currentMonth && saleYear === currentYear;
        }).reduce((acc, sale) => acc + sale.total, 0);
        setTotalMonthySales(totalMonthyValue);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    loadSales();
  }, [currentYear]);

  useEffect(() => {
    const loadEmployeeRanking = async () => {
      try {
        const salesData = await fetchSales();
        const sales = salesData.sales || [];
        const employeeSales = {};
        const employeeCounts = {};

        sales.forEach((sale) => {
          const employee = sale.employee;

          if (!employeeSales[employee]) {
            employeeSales[employee] = 0;
            employeeCounts[employee] = 0;
          }

          employeeSales[employee] += sale.total;
          employeeCounts[employee] += 1;
        });

        const sortedEmployeeSales = Object.entries(employeeSales).sort((a, b) => b[1] - a[1]);
        setEmployeeRankingData(sortedEmployeeSales);

        const sortedEmployeeCounts = Object.entries(employeeCounts).sort((a, b) => b[1] - a[1]);
        setEmployeeSalesCount(sortedEmployeeCounts);
      } catch (error) {
        console.error("Erro ao carregar ranking de funcionários:", error);
      }
    };
    loadEmployeeRanking();
  }, []);

  const formatToBRL = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const financeDataAnnual = useMemo(() => ({
    labels: annualSalesData.years,
    datasets: [
      {
        label: "Faturamento Anual",
        data: annualSalesData.totals,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.1
      },
    ],
  }), [annualSalesData]);

  const financeDataAnnualOption = {
    responsive: true,
    plugins: {
      datalabels: {
        color: 'black',
        font: {
          weight: 'bold',
        },
        align: 'end',
        formatter: (value) => `R$ ${value.toFixed(2)}`,
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        display: false,
      },
    },
  };

  const financeDataMonthy = useMemo(() => ({
    labels: monthlySalesData
      .map((sales, index) => (sales > 0 ? ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][index] : null))
      .filter(month => month !== null),
    datasets: [
      {
        label: "Faturamento Mensal",
        data: monthlySalesData,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.1
      },
    ],
  }), [monthlySalesData]);

  const financeDataMonthyOption = {
    responsive: true,
    legend: {
      title: currentYear.toString(),
    },
    plugins: false,
    scales: {
      y: {
        indexAxis: 'y',
        ticks: {
          callback: function(value) {
            return `R$ ${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  const employeeRankingChart = useMemo(() => ({
    labels: employeeRankingData.map(([employee]) => employee),
    datasets: [
      {
        label: "Faturamento por Funcionário",
        data: employeeRankingData.map(([_, total]) => total),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }), [employeeRankingData]);

  const employeeRankingOption = {
    indexAxis: "y",
    responsive: true,
    scales: {
      x: {
        display: false,
      },
    },
    plugins: {
      datalabels: {
        color: 'black',
        font: {
          weight: 'bold',
        },
        align: 'end',
        formatter: (value) => `RS ${value.toFixed(2)}`,
      },
      legend: {
        display: false,
      },
    },
  };

  const employeeSalesCountChart = useMemo(() => ({
    labels: employeeSalesCount.map(([employee]) => employee),
    datasets: [
      {
        label: "Serviços por Funcionários",
        data: employeeSalesCount.map(([_, count]) => count),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }), [employeeSalesCount]);

  const employeeSalesCountChartOption = {
    indexAxis: "y",
    responsive: true,
    scales: {
      x: {
        display: false,
      }
    },
    plugins: {
      datalabels: {
        color: 'black',
        font: {
          weight: 'bold',
        },
        align: 'end',
        formatter: (value) => value,
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <Layout>
      <div className="relatorios-container">
        <section className="stats-container">
          <div className="stats-title">
            <h2>Financeiro</h2>
            <p className="stats-subtitle">Aqui você pode ver o relatório completo.</p>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Faturamento Total</h3>
              <p className="stat-value">{formatToBRL(totalSales)}</p>
            </div>
            <div className="stat-card">
              <h3>Receita Mensal</h3>
              <p className="stat-value">{formatToBRL(totalMonthySales)}</p>
            </div>
          </div>
        </section>

        <section className="chart-container">
          <div className="chart-annual">
            <h3>Faturamento Anual</h3>
            <Bar data={financeDataAnnual} options={financeDataAnnualOption} />
          </div>
          <div className="chart-monthy">
            <h3>Faturamento Mensal - {currentYear}</h3>
            <Line data={financeDataMonthy} options={financeDataMonthyOption} />
          </div>
        </section>

        <section className="chart-container">
          <div className="chart-annual">
            <h3>Faturamento por Funcionários</h3>
            <Bar data={employeeRankingChart} options={employeeRankingOption} />
          </div>
          <div className="chart-monthy">
            <h3>Atendimentos por Funcionários</h3>
            <Bar data={employeeSalesCountChart} options={employeeSalesCountChartOption} />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Relatorios;
