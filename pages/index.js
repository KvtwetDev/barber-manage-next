import React, { useEffect, useState } from 'react';
import './css/Dashboard.css';
import { useRouter } from 'next/router';
import { fetchAppointments, fetchClients } from '../src/functions/firestoreFunction';
import { format } from 'date-fns';
import Layout from './layout';

const Dashboard = () => {
  const navigate = useRouter();

  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [userName] = useState("Lucas Eduardo");
  const [services] = useState(5);
  const [money] = useState(3500);

  const handleNavigateToAppointments = () => navigate('/appointments');
  const handleNavigateToCostumers = () => navigate('/costumers');
  const handleNavigateToStock = () => navigate('/stock');

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const appointments = await fetchAppointments();
        setEvents(appointments);

        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch (error) {
        console.log('Erro ao carregar agendamentos', error);
      }
    };
    loadAppointments();
  }, []);

  return (
    <Layout>
      <div className="homepage-container">
      <header className="homepage-header">
        <h1>Bem-vinda, {userName}!</h1>
        <p>Hoje é {new Date().toLocaleDateString('pt-BR')}</p>
      </header>

      <section className="homepage-sections">
        <div className="section-card">
          <h2>Agendamentos</h2>
          <p>{events.length} agendamentos para hoje!</p>
          <button onClick={handleNavigateToAppointments}>Ver todos</button>
        </div>
        <div className="section-card">
          <h2>Clientes</h2>
          <p>Você tem {clients.length} clientes cadastrados</p>
          <button onClick={handleNavigateToCostumers}>Gerenciar</button>
        </div>
        <div className="section-card">
          <h2>Serviços</h2>
          <p>Você tem {services} serviços oferecidos</p>
          <button onClick={handleNavigateToStock}>Ver Serviços</button>
        </div>
      </section>

      <section className="homepage-stats">
        <div className="stat-card">
          <h3>Receita Mensal</h3>
          <p>R$: {money}</p>
        </div>
        <div className="stat-card">
          <h3>Serviços Realizados</h3>
          <p>120 este mês</p>
        </div>
      </section>

      <section className="homepage-recent">
        <div className="next-appointment">
          <h2>Próximos Agendamentos</h2>
          {events.length === 0 ? (
            <p>Sem agendamentos</p>
          ) : (
            <ul>
              {events
                .filter((event) => new Date(event.start) >= new Date())
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .map((event) => (
                  <li key={event.id} className="appointment-item">
                    Cliente: <strong>{event.costumer}</strong>
                    {format(new Date(event.start), 'dd/MM/yyyy')} - 
                    {format(new Date(event.start), ' HH:mm')} até {format(new Date(event.end), 'HH:mm')}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>

      <footer className="homepage-footer">
        <p>© 2024 Barber Manage. Todos os direitos reservados.</p>
      </footer>
    </div>
    </Layout>
  );
};

export default Dashboard;
