import { useState, useEffect } from 'react';
import { fetchClients, fetchProducts, saveSales } from '../src/functions/firestoreFunction';
import Layout from './layout';
import './css/Cash.css';
import './css/Layout.css';

const Cash = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const loadClients = async () => {
      const clientList = await fetchClients();
      setClients(clientList);
    };

    const loadProducts = async () => {
      const productList = await fetchProducts();
      setProducts(productList);
    };

    loadClients();
    loadProducts();
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    setTotal(total + product.price);
    setSearchTerm('');
    setFilteredProducts([]);
    setHighlightIndex(0);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
    setHighlightIndex(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      addToCart(filteredProducts[highlightIndex]);
    } else if (e.key === 'ArrowDown') {
      setHighlightIndex((prev) => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      setHighlightIndex((prev) =>
        prev === 0 ? filteredProducts.length - 1 : prev - 1
      );
    }
  };

  const handleSale = async () => {
    const saleData = {
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      total: total,
      items: cart,
      date: new Date().toISOString(),
    };

    try {
      await saveSales(saleData);
      alert('Venda finalizada com sucesso!');
      setCart([]);
      setTotal(0);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
    }
    setSelectedClient([]);
  };

  const deleteCart = (index) => {
    const removedItem = cart[index];
    const updateCart = cart.filter((_, i) => i !== index);
    setCart(updateCart);
    setTotal((prevTotal) => prevTotal - removedItem.price);
  };

  return (
    <Layout>
      <div className="page">
        <div className="header">
          <h1>PDV - Caixa</h1>
        </div>
        <div className="cart-container">
          <div className="cart">
            <h2>Carrinho</h2>
            <ul className="cart-list">
              {cart.map((item, index) => (
                <div className="cart-content" key={index}>
                  <li>{item.name} - R$ {item.price.toFixed(2)}</li>
                  <button onClick={() => deleteCart(index)}>X</button>
                </div>
              ))}
            </ul>
          </div>

          <div className="client-selector">
            <div>
                <label>Selecione o Cliente: </label>
                <select
                onChange={(e) => {
                    const client = clients.find(client => client.id === e.target.value);
                    setSelectedClient(client);
                }}
                value={selectedClient?.id || ''}
                >
                <option value="">-- Selecione --</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>
                    {client.name}
                    </option>
                ))}
                </select>
                <div className='client-content'>
                    {selectedClient ? (
                        <div className='client-about' key={selectedClient.id}>
                            <div>
                                <h2>Cliente</h2>
                                <p>{selectedClient.name}</p>
                            </div>
                            <div>
                                <h2>CPF</h2>
                            </div>
                        </div>
                    ) : (
                        <p>Nenhum cliente selecionado</p>
                    )}
                </div>

            </div>

          <div className="product-search">
            <h2>Busca de Produtos/Serviços</h2>
              <input
                type="text"
                placeholder="Digite o produto/serviço..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              <div className="suggestions">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    style={{
                      padding: '5px',
                      cursor: 'pointer',
                      backgroundColor: index === highlightIndex ? '#f0f0f0' : 'transparent',
                    }}
                  >
                    {product.name} - R$ {product.price.toFixed(2)}
                  </div>
                ))}
            </div>

            <h3>Total: R$ {total.toFixed(2)}</h3>
            <button onClick={handleSale}>Finalizar Venda</button>
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cash;
