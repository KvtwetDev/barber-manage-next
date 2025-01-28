import React from 'react';
import Layout from './layout';
import Link from 'next/link';
import './css/Admin.css';

const Admin = () => {
  return (
    <Layout>
      <div className="admin-container">
        <h1>Painel de Administração</h1>
        
        <div className="admin-sections">
          <div className="admin-card">
            <h2>Funcionários</h2>
            <p>Gerencie seus colaboradores.</p>
            <Link href="/admin/funcionarios" className="admin-link">Gerenciar Funcionários</Link>
          </div>

          <div className="admin-card">
            <h2>Estoque</h2>
            <p>Controle de produtos e alertas de reposição.</p>
            <Link href="/admin/estoque" className="admin-link">Controle de Estoque</Link>
          </div>

          <div className="admin-card">
            <h2>Relatórios</h2>
            <p>Acompanhe o desempenho e o faturamento.</p>
            <Link href="/admin/relatorios" className="admin-link">Ver Relatórios</Link>
          </div>

          <div className="admin-card">
            <h2>Clientes VIP</h2>
            <p>Gerencie os clientes mais importantes.</p>
            <Link href="/admin/clientes-vip" className="admin-link">Clientes VIP</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
