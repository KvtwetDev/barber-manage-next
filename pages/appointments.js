import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import Select from 'react-select';
import { format } from 'date-fns';

import { saveAppointment, fetchAppointments, fetchClients, deleteAppointment, fetchProducts } from '../src/functions/firestoreFunction';

import './css/Appointments.css';
import './css/Layout.css';
import Layout from './layout'


const SchedulerCalendar = () => {
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState([]);
  const [clients, setClients] = useState([]);
  const [newEvent, setNewEvent] = useState({ start: '', end: '', costumer: '', cpf: '', service: ''});
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('#__next');
    }

    const loadAppointmentsAndProducts = async () => {
      try {
        const appointments = await fetchAppointments();
        const mappedAppointments = appointments.map((appointment) => ({
          ...appointment,
          title: appointment.costumer,
        }));

        setEvents(mappedAppointments);

        const clientsData = await fetchClients();
        const formattedClients = clientsData.map((client) => ({
          value: client.name,
          label: client.name,
          cpf: client.cpf
        }));
        setClients(formattedClients);

        const productsData = await fetchProducts();
        const filteredServices = productsData
          .filter((product) => product.category == 'Serviço')
          .map((product) => ({
            value: product.name,
            label: `${product.name} - R$ ${product.price.toFixed(2)}`,
            price: product.price,
          }));

          setServices(filteredServices);

      } catch (error) {
        console.log('Erro ao carregar dados', error);
      }
    };
    loadAppointmentsAndProducts();
  }, []);

  const handleOpenModal = (appointment = { start: '', end: '', costumer: '', id: '' }) => {
    setNewEvent(appointment);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setNewEvent({ start: '', end: '', costumer: '' });
  };

  const handleDeleteAppointment = async (appointment) => {
    try {
      await deleteAppointment(appointment);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== appointment.id));
      alert('Agendamento deletado com sucesso.');
    }catch (error){
      console.log('Erro ao deletar:', error);
    }
  };

  const handleSaveAppointment = async () => {
    if (!newEvent.start || !newEvent.end || !newEvent.costumer || !newEvent.service) {
      alert('Preencha todos os campos antes de salvar.');
      return;
    }
    try {
      const selectedService = services.find((service) => service.value === newEvent.service);
      const appointment = {
        start: newEvent.start,
        end: newEvent.end,
        costumer: newEvent.costumer,
        cpf: newEvent.cpf,
        service: newEvent.service
      };

      if (newEvent.id) {
        await saveAppointment(appointment, newEvent.id);
        
        setEvents((preEvents) => 
          preEvents.map((event) =>
            event.id === newEvent.id ? { ...event, ...appointment } : event
          )
        );
        alert('Agendamento atualizado com sucesso.');
      } else {
        const id = await saveAppointment(appointment);
        setEvents((preEvents) => [...preEvents, {id, ... appointment}]);
        alert('Agendamento salvo com sucesso');
      }

      if (selectedService) {
        setServiceDetails((prevDetails) => [
          ...prevDetails,
          {
            name: selectedService.value,
            price: selectedService.price,
          },
        ]);
      }
      handleCloseModal();
    } catch (error) {
      console.log('Erro ao salvar o agendamento', error);
    }
  };

  const handleDateClick = (info) => {
    alert(`Data clicada: ${info.dateStr}`);
  };

  return (
    <Layout>
      <div className="page" id="root">
        <div className="header">
          <h1>Agendamentos</h1>
          <p>Gerencie seus horários e compromissos</p>
        </div>
        <button className="add-button" onClick={() => handleOpenModal()}>Agendar</button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleCloseModal}
          className="custom-modal"
          contentLabel="Novo Agendamento"
        >
          <h2>{newEvent.id ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          <form>
            <div className="label-content">
              <label>
                Cliente:
              </label>
              <label>
                Início:
              </label>clients
              <label>
                Fim:
              </label>
              <label>
                Serviço Primário
              </label>
            </div>
            <div className="input-content">
              <Select
                className="select-client"
                options={clients}
                onChange={(selectedOption) =>
                  setNewEvent({ ...newEvent, costumer: selectedOption ? selectedOption.value : '', cpf: selectedOption ? selectedOption.cpf : '' })
                }
                isClearable
                placeholder="Selecione ou digite um cliente..."
                value={
                  newEvent.costumer
                    ? { value: newEvent.costumer, label: newEvent.costumer }
                    : null
                }
                noOptionsMessage={() => 'Nenhum cliente encontrado'}
              />
              <input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              />
              <input
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              />
              <Select
                className="select-services"
                options={services}
                onChange={(selectedOption) =>
                  setNewEvent({
                    ...newEvent,
                    service: selectedOption ? { name: selectedOption.value, price: selectedOption.price } : ''
                  })
                }
                isClearable
                placeholder="Selecione ou digite um serviço..."
                value={
                  newEvent.service
                    ? {
                        value: newEvent.service.name,
                        label: `${newEvent.service.name} - R$ ${newEvent.service.price.toFixed(2)}`
                      }
                    : null
                }
                noOptionsMessage={() => 'Nenhum serviço encontrado'}
              />
            </div>
          </form>
          <div className="modal-actions">
            <button onClick={handleCloseModal}>Cancelar</button>
            <button onClick={() => handleDeleteAppointment(newEvent)}>Deletar</button>
            <button onClick={handleSaveAppointment}>{newEvent.id ? 'Salvar Alterações' : 'Adicionar'}</button>
          </div>
        </Modal>

        <div className="apointment-content">
          <div className="fullcalendar">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              eventContent={(eventInfo) => (
                <div style={{ fontSize:'10px'}}>
                  <span>{eventInfo.event.title}</span>
                </div>
              )}
              locale="pt-br"
              height="90%"
              button
            />
          </div>

          <div className="next-appointment">
            <h2>Próximos agendamentos</h2>
            {events.length !== 0 ? (
              <ul>
                {events
                  .filter((event) => new Date(event.start) >= new Date())
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((event) => (
                    <li key={event.id} className="appointment-item">
                      <div>
                      <strong>{event.costumer}</strong>
                        {format(new Date(event.start), 'dd/MM/yyyy')} <br />
                        {format(new Date(event.start), 'HH:mm ')} até
                        {format(new Date(event.end), ' HH:mm')}
                      </div>
                      <button onClick={() => handleOpenModal(event)}>Editar</button>
                    </li>
                  ))}
              </ul>
                ) : (
                  <p>Sem agendamentos</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
  
};


export default SchedulerCalendar;
