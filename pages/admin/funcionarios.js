import React, { useState, useEffect } from 'react';
import Layout from '../layout';
import { db, collection, getDocs, addDoc, deleteDoc, doc } from '../../src/functions/firebaseConfig';
import '../css/Admin.css';

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    const fetchFuncionarios = async () => {
      // Usando a nova sintaxe modular
      const funcionariosRef = collection(db, 'funcionarios');
      const snapshot = await getDocs(funcionariosRef);
      const funcionariosList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFuncionarios(funcionariosList);
    };
    fetchFuncionarios();
  }, []);

  const handleOpenModal = (funcionario = { id: null, nome: '', cargo:''}) => {
    setFuncionarios(funcionario);
    setErrors({});
    setModalIsOpen(true);
};

const handleCloseModal = () => {
    setModalIsOpen(false);
    setFuncionarios({ id: null, nome: '', cargo:''});
    setErrors({});
};

  const addFuncionario = async (e) => {
    e.preventDefault();
    if (nome && cargo) {
      // Usando a nova sintaxe modular para adicionar documentos
      await addDoc(collection(db, 'funcionarios'), {
        nome,
        cargo
      });
      setNome('');
      setCargo('');
      const snapshot = await getDocs(collection(db, 'funcionarios'));
      const funcionariosList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFuncionarios(funcionariosList);
    }
  };

  const handleDeleteFuncionario = async (id) => {
    try {
      const funcionarioRef = doc(db, 'funcionarios', id);
      await deleteDoc(funcionarioRef);
      const querySnapshot = await getDocs(collection(db, 'funcionarios'));
      const funcionariosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFuncionarios(funcionariosList);
    } catch (error) {
      console.error("Erro ao excluir funcionário: ", error);
    }
  };

  return (
    <Layout>
      <div className="funcionarios-container">
        <h1>Gerenciamento de Funcionários</h1>
        <form onSubmit={addFuncionario}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <select value={cargo}
                  onChange={(e) => setCargo(e.target.value)}>
            <option value="">Selecione o cargo</option>
            <option value="Atendente">Funcionário</option>
            <option value="Barbeiro">Barbeiro</option>
            <option value="Gerente">Gerente</option>
            <option value="Administrador">Administrador</option>
          </select>
          <button type="submit">Adicionar Funcionário</button>
        </form>

        <div className="content-funcionarios">

          <table>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Nome</th>
                <th style={{ width: '20%' }}>Cargo</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td>{funcionario.nome}</td>
                  <td>{funcionario.cargo.charAt(0).toUpperCase() + funcionario.cargo.slice(1).toLowerCase()}</td>
                  <td className="actions" style={{ textAlign: 'center' }}>
                    <button className="edit-button" onClick={() => handleOpenModal(funcionario)}>
                      Editar
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteFuncionario(funcionario.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
              {modalIsOpen && (
                      <div className="modal">
                          <form onSubmit={addFuncionario}>
                              <h2>{funcionarios.id ? "Editar Funcionário" : "Novo Funcionário"}</h2>
                              <label>
                                  Nome:
                                  <input 
                                      type="text" 
                                      value={funcionarios.nome} 
                                      onChange={(e) => setFuncionarios({ ...funcionarios, name: e.target.value })} 
                                      required 
                                  />
                              </label>
                              <label>
                                  Cargo:
                                  <input 
                                      type="text" 
                                      value={funcionarios.cargo} 
                                      onChange={(e) => setFuncionarios({ ...funcionarios, cargo: e.target.value })} 
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
                                  <button type="submit">{funcionarios.id ? "Salvar Alterações" : "Adicionar"}</button>
                              </div>
                          </form>
                      </div>
                  )}
      </div>
    </Layout>
  );
};

export default Funcionarios;
