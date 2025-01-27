import React, { useEffect, useState } from 'react';
import Layout from '../layout'; // Layout padrão com Sidebar e Header
import '../css/Admin.css';
import { fetchSales } from '../../src/functions/firestoreFunction';

const Relatorios = () => {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const { totalSales } = await fetchSales();
        setTotalSales(totalSales);
        console.log(totalSales)
      }catch (error){
        console.log('Erro ao buscar vendas:', error);
      }
    };
    loadSales();
  }, []);

  const formatToBRL = (totalSales) => {
    return new Intl.NumberFormat('pt-BR', {
      style:'currency',
      currency:'BRL',
    }).format(totalSales);
  };

  return (
    <Layout>
      <div className="relatorios-container">
        <h1>Relatórios de Desempenho</h1>
        <p>Aqui você pode acompanhar o desempenho da barbearia e o faturamento.</p>
        
        <section className="homepage-stats">
        <div className="stat-card">
          <h3>Receita</h3>
          <p>R$: {formatToBRL(totalSales)}</p>
        </div>
        <div className="stat-card">
          <h3>Serviços Realizados</h3>
          <p>120 este mês</p>
        </div>
      </section>
      
      </div>
    </Layout>
  );
};

export default Relatorios;
