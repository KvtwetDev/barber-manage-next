import React, { useEffect, useState } from 'react';
import './css/Index.css';

import { fetchAppointments, fetchClients } from '../src/functions/firestoreFunction';
import { format } from 'date-fns';
import Layout from './layout';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [userName] = useState("Lucas Eduardo");
  const [services] = useState(5);

  const handleNavigation = (path) => {
    router.push(path);
  };

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
        <h1>Bem-vindo (a), {userName}!</h1>
        <p>Hoje é {new Date().toLocaleDateString('pt-BR')}</p>
      </header>

      <section className="homepage-sections">
        <div className="section-card">
          <h2>Agendamentos</h2>
          <p>{events.length} agendamentos!</p>
          <button onClick={() => handleNavigation('/appointments')}>Ver todos</button>
        </div>
        <div className="section-card">
          <h2>Clientes</h2>
          <p>Você tem {clients.length} clientes cadastrados</p>
          <button onClick={() => handleNavigation('/costumers')}>Gerenciar</button>
        </div>
      </section>

      <section className="homepage-next">
          <h2>Próximos Agendamentos</h2>
        <div className="next-appointment-dashboard">

          {events.length === 0 ? (
            <p>Sem agendamentos</p>
          ) : (
            <div className='frame'>
              {events
                .filter((event) => new Date(event.start) >= new Date())
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .map((event) => (
                  <spam key={event.id} className="appointment-item-next">
                    Cliente: <strong>{event.costumer} </strong>
                    <p style={{textAlign:'center'}}>{format(new Date(event.start), 'dd/MM/yyyy')}</p>
                    <p style={{textAlign:'right'}}>{format(new Date(event.start), ' HH:mm')} até {format(new Date(event.end), 'HH:mm')}</p>
                  </spam>
                ))}
            </div>
          )}

        </div>
      </section>
    </div>
    </Layout>
  );
};

export default Home;
