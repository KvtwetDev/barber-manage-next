import React, { useEffect, useState } from "react";
import Layout from "./layout";
import { db } from '../src/functions/firebaseConfig';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import "./css/Settings.css";

const Configuracoes = () => {
  const [empresa, setEmpresa] = useState({
    nome: "",
    cnpj: "",
    tipo: "salão de beleza",
  });


  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("empresa"));
    if (savedData) {
      setEmpresa(savedData);
    }
  }, []);


  useEffect(() => {
    localStorage.setItem("empresa", JSON.stringify(empresa));
  }, [empresa]);


  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, "") 
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18); 
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({
      ...prev,
      [name]: name === "cnpj" ? formatCNPJ(value) : value,
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      
      const tipoColecaoRef = collection(db, empresa.tipo.toLowerCase());
      const empresaDocRef = doc(tipoColecaoRef, empresa.nome); 

      const empresaDoc = await getDoc(empresaDocRef);

      if (empresaDoc.exists()) {
        alert("Esta empresa já existe na categoria selecionada!");
      } else {
        
        await setDoc(empresaDocRef, {}); 

       
        const dadosRef = collection(empresaDocRef, "dados"); 
        await setDoc(doc(dadosRef, "informacoes"), {
          nome: empresa.nome,
          cnpj: empresa.cnpj,
        });

        alert("Empresa criada com sucesso dentro da categoria!");
      }
    } catch (error) {
      console.error("Erro ao salvar dados e criar a coleção: ", error);
      alert("Erro ao salvar dados!");
    }
  };

  return (
    <Layout>
      <div className="config-container">
        <h1>Configurações</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Nome da Empresa:
            <input
              type="text"
              name="nome"
              value={empresa.nome}
              onChange={handleChange}
              placeholder="Digite o nome da empresa"
              required
            />
          </label>

          <label>
            CNPJ:
            <input
              type="text"
              name="cnpj"
              value={empresa.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              maxLength="18"
              required
            />
          </label>

          <label>
            Tipo de Empresa:
            <select
              name="tipo"
              value={empresa.tipo}
              onChange={handleChange}
              required
            >
              <option value="salão de beleza">Salão de Beleza</option>
              <option value="barbearia">Barbearia</option>
            </select>
          </label>

          <button type="submit">Salvar Configurações</button>
        </form>
      </div>
    </Layout>
  );
};

export default Configuracoes;
