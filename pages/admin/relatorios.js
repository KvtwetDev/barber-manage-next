import React, { useEffect, useState } from "react";
import Layout from "../layout";
import { fetchSales } from "../../src/functions/firestoreFunction";
import "../css/Relatorios.css";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, LineElement, BarElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Relatorios = () => {
  const [totalMonthySales, setTotalMonthySales] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [annualSalesData, setAnnualSalesData] = useState([]);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesDataMonthy = await fetchSales();      
        const salesData = await fetchSales();
        
        const totalSales = salesData.sales.reduce((acc, sale) => acc + sale.total, 0);
        setTotalSales(totalSales);

        if (salesDataMonthy && Array.isArray(salesDataMonthy.sales)) {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          const filteredSales = salesDataMonthy.sales.filter((sale) => {
            const saleDateMonthy = sale.date.data;
            const [day, month, year] = saleDateMonthy.split("/");
            const saleMonth = parseInt(month, 10) -1;
            const saleYear = parseInt(year, 10);

            return saleMonth === currentMonth && saleYear === currentYear;
          });

          const totalMonthy = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
          setTotalMonthySales(totalMonthy);

          const monthlySales = Array(12).fill(0)

          salesDataMonthy.sales.forEach((sale) => {
            const saleData = sale.date.data;
            const [day, month, year] = saleData.split("/");
            const saleMonth = parseInt(month, 10) -1;
            const saleYear = parseInt(year, 10);

            if (saleYear === currentYear) {
              monthlySales[saleMonth] += sale.total;
            }
          });

          setAnnualSalesData(monthlySales)
          
        } else {
          console.error("Os dados de vendas não são um array:", salesData.sales);
        }

        
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }

    };

    loadSales();
  }, []);

  const formatToBRL = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const chartData = {
    labels: [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ],
    datasets: [
      {
        label: "Faturamento Anual",
        data: annualSalesData,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.1
      },
    ],
  };
  

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          callback: function(value){
            return `R$ ${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  const chartData2 = {
    labels: [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ].filter((_, index) => annualSalesData[index] >0),
    datasets: [
      {
        label: "Faturamento Mensal",
        data: annualSalesData,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.1
      },
    ],
  };

  const chartOptions2 = {
    responsive: true,
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
  
  return (
    <Layout>
      <div className="relatorios-container">

        <section className="stats-container">
          <div className="stats-title">
            <h2>Financeiro</h2>
            <p className="stats-subtitle">Aqui você pode ver o total de vendas.</p>
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
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="chart-monthy">
            <h3>Faturamento Mensal</h3>
            <Line data={chartData2} options={chartOptions2} />
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Relatorios;
