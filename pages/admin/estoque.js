import React from 'react';
import Stock from '../stock';
import Layout from '../layout';

const Estoque = () => {
  return (
    <Layout>
      <div className="estoque-container">
        <Stock/>
      </div>
    </Layout>
  );
};

export default Estoque;
