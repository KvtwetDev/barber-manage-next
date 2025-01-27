import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const clientsCollection = collection(db, 'clients');

export const fetchClients = async () => {
    const snapshot = await getDocs(clientsCollection);
    const clientsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    return clientsList;
};
export const addClient = async (client) => {
    try {
        const docRef = await addDoc(clientsCollection, client);
        console.log('Cliente adicionado com ID: ', docRef.id);
    } catch (e) {
        console.error('Erro ao adicionar cliente: ', e);
    }
};

export const updateClient = async (id, updatedClient) => {
    try {
        const clientDoc = doc(db, 'clients', id);
        await updateDoc(clientDoc, updatedClient);
        console.log('Cliente atualizado com ID: ', id);
    } catch (e) {
        console.error('Erro ao atualizar cliente: ', e);
    }
};

export const deleteClient = async (id) => {
    try {
        const clientDoc = doc(db, 'clients', id);
        await deleteDoc(clientDoc);
        console.log('Cliente excluído com ID: ', id);
    } catch (e) {
        console.error('Erro ao excluir cliente: ', e);
    }
};

// Bloco de agendamentos
const appointmentsCollections = collection(db, 'appointments');

export const saveAppointment = async (appointment, id=null) => {
    try {
        if (id) {
            const docRef = doc(appointmentsCollections, id);
            await updateDoc(docRef, appointment);
        } else {
            const docRef = await addDoc(appointmentsCollections, appointment);
            return docRef.id;
        }

    }catch (error) {
        console.error('Erro ao salvar o agendamento', error);
        throw error;
    }
};

export const deleteAppointment = async (id) => {
    try {
        const appointmentRef = doc(db, 'appointments', id);
        await deleteDoc(appointmentRef);
        console.log('Agendamento deletado com sucesso');
    } catch (error) {
        alert('Erro ao deletar o agendamento:', error);
    }
};


export const fetchAppointments = async () => {
    const snapshot = await getDocs(appointmentsCollections);
    const appointment = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    return appointment;
}

// Bloco de Produtos e serviços
export const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
};

export const addProduct = async (product) => {
    await addDoc(collection(db, 'products'), product);
};

export const updateProduct = async (id, updateProduct) => {
    await updateDoc(doc(db, 'products', id), updateProduct);
};

export const deleteProduct = async (id) => {
    try {
        const productRef = doc(db, "products", id); // Certifique-se de que "products" é o nome correto da sua coleção
        await deleteDoc(productRef);
        console.log(`Produto com ID ${id} foi excluído com sucesso.`);
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        throw error; // Repassa o erro para a função que chamou
    }
};

// Bloco de funcionários
export const fetchEmployees = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'funcionarios'));
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        throw error;
    }
};

export const addEmployee = async (employeeData) => {
    try {
        const docRef = await addDoc(collection(db, 'employees'), employeeData);
        return docRef.id;
    } catch (error) {
        console.error('Erro ao adicionar funcionário:', error);
        throw error;
    }
};

export const updateEmployee = async (id, employeeData) => {
    try {
        const employeeRef = doc(db, 'employees', id);
        await updateDoc(employeeRef, employeeData);
    } catch (error) {
        console.error('Erro ao atualizar funcionário:', error);
        throw error;
    }
};

export const deleteEmployee = async (id) => {
    try {
        const employeeRef = doc(db, 'employees', id);
        await deleteDoc(employeeRef);
    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);
        throw error;
    }
};

// Bloco de vendas
const salesCollection = collection(db, 'sales');

export const saveSales = async (sale) => {
    try {
        const docRef = await addDoc(salesCollection, sale);
        console.log('Venda salva com ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.log('Erro ao salvar venda:', error);
        throw error;
    }
};

export const fetchSales = async () => {
    const snapshot = await getDocs(salesCollection);
    const sales = snapshot.docs.map((doc) => ( {id: doc.id, ...doc.data()} ));
    const totalSales = sales.reduce((total, sale) => {
        const itemTotal = sale.items.reduce((sum, item) => sum + (item.price || 0), 0);
        return total + itemTotal
    }, 0);

    return {sales, totalSales}
};