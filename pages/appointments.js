import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import Select from 'react-select';
import { format } from 'date-fns';

import { saveAppointment, fetchAppointments, fetchClients } from '../src/functions/firestoreFunction';

import './css/Appointments.css';
import './css/Layout.css';
import Layout from './layout'


const SchedulerCalendar = () => {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', costumer: '' });
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('#__next'); // Garantir que só seja chamado no lado do cliente
    }

    const loadAppointments = async () => {
      try {
        const appointments = await fetchAppointments();
        setEvents(appointments);

        const clientsData = await fetchClients();
        const formattedClients = clientsData.map((client) => ({
          value: client.name,
          label: client.name,
        }));
        setClients(formattedClients);
      } catch (error) {
        console.log('Erro ao carregar agendamentos', error);
      }
    };
    loadAppointments();
  }, []);

  const handleOpenModal = (appointment = { start: '', end: '', costumer: '' }) => {
    setNewEvent(appointment);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setNewEvent({ start: '', end: '', costumer: '' });
  };

  const handleSaveAppointment = async () => {
    if (!newEvent.start || !newEvent.end || !newEvent.costumer) {
      alert('Preencha todos os campos antes de salvar.');
      return;
    }
    try {
      const title = newEvent.costumer;
      const appointment = {
        title: title,
        start: newEvent.start,
        end: newEvent.end,
        costumer: newEvent.costumer,
      };
      
      const id = await saveAppointment(appointment);
      setEvents((preEvents) => [...preEvents, { id, ...appointment }]);
      setNewEvent({ start: '', end: '', costumer: '' });
      alert('Agendamento salvo com sucesso!');
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
              </label>
              <label>
                Fim:
              </label>
            </div>
            <div className="input-content">
              <Select
                className="select-client"
                options={clients}
                onChange={(selectedOption) =>
                  setNewEvent({ ...newEvent, costumer: selectedOption ? selectedOption.value : '' })
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
            </div>
          </form>
          <div className="modal-actions">
            <button onClick={handleCloseModal}>Cancelar</button>
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
              locale="pt-br"
              height="95%"
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
                      <strong>{event.costumer}</strong>
                      {format(new Date(event.start), 'dd/MM/yyyy')} <br />
                      {format(new Date(event.start), 'HH:mm ')} até
                      {format(new Date(event.end), ' HH:mm')}
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
