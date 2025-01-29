import { useState, useEffect } from 'react';
import { deleteAppointment, fetchAppointments, fetchEmployees, fetchProducts, saveSales } from '../src/functions/firestoreFunction';
import Layout from './layout';
import './css/Cash.css';
import './css/Layout.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const Cash = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const [Employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      const clientList = await fetchAppointments();
      const appointmentClients = clientList.map(appointment => ({
        id: appointment.id,
        name: appointment.costumer,
        cpf: appointment.cpf,
        service: appointment.service || [],
      }));
      setClients(appointmentClients);
    };

    const loadProducts = async () => {
      const productList = await fetchProducts();
      setProducts(productList);
    };

    loadClients();
    loadProducts();
  }, []);

  const loadEmployees = async () => {
    try {
      const employees = await fetchEmployees();
      const filteredEmployee = employees.filter(employee => employee.cargo === 'Barbeiro').map(employee => employee.nome);
      setEmployee(filteredEmployee);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const addToCart = (service) => {
    if (service && service.price !== undefined && service.name) {
      setCart(prevCart => {
        const updatedCart = [...prevCart, service];
        const updatedTotal = updatedCart.reduce((total, item) => total + item.price, 0);
        setTotal(updatedTotal);
        return updatedCart;
      });
    }
  };

  const deleteCart = (index) => {
    const updateCart = cart.filter((_, i) => i !== index);
    setCart(updateCart);

    const newTotal = updateCart.reduce((total, item) => total + item.price, 0);
    setTotal(newTotal);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(term)
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

  const handleClientSelection = (clientId) => {
    if (clientId === "avulso") {
      setSelectedClient({
        id: 'avulso',
        name: 'Cliente Avulso',
        cpf: '',
        service: [],
      });
      setCart([]);
      setTotal(0);
    }else{

      const appointment = clients.find(client => client.id === clientId);
      setSelectedClient(appointment);
  
      if (appointment) {
        let clientServices = [];
        if (Array.isArray(appointment.service)) {
          clientServices = appointment.service.map(s => ({
            name: s.name,
            price: s.price
          }));
        } else if (appointment.service) {
          clientServices = [{
            name: appointment.service.name,
            price: appointment.service.price
          }];
        }
        const updatedTotal = clientServices.reduce((total, item) => total + item.price, 0);
        setTotal(updatedTotal);
        setCart(clientServices);
      } else {
        setCart([]);
      }
    };
    };


  const handleSale = async () => {
    const localDate = new Date();

    const formattedDate = format(localDate, 'dd/MM/yyyy', { locale: ptBR });
    const formmatedTime = format(localDate, 'HH:mm:ss');

    if (!selectedClient) {
      alert('Por favor, selecione um cliente antes de finalizar a venda.');
      return;
    }

    const saleData = {
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientCpf: selectedClient.cpf,
      employee: selectedEmployee,
      total: total,
      items: cart,
      date: {
        data: formattedDate,
        hora: formmatedTime,
      },
    };
    console.log(saleData);

    try {
      await saveSales(saleData);
      alert('Venda finalizada com sucesso!');

      await deleteAppointment(selectedClient.id);

      const updateClients = clients.filter(client => client.id !== selectedClient.id);
      setClients(updateClients);

      setCart([]);
      setTotal(0);
      setSelectedEmployee(null);
      setSelectedClient(null);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
    }
  };

  const formatCpfNumber = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
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
            <div className='client-search'>
              <label>Selecione o Cliente: </label>
              <select
                onChange={(e) => handleClientSelection(e.target.value)}
                value={selectedClient?.id || ''}
              >
                <option value="">-- Selecione --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
                <option value="avulso">Cliente Avulso</option>
              </select>

              <div className='client-content'>
                {selectedClient ? (
                  <div className='client-about' key={selectedClient.name}>
                    <div>
                      <h2>Cliente</h2>
                      <p>{selectedClient.name}</p>
                    </div>
                    <div>
                      <h2>CPF</h2>
                      <p>{formatCpfNumber(selectedClient.cpf)}</p>
                    </div>
                  </div>
                ) : (
                  <p>Nenhum cliente selecionado</p>
                )}
              </div>
            </div>

            <div className='employee-content'>
              <label htmlFor="employee-select" className="employee-label">
                Atribuir Funcionário
              </label>
              <select
                id="employee-select"
                className="employee-option"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Selecione um funcionário</option>
                {Employee.map((employee, index) => (
                  <option key={index} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
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
                {searchTerm &&
                  filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      style={{
                        padding: '5px',
                        cursor: 'pointer',
                        backgroundColor: highlightIndex === index ? '#ddd' : 'transparent',
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
