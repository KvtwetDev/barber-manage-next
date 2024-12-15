import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { fetchClients, addClient, updateClient, deleteClient } from '../src/functions/firestoreFunction';
import './css/Layout.css';
import './css/Costumers.css';
import Layout from './layout';

Modal.setAppElement('#root');

export default function Costumers() {
    const [clients, setClients] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState({ id: null, name: '', email: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [sortBy, setSortBy] = useState('name'); // Estado para controlar a ordenação (por nome ou data)

    useEffect(() => {
        const loadClients = async () => {
            try {
                const fetchedClients = await fetchClients();
                const sortedClients = sortClients(fetchedClients, sortBy);
                setClients(sortedClients);
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            }
        };
        loadClients();
    }, [sortBy]);

    const sortClients = (clients, criteria) => {
        if (criteria === 'name') {
            return clients.sort((a, b) => a.name.localeCompare(b.name));
        } else if (criteria === 'date') {
            return clients.sort((a, b) => b.createdAt - a.createdAt);
        }
        return clients;
    };

    const handleOpenModal = (client = { id: null, name: '', email: '', phone: '' }) => {
        setCurrentClient(client);
        setErrors({});
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setCurrentClient({ id: null, name: '', email: '', phone: '' });
        setErrors({});
    };

    const validateFields = () => {
        const newErrors = {};
        if (!currentClient.name.trim()) newErrors.name = 'O nome é obrigatório.';
        if (!currentClient.email.trim()) newErrors.email = 'O email é obrigatório.';
        if (!currentClient.phone.trim()) newErrors.phone = 'O telefone é obrigatório.';
        return newErrors;
    };

    const handleSaveClient = async (e) => {
        e.preventDefault();

        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        const clientData = {
            name: currentClient.name,
            email: currentClient.email,
            phone: currentClient.phone,
            createdAt: new Date().getTime()
        };

        try {
            if (currentClient.id) {
                await updateClient(currentClient.id, clientData);
            } else {
                await addClient(clientData);
            }
            handleCloseModal();
            const updatedClients = await fetchClients();
            setClients(updatedClients);
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
        }
    };

    const handleDeleteClient = async (id) => {
        try {
            await deleteClient(id);
            setClients(clients.filter((client) => client.id !== id));
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
        }
    };

    const handleSortByName = () => {
        setSortBy('name');
    };

    const handleSortByDate = () => {
        setSortBy('date');
    };

    return (
        <Layout>
        <div className="page">
            <div className="header">
                <h1>Clientes</h1>
                <p>Gerencie seus clientes cadastrados</p>
            </div>

            <button className="add-button" onClick={() => handleOpenModal()}>Adicionar Cliente</button>

            <div className="filter-buttons">
                <button
                    className={sortBy === 'name' ? "active" : ""}
                    onClick={handleSortByName}
                >
                    Ordenar por Nome
                </button>
                <button
                    className={sortBy === 'date' ? "active" : ""}
                    onClick={handleSortByDate}
                >
                    Ordenar por data
                </button>
            </div>

            {modalIsOpen && (
                <div className="modal">
                    <form onSubmit={handleSaveClient}>
                        <h2>{currentClient.id ? "Editar Cliente" : "Novo Cliente"}</h2>
                        <label>
                            Nome:
                            <input 
                                type="text" 
                                value={currentClient.name} 
                                onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })} 
                                required 
                            />
                        </label>
                        <label>
                            Email:
                            <input 
                                type="email" 
                                value={currentClient.email} 
                                onChange={(e) => setCurrentClient({ ...currentClient, email: e.target.value })} 
                                required 
                            />
                        </label>
                        <label>
                            Telefone:
                            <input 
                                type="text" 
                                value={currentClient.phone} 
                                onChange={(e) => setCurrentClient({ ...currentClient, phone: e.target.value })} 
                                required 
                            />
                        </label>
                        <div className="errors-container">
                            {Object.values(errors).map((error, index) => (
                                <div key={index} className="error">{error}</div>
                            ))}
                        </div>
                        <div className="custom-actions">
                            <button type="button" onClick={handleCloseModal}>Cancelar</button>
                            <button type="submit">{currentClient.id ? "Salvar Alterações" : "Adicionar"}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="content-client">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '45%'}}>Nome</th>
                            <th style={{ width: '20%'}}>Email</th>
                            <th>Telefone</th>
                            <th style={{ width: '180px', textAlign: 'center'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.id}>
                                <td>{client.name}</td>
                                <td>{client.email}</td>
                                <td>{client.phone}</td>
                                <td className='actions'>
                                    <button className="edit-button" onClick={() => handleOpenModal(client)}>Editar</button>
                                    <button className="delete-button" onClick={() => handleDeleteClient(client.id)}>Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </Layout>
    );
}
