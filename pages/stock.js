import React, { useEffect, useState } from 'react';
import { addProduct, deleteProduct, fetchProducts, updateProduct } from '../src/functions/firestoreFunction';
import './css/Layout.css';
import './css/Stock.css';
import Layout from './layout';

export default function Stock() {
    const [products, setProducts] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "", price: "", category: "Serviço" });
    const [currentProduct, setCurrentProduct] = useState(null);
    const [filter, setFilter] = useState('Todos');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const productsList = await fetchProducts();
                setProducts(productsList);
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            }
        };
        loadProducts();
    }, []);

    const handleOpenModal = (product = null) => {
        setCurrentProduct(product);
        setFormData(product || { name: "", description: "", price: "", category: "Serviço" });
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setCurrentProduct(null);
        setFormData({ name: "", description: "", price: "", category: "Serviço" });
    };

    const formatPriceForDisplay = (price) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: name === "price" ? formatCurrency(value) : value
        }));
    };

    const formatCurrency = (value) => {
        return Number(value.replace(/[^\d]/g, "")) / 100;
    };

    const handleToggleCategory = (selectedCategory) => {
        setFormData(prevState => ({ ...prevState, category: selectedCategory }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedData = { ...formData, price: formatCurrency(formData.price) };
        try {
            if (currentProduct) {
                await updateProduct(currentProduct.id, formattedData);
            } else {
                await addProduct(formattedData);
            }
            const updatedProducts = await fetchProducts();
            setProducts(updatedProducts);
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao salvar produto/serviço:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            const updatedProducts = await fetchProducts();
            setProducts(updatedProducts);
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
        }
    };

    const filteredProducts = products.filter(product => filter === 'Todos' || product.category === filter);

    return (
        <Layout>
            <div className="page">
                <div className="header">
                    <h1>Produtos e Serviços</h1>
                    <p>Gerencie serviços disponíveis e os produtos</p>
                </div>
                <button className="add-button" onClick={() => handleOpenModal()} aria-label="Adicionar Produto/Serviço">Adicionar Produto/Serviço</button>
                <div className="filter-buttons">
                    <button
                        className={filter === "Todos" ? "active" : ""}
                        onClick={() => setFilter("Todos")}
                        aria-label="Filtrar todos"
                    >
                        Todos
                    </button>
                    <button
                        className={filter === "Serviço" ? "active" : ""}
                        onClick={() => setFilter("Serviço")}
                        aria-label="Filtrar serviços"
                    >
                        Serviços
                    </button>
                    <button
                        className={filter === "Produto" ? "active" : ""}
                        onClick={() => setFilter("Produto")}
                        aria-label="Filtrar produtos"
                    >
                        Produtos
                    </button>
                </div>
                <div className="content-product">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '15vw' }}>Nome</th>
                                <th>Tipo</th>
                                <th style={{ width: '30vw' }}>Descrição</th>
                                <th>Preço</th>
                                <th style={{ width: '180px', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.description}</td>
                                    <td>{formatPriceForDisplay(product.price)}</td>
                                    <td className="actions">
                                        <button onClick={() => handleOpenModal(product)} aria-label="Editar Produto/Serviço">Editar</button>
                                        <button onClick={() => handleDelete(product.id)} aria-label="Excluir Produto/Serviço">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {modalIsOpen && (
                    <div className="modal">
                        <form onSubmit={handleSubmit}>
                            <h2>{currentProduct ? "Editar Produto/Serviço" : "Adicionar Produto/Serviço"}</h2>
                            <label>
                                Nome:
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            </label>
                            <label>
                                Descrição:
                                <textarea name="description" value={formData.description} onChange={handleInputChange} required />
                            </label>
                            <label>
                                Preço:
                                <input type="text" name="price" value={formData.price} onChange={handleInputChange} required />
                            </label>
                            <div className="category-toggle">
                                <label>Categoria:</label>
                                <div className="toggle-buttons">
                                    <button
                                        type="button"
                                        className={formData.category === "Serviço" ? "active" : ""}
                                        onClick={() => handleToggleCategory("Serviço")}
                                    >
                                        Serviço
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.category === "Produto" ? "active" : ""}
                                        onClick={() => handleToggleCategory("Produto")}
                                    >
                                        Produto
                                    </button>
                                </div>
                            </div>
                            <div className="custom-actions">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={handleCloseModal}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
}
