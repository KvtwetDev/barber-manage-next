import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { fetchEmployees, addEmployee, updateEmployee, deleteEmployee } from '../src/functions/firestoreFunction';
import './css/Layout.css';
import './css/Employees.css';
import Layout from './layout';

Modal.setAppElement('#root');

export default function Admin() {
    const [employees, setEmployees] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState({ id: null, name: '', email: '', role: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const fetchedEmployees = await fetchEmployees();
                setEmployees(fetchedEmployees);
            } catch (error) {
                console.error('Erro ao buscar funcionários:', error);
            }
        };
        loadEmployees();
    }, []);

    const handleOpenModal = (employee = { id: null, name: '', email: '', role: '' }) => {
        setCurrentEmployee(employee);
        setErrors({});
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setCurrentEmployee({ id: null, name: '', email: '', role: '' });
        setErrors({});
    };

    const validateFields = () => {
        const newErrors = {};
        if (!currentEmployee.name.trim()) newErrors.name = 'O nome é obrigatório.';
        if (!currentEmployee.email.trim()) newErrors.email = 'O email é obrigatório.';
        if (!currentEmployee.role.trim()) newErrors.role = 'O nível de acesso é obrigatório.';
        return newErrors;
    };

    const handleSaveEmployee = async (e) => {
        e.preventDefault();

        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const employeeData = {
            name: currentEmployee.name,
            email: currentEmployee.email,
            role: currentEmployee.role,
            createdAt: new Date().getTime()
        };

        try {
            if (currentEmployee.id) {
                await updateEmployee(currentEmployee.id, employeeData);
            } else {
                await addEmployee(employeeData);
            }
            handleCloseModal();
            const updatedEmployees = await fetchEmployees();
            setEmployees(updatedEmployees);
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
        }
    };

    const handleDeleteEmployee = async (id) => {
        try {
            await deleteEmployee(id);
            setEmployees(employees.filter((employee) => employee.id !== id));
        } catch (error) {
            console.error('Erro ao excluir funcionário:', error);
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'super-admin':
                return 'Super Administrador';
            case 'admin':
                return 'Administrador';
            case 'employee':
                return 'Funcionário';
            default:
                return '';
        }
    };

    return (
        <Layout>
            <div className="page">
            <div className="header">
                <h1>Funcionários</h1>
                <p>Gerencie os funcionários e níveis de acesso</p>
            </div>

            <button className="add-button" onClick={() => handleOpenModal()}>Adicionar Funcionário</button>

            {modalIsOpen && (
                <div className="modal">
                    <form onSubmit={handleSaveEmployee}>
                        <h2>{currentEmployee.id ? "Editar Funcionário" : "Novo Funcionário"}</h2>
                        <label>
                            Nome:
                            <input 
                                type="text" 
                                value={currentEmployee.name} 
                                onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })} 
                                required 
                            />
                        </label>
                        <label>
                            Email:
                            <input 
                                type="email" 
                                value={currentEmployee.email} 
                                onChange={(e) => setCurrentEmployee({ ...currentEmployee, email: e.target.value })} 
                                required 
                            />
                        </label>
                        <label>
                            Nível de Acesso:
                            <select 
                                value={currentEmployee.role} 
                                onChange={(e) => setCurrentEmployee({ ...currentEmployee, role: e.target.value })}
                                required
                            >
                                <option value="">Selecione</option>
                                <option value="super-admin">Super Administrador</option>
                                <option value="admin">Administrador</option>
                                <option value="employee">Funcionário</option>
                            </select>
                        </label>
                        <div className="errors-container">
                            {Object.values(errors).map((error, index) => (
                                <div key={index} className="error">{error}</div>
                            ))}
                        </div>
                        <div className="actions">
                            <button type="button" onClick={handleCloseModal}>Cancelar</button>
                            <button type="submit">{currentEmployee.id ? "Salvar Alterações" : "Adicionar"}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="content-employee">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '30%' }}>Nome</th>
                            <th style={{ width: '30%' }}>Email</th>
                            <th>Level</th>
                            <th style={{ width: '180px', textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                <td>{employee.name}</td>
                                <td>{employee.email}</td>
                                <td>{getRoleLabel(employee.role)}</td>
                                <td className='actions'>
                                    <button className="edit-button" onClick={() => handleOpenModal(employee)}>Editar</button>
                                    <button className="delete-button" onClick={() => handleDeleteEmployee(employee.id)}>Excluir</button>
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
