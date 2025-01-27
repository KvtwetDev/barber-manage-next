import React, { useEffect, useState } from 'react';
import { addProduct, deleteProduct, fetchProducts, updateProduct } from '../src/functions/firestoreFunction';
import './css/Layout.css';
import './css/Stock.css';

export default function Stock() {
    const [products, setProducts] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "", price: "0", category: "Serviço", estoque: "" });
    const [currentProduct, setCurrentProduct] = useState(null);
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

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
        setFormData(product || { name: "", description: "", price: "0", category: "Serviço", estoque: ""  });
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setCurrentProduct(null);
        setFormData({ name: "", description: "", price: "0", category: "Serviço", estoque: ""  });
    };

    const formatPriceForDisplay = (price) => {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) return "R$ 0,00";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(parsedPrice);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: name === "price" ? value : value,
        }));
    };
    
    const handleToggleCategory = (selectedCategory) => {
        setFormData(prevState => ({
            ...prevState,
            category: selectedCategory,
            estoque: selectedCategory === "Produto" ? prevState.estoque : ""}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedData = { 
            ...formData, 
            price: parseFloat(formData.price.replace(",", ".")),
        };
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
            console.error('Erro ao excluir produto/serviço:', error);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = filter === 'Todos' || product.category === filter;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="page">
            <div className="header">
                <h1>Produtos e Serviços</h1>
                <p>Gerencie serviços disponíveis e os produtos</p>
            </div>

            <button className="add-button" onClick={() => handleOpenModal()} aria-label="Adicionar Produto/Serviço">Adicionar Produto/Serviço</button>

            <div className="filter-buttons">
                
                <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Pesquisar por nome..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Pesquisar produtos e serviços"
                />
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
                            <th style={{ width: '20vw' }}>Descrição</th>
                            <th>Estoque</th>
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
                                <td>{product.category === "Produto" ? product.estoque : "N/A"}</td>
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
                            <input type="text" name="price" value={String(formData.price).replace(".", ",")} onChange={handleInputChange} required />
                        </label>
                        {formData.category === "Produto" && (
                            <label>
                                Estoque:
                                <input type="number" name="estoque" value={formData.estoque} onChange={handleInputChange} required />
                            </label>
                        )}
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
    );
}
