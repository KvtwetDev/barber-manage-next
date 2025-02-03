import React, { useEffect, useState } from "react";
import Layout from "./layout";
import { db } from '../src/functions/firebaseConfig';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import "./css/Settings.css";

const Configuracoes = () => {
  const [empresa, setEmpresa] = useState({
    nome: "",
    cnpj: "",
    tipo: "salão de beleza", // Novo campo para selecionar o tipo de empresa
  });

  // Carregar os dados salvos no localStorage ao abrir a página
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("empresa"));
    if (savedData) {
      setEmpresa(savedData);
    }
  }, []);

  // Atualizar o localStorage sempre que os dados mudarem
  useEffect(() => {
    localStorage.setItem("empresa", JSON.stringify(empresa));
  }, [empresa]);

  // Função para formatar o CNPJ automaticamente
  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, "") // Remove tudo que não for número
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18); // Limita o tamanho máximo
  };

  // Função para atualizar os campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({
      ...prev,
      [name]: name === "cnpj" ? formatCNPJ(value) : value,
    }));
  };

  // Função para salvar os dados e criar a subcoleção no Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Verifica se o documento da empresa já existe na coleção do tipo selecionado
      const tipoColecaoRef = collection(db, empresa.tipo.toLowerCase());
      const empresaDocRef = doc(tipoColecaoRef, empresa.nome); // Nome da empresa será o documento

      const empresaDoc = await getDoc(empresaDocRef);

      if (empresaDoc.exists()) {
        alert("Esta empresa já existe na categoria selecionada!");
      } else {
        // Se a empresa não existir, cria o documento na coleção correta (salão de beleza ou barbearia)
        await setDoc(empresaDocRef, {}); // Cria o documento vazio

        // Criar a subcoleção 'dados' e salvar diretamente os dados
        const dadosRef = collection(empresaDocRef, "dados"); // Cria a subcoleção 'dados' dentro do documento da empresa
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
