import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDocs, onSnapshot, query, where, updateDoc, deleteDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { Search, Plus, Trash2, CheckCircle, Languages, X, Clipboard, MessageSquareText, Download, History, DollarSign, Package, PackageCheck, Send, MessageCircle, Droplet } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyDVKV-fYokK-4KjZLAHg9Hls-oTQsZM7b8",
    authDomain: "dhobhighat-order-5ef46.firebaseapp.com",
    projectId: "dhobhighat-order-5ef46",
    storageBucket: "dhobhighat-order-5ef46.firebasestorage.app",
    messagingSenderId: "444151228655",
    appId: "1:444151228655:web:0f0096031e942a6d56d31a",
    measurementId: "G-ESD5VNCD8J"
};

// --- Translation Dictionary ---
const translations = {
    en: {
        title: "Dhobighat Laundry Tracker",
        incoming: "Incoming",
        delivered: "Delivered",
        newOrder: "New Order",
        clientName: "Client Name",
        clientNumber: "Client Number",
        items: "Items",
        quantity: "Qty",
        category: "Category",
        add: "Add",
        saveOrder: "Save Order",
        dry_clean: "Dry Clean",
        ironing: "Ironing",
        shoes: "Shoes",
        curtains: "Curtains",
        bedsheets: "Bedsheets",
        markAsDelivered: "Mark as Delivered",
        delete: "Delete",
        searchClient: "Search by name or number...",
        noIncoming: "No incoming orders.",
        noDelivered: "No delivered orders found.",
        selectClient: "Select or Create Client",
        addNewItem: "Add New Item",
        orderDate: "Order Date",
        deliveredDate: "Delivered Date",
        areYouSure: "Are you sure?",
        confirmDelete: "Do you really want to delete this order? This action cannot be undone.",
        cancel: "Cancel",
        confirm: "Confirm",
        userId: "Your User ID (Share with staff)",
        generateMessage: "Generate Delivery Message",
        deliveryMessage: "Delivery Message",
        copy: "Copy",
        copied: "Copied!",
        generating: "Generating...",
        exportClients: "Export Clients",
        exportOrders: "Export Orders",
        notes: "Notes",
        addNotesPlaceholder: "Add special instructions or notes here...",
        paymentStatus: "Payment Status",
        paid: "Paid",
        unpaid: "Unpaid",
        markAsPaid: "Mark as Paid",
        markAsUnpaid: "Mark as Unpaid",
        invoice: "Invoice",
        dashboard: "Dashboard",
        totalIncoming: "Total Incoming",
        totalDelivered: "Total Delivered",
        totalPaid: "Total Paid Orders",
        totalUnpaid: "Total Unpaid Orders",
        viewHistory: "View History",
        clientHistory: "Client History",
        noHistory: "No order history found for this client.",
        sendSMS: "Send SMS",
        sendWhatsApp: "Send via WhatsApp",
        stainAdvisor: "Stain Advisor",
        stainType: "Stain Type (e.g., Coffee, Ink)",
        fabricType: "Fabric Type (e.g., Cotton, Silk)",
        getAdvice: "Get Advice",
        stainRemovalAdvice: "Stain Removal Advice",
    },
    hi: {
        title: "धोबीघाट लॉन्ड्री ट्रैकर",
        incoming: "आने वाले",
        delivered: "पहुंचा दिया",
        newOrder: "नया ऑर्डर",
        clientName: "ग्राहक का नाम",
        clientNumber: "ग्राहक नंबर",
        items: "आइटम",
        quantity: "मात्रा",
        category: "श्रेणी",
        add: "जोड़ें",
        saveOrder: "ऑर्डर सहेजें",
        dry_clean: "ड्राई क्लीन",
        ironing: "इस्त्री",
        shoes: "जूते",
        curtains: "पर्दे",
        bedsheets: "चादरें",
        markAsDelivered: "डिलीवर के रूप में चिह्नित करें",
        delete: "हटाएं",
        searchClient: "नाम या नंबर से खोजें...",
        noIncoming: "कोई आने वाले ऑर्डर नहीं।",
        noDelivered: "कोई डिलीवर किया गया ऑर्डर नहीं मिला।",
        selectClient: "ग्राहक चुनें या बनाएं",
        addNewItem: "नया आइटम जोड़ें",
        orderDate: "ऑर्डर की तारीख",
        deliveredDate: "डिलीवरी की तारीख",
        areYouSure: "क्या आप निश्चित हैं?",
        confirmDelete: "क्या आप वाकई इस ऑर्डर को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
        cancel: "रद्द करें",
        confirm: "पुष्टि करें",
        userId: "आपकी यूजर आईडी (कर्मचारियों के साथ साझा करें)",
        generateMessage: "डिलीवरी संदेश उत्पन्न करें",
        deliveryMessage: "डिलीवरी संदेश",
        copy: "कॉपी",
        copied: "कॉपी किया गया!",
        generating: "बनाया जा रहा है...",
        exportClients: "ग्राहक निर्यात करें",
        exportOrders: "ऑर्डर निर्यात करें",
        notes: "नोट्स",
        addNotesPlaceholder: "यहां विशेष निर्देश या नोट्स जोड़ें...",
        paymentStatus: "भुगतान की स्थिति",
        paid: "भुगतान किया गया",
        unpaid: "अवैतनिक",
        markAsPaid: "भुगतान के रूप में चिह्नित करें",
        markAsUnpaid: "अवैतनिक के रूप में चिह्नित करें",
        invoice: "इनवॉइस",
        dashboard: "डैशबोर्ड",
        totalIncoming: "कुल आने वाले",
        totalDelivered: "कुल वितरित",
        totalPaid: "कुल भुगतान किए गए ऑर्डर",
        totalUnpaid: "कुल अवैतनिक ऑर्डर",
        viewHistory: "इतिहास देखें",
        clientHistory: "ग्राहक इतिहास",
        noHistory: "इस क्लाइंट के लिए कोई ऑर्डर इतिहास नहीं मिला।",
        sendSMS: "एसएमएस भेजें",
        sendWhatsApp: "व्हाट्सएप पर भेजें",
        stainAdvisor: "दाग सलाहकार",
        stainType: "दाग का प्रकार (जैसे, कॉफी, स्याही)",
        fabricType: "कपड़े का प्रकार (जैसे, कपास, रेशम)",
        getAdvice: "सलाह लें",
        stainRemovalAdvice: "दाग हटाने की सलाह",
    }
};

const appId = 'dhobhighat-app-default';

// --- Main App Component ---
export default function App() {
    const [lang, setLang] = useState('en');
    const t = useMemo(() => translations[lang], [lang]);

    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const [activeTab, setActiveTab] = useState('incoming');
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isStainModalOpen, setIsStainModalOpen] = useState(false);

    const [orderToDelete, setOrderToDelete] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [orderForMessage, setOrderForMessage] = useState(null);
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Firebase Initialization ---
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            setDb(firestore);

            onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    try {
                       await signInAnonymously(authInstance);
                    } catch (error) { console.error("Authentication failed:", error); }
                }
                setIsAuthReady(true);
            });
        } catch (error) { console.error("Firebase initialization error:", error); }
    }, []);

    // --- Data Fetching ---
    useEffect(() => {
        if (!isAuthReady || !db) return;
        const ordersCollectionPath = `artifacts/${appId}/public/data/orders`;
        const qOrders = query(collection(db, ordersCollectionPath));
        const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(ordersData);
        }, (error) => console.error("Error fetching orders:", error));

        const clientsCollectionPath = `artifacts/${appId}/public/data/clients`;
        const qClients = query(collection(db, clientsCollectionPath));
        const unsubscribeClients = onSnapshot(qClients, (snapshot) => {
            const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClients(clientsData);
        }, (error) => console.error("Error fetching clients:", error));

        return () => {
            unsubscribeOrders();
            unsubscribeClients();
        };
    }, [isAuthReady, db]);
    
    const toggleLanguage = () => setLang(currentLang => currentLang === 'en' ? 'hi' : 'en');

    const handleMarkAsDelivered = async (orderId) => {
        if (!db) return;
        const orderRef = doc(db, `artifacts/${appId}/public/data/orders`, orderId);
        try { await updateDoc(orderRef, { status: 'delivered', deliveredAt: serverTimestamp() }); } 
        catch (error) { console.error("Error updating order:", error); }
    };
    
    const handleTogglePayment = async (orderId, currentStatus) => {
        if (!db) return;
        const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
        const orderRef = doc(db, `artifacts/${appId}/public/data/orders`, orderId);
        try { await updateDoc(orderRef, { paymentStatus: newStatus }); }
        catch (error) { console.error("Error updating payment status:", error); }
    }

    const handleDeleteClick = (orderId) => {
        setOrderToDelete(orderId);
        setIsConfirmModalOpen(true);
    };
    
    const confirmDeleteOrder = async () => {
        if (!db || !orderToDelete) return;
        const orderRef = doc(db, `artifacts/${appId}/public/data/orders`, orderToDelete);
        try { await deleteDoc(orderRef); } 
        catch(error) { console.error("Error deleting order: ", error); } 
        finally {
            setIsConfirmModalOpen(false);
            setOrderToDelete(null);
        }
    };

    const callGeminiAPI = async (prompt) => {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                return "Sorry, couldn't get a response. Please try again.";
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            return "Error connecting to the AI service. Please check your connection.";
        }
    };

    const handleGenerateMessage = async (order) => {
        setOrderForMessage(order);
        setIsGenerating(true);
        setGeneratedMessage('');
        setIsMessageModalOpen(true);
        const itemList = order.items.map(item => `${item.quantity} ${t[item.category] || item.category}`).join(', ');
        const prompt = `Create a polite and friendly SMS message in Hinglish (Hindi using English letters) for a laundry service customer. Inform them their order is ready for delivery.
        - Customer Name: ${order.clientName}
        - Items: ${itemList}
        - Shop Name: Dhobighat
        Do not use any special characters or formatting. Just plain text.`;
        
        const message = await callGeminiAPI(prompt);
        setGeneratedMessage(message);
        setIsGenerating(false);
    };
    
    const handleViewHistory = (client) => {
        setSelectedClient(client);
        setIsHistoryModalOpen(true);
    };

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-GB');
    };

    const downloadCSV = (data, filename) => {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportClients = () => {
        if (clients.length === 0) { alert("No client data to export."); return; }
        const csvRows = [["Client Name", "Client Number"].join(','), ...clients.map(c => [`"${c.name.replace(/"/g, '""')}"`, `"${c.number}"`].join(','))];
        downloadCSV(csvRows.join('\r\n'), 'dhobhighat_clients.csv');
    };

    const handleExportAllOrders = () => {
        if (orders.length === 0) { alert("No order data to export."); return; }
        const csvRows = [
            ["Invoice #", "Client Name", "Client Number", "Status", "Payment Status", "Order Date", "Delivered Date", "Items", "Notes"].join(','),
            ...orders.sort((a,b) => a.invoiceNumber - b.invoiceNumber).map(order => {
                const itemsString = order.items.map(item => `${t[item.category] || item.category}: ${item.quantity}`).join(' | ');
                return [
                    `"${order.invoiceNumber || 'N/A'}"`, `"${order.clientName.replace(/"/g, '""')}"`, `"${order.clientNumber}"`,
                    `"${order.status}"`, `"${order.paymentStatus}"`, `"${formatDate(order.createdAt)}"`, `"${formatDate(order.deliveredAt)}"`,
                    `"${itemsString}"`, `"${(order.notes || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ];
        downloadCSV(csvRows.join('\r\n'), 'dhobhighat_all_orders.csv');
    };

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => order.status === activeTab)
            .sort((a, b) => (b.invoiceNumber || 0) - (a.invoiceNumber || 0));
    }, [orders, activeTab]);

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-black">
            <div className="bg-blue-400 text-white p-4 shadow-md sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
                    <button onClick={toggleLanguage} className="flex items-center gap-2 bg-white text-blue-500 font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-100 transition-colors">
                        <Languages size={20} />
                        <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
                    </button>
                </div>
            </div>
            
            <div className="container mx-auto p-4">
                {userId && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded-md" role="alert">
                        <p className="font-bold">{t.userId}</p>
                        <p className="text-sm break-all">{userId}</p>
                    </div>
                )}
                
                <Dashboard t={t} orders={orders} />

                <div className="flex justify-center my-6 border-b-2 border-gray-300">
                    <button onClick={() => setActiveTab('incoming')} className={`py-3 px-6 text-lg font-bold ${activeTab === 'incoming' ? 'border-b-4 border-blue-500 text-blue-600' : 'text-gray-500'}`}>{t.incoming}</button>
                    <button onClick={() => setActiveTab('delivered')} className={`py-3 px-6 text-lg font-bold ${activeTab === 'delivered' ? 'border-b-4 border-blue-500 text-blue-600' : 'text-gray-500'}`}>{t.delivered}</button>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105 flex items-center gap-2">
                        <Plus size={24}/>
                        {t.newOrder}
                    </button>
                    <div className="flex gap-4">
                         <button onClick={handleExportClients} className="bg-gray-600 text-white font-bold text-md py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 flex items-center gap-2">
                            <Download size={20}/>
                            {t.exportClients}
                        </button>
                         <button onClick={handleExportAllOrders} className="bg-teal-600 text-white font-bold text-md py-2 px-4 rounded-full shadow-lg hover:bg-teal-700 flex items-center gap-2">
                            <Download size={20}/>
                            {t.exportOrders}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <OrderCard key={order.id} order={order} t={t} onMarkDelivered={handleMarkAsDelivered} onTogglePayment={handleTogglePayment} onDelete={handleDeleteClick} onGenerateMessage={handleGenerateMessage} onViewHistory={handleViewHistory} onStainAdvice={() => setIsStainModalOpen(true)} />
                    )) : (
                        <p className="text-center text-gray-500 font-bold text-xl mt-10">{activeTab === 'incoming' ? t.noIncoming : t.noDelivered}</p>
                    )}
                </div>
            </div>
            
            {isModalOpen && <NewOrderModal db={db} clients={clients} t={t} onClose={() => setIsModalOpen(false)} />}
            {isConfirmModalOpen && <ConfirmDeleteModal t={t} onConfirm={confirmDeleteOrder} onClose={() => setIsConfirmModalOpen(false)} />}
            {isMessageModalOpen && <GeneratedMessageModal t={t} order={orderForMessage} message={generatedMessage} isLoading={isGenerating} onClose={() => setIsMessageModalOpen(false)} />}
            {isHistoryModalOpen && <ClientHistoryModal client={selectedClient} orders={orders} t={t} formatDate={formatDate} onClose={() => setIsHistoryModalOpen(false)} />}
            {isStainModalOpen && <StainAdvisorModal t={t} callGeminiAPI={callGeminiAPI} onClose={() => setIsStainModalOpen(false)} />}
        </div>
    );
}

// --- Dashboard Component ---
const Dashboard = ({ t, orders }) => {
    const stats = useMemo(() => {
        return {
            incoming: orders.filter(o => o.status === 'incoming').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            paid: orders.filter(o => o.paymentStatus === 'paid').length,
            unpaid: orders.filter(o => o.paymentStatus === 'unpaid').length,
        };
    }, [orders]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-bold text-center mb-4">{t.dashboard}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                    <Package className="mx-auto text-blue-500" size={32} />
                    <p className="text-2xl font-bold">{stats.incoming}</p>
                    <p className="text-sm text-gray-600">{t.totalIncoming}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                    <PackageCheck className="mx-auto text-green-500" size={32} />
                    <p className="text-2xl font-bold">{stats.delivered}</p>
                    <p className="text-sm text-gray-600">{t.totalDelivered}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="mx-auto text-green-500" size={32} />
                    <p className="text-2xl font-bold">{stats.paid}</p>
                    <p className="text-sm text-gray-600">{t.totalPaid}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                    <DollarSign className="mx-auto text-red-500" size={32} />
                    <p className="text-2xl font-bold">{stats.unpaid}</p>
                    <p className="text-sm text-gray-600">{t.totalUnpaid}</p>
                </div>
            </div>
        </div>
    );
};

// --- Order Card Component ---
const OrderCard = ({ order, t, onMarkDelivered, onTogglePayment, onDelete, onGenerateMessage, onViewHistory, onStainAdvice }) => {
    const isPaid = order.paymentStatus === 'paid';
    return (
        <div className="bg-white rounded-xl shadow-md p-5 border-l-8 border-blue-400">
            <div className="flex flex-col md:flex-row justify-between md:items-start mb-3">
                <div>
                    <p className="font-bold text-xl">{order.clientName}</p>
                    <p className="text-gray-600 text-md">{order.clientNumber}</p>
                    <p className="text-gray-800 font-bold text-lg mt-1">{t.invoice} #{order.invoiceNumber || 'N/A'}</p>
                </div>
                <div className="flex flex-col items-start md:items-end mt-2 md:mt-0">
                     <span className={`px-3 py-1 text-sm font-bold rounded-full text-white ${isPaid ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isPaid ? t.paid : t.unpaid}
                    </span>
                    <div className="text-sm text-gray-500 mt-2 text-left md:text-right">
                        <p><strong>{t.orderDate}:</strong> {new Date(order.createdAt?.seconds * 1000).toLocaleString(t.lang === 'hi' ? 'hi-IN' : 'en-GB')}</p>
                        {order.status === 'delivered' && <p><strong>{t.deliveredDate}:</strong> {new Date(order.deliveredAt?.seconds * 1000).toLocaleString(t.lang === 'hi' ? 'hi-IN' : 'en-GB')}</p>}
                    </div>
                </div>
            </div>
            <div className="border-t my-3"></div>
            <div>
               <h4 className="font-bold text-lg mb-2">{t.items}:</h4>
               <ul className="list-disc list-inside space-y-1">
                    {order.items.map((item, index) => (
                        <li key={index} className="text-md">
                            <span className="font-semibold">{t[item.category] || item.category}:</span> {item.quantity}
                        </li>
                    ))}
                </ul>
            </div>
            {order.notes && (
                <>
                    <div className="border-t my-3"></div>
                    <div>
                        <h4 className="font-bold text-lg mb-2">{t.notes}:</h4>
                        <p className="text-md bg-yellow-100 p-2 rounded-md">{order.notes}</p>
                    </div>
                </>
            )}
            <div className="border-t my-3"></div>
            <div className="flex justify-end items-center gap-2 mt-4 flex-wrap">
                <button onClick={onStainAdvice} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition-colors text-sm">
                    <Droplet size={16}/> {t.stainAdvisor}
                </button>
                <button onClick={() => onViewHistory(order)} className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-indigo-600 transition-colors text-sm">
                    <History size={16}/> {t.viewHistory}
                </button>
                {order.status === 'incoming' && (
                    <>
                        <button onClick={() => onGenerateMessage(order)} className="bg-purple-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-purple-600 transition-colors text-sm">
                            ✨
                        </button>
                        <button onClick={() => onMarkDelivered(order.id)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors text-sm">
                            <CheckCircle size={16}/>
                        </button>
                    </>
                )}
                 <button onClick={() => onTogglePayment(order.id, order.paymentStatus)} className={`font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm ${isPaid ? 'bg-yellow-400 text-white hover:bg-yellow-500' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                    <DollarSign size={16}/> {isPaid ? t.markAsUnpaid : t.markAsPaid}
                </button>
                <button onClick={() => onDelete(order.id)} className="bg-red-500 text-white font-bold p-2.5 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors">
                    <Trash2 size={16}/>
                </button>
            </div>
        </div>
    );
};

// --- New Order Modal Component ---
function NewOrderModal({ db, clients, t, onClose }) {
    const [clientName, setClientName] = useState('');
    const [clientNumber, setClientNumber] = useState('');
    const [items, setItems] = useState([{ category: 'dry_clean', quantity: 1 }]);
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showClientList, setShowClientList] = useState(false);

    const filteredClients = useMemo(() => {
        if (!searchTerm) return [];
        return clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.number.includes(searchTerm));
    }, [searchTerm, clients]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        if (field === 'quantity') {
            if (value === '' || /^\d+$/.test(value)) { newItems[index][field] = value === '' ? '' : parseInt(value, 10); }
        } else { newItems[index][field] = value; }
        setItems(newItems);
    };

    const addNewItem = () => setItems([...items, { category: 'dry_clean', quantity: 1 }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const selectClient = (client) => {
        setClientName(client.name);
        setClientNumber(client.number);
        setSearchTerm(`${client.name} (${client.number})`);
        setShowClientList(false);
    };

    const handleSaveOrder = async () => {
        const itemsToSave = items.map(item => ({ ...item, quantity: Math.max(1, parseInt(item.quantity, 10) || 1) })).filter(item => item.quantity > 0);
        if (!db || !clientName || !clientNumber || itemsToSave.length === 0) {
            alert("Please fill all client details and add at least one item.");
            return;
        }

        try {
            const counterRef = doc(db, `artifacts/${appId}/public/data/counters`, 'orders');
            let newInvoiceNumber;
            await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                if (!counterDoc.exists()) {
                    newInvoiceNumber = 1;
                } else {
                    newInvoiceNumber = counterDoc.data().currentNumber + 1;
                }
                transaction.set(counterRef, { currentNumber: newInvoiceNumber });
            });
            
            const clientQuery = query(collection(db, `artifacts/${appId}/public/data/clients`), where("number", "==", clientNumber));
            const querySnapshot = await getDocs(clientQuery);
            let clientId;
            if (querySnapshot.empty) {
                const clientDocRef = await addDoc(collection(db, `artifacts/${appId}/public/data/clients`), { name: clientName, number: clientNumber });
                clientId = clientDocRef.id;
            } else { clientId = querySnapshot.docs[0].id; }

            await addDoc(collection(db, `artifacts/${appId}/public/data/orders`), {
                clientId, clientName, clientNumber, items: itemsToSave, notes,
                status: 'incoming', paymentStatus: 'unpaid', createdAt: serverTimestamp(),
                invoiceNumber: newInvoiceNumber
            });
            onClose();
        } catch (error) {
            console.error("Error saving order:", error);
            alert("Failed to save order. Please try again.");
        }
    };
    
    useEffect(() => {
        const handleOutsideClick = (e) => { if (e.target.id === 'modal-backdrop') onClose(); };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, [onClose]);

    return (
        <div id="modal-backdrop" className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={28} /></button>
                    <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">{t.newOrder}</h2>
                    <div className="space-y-5">
                        <div className="relative">
                            <label className="font-bold text-lg">{t.selectClient}</label>
                            <div className="relative mt-2">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder={t.searchClient} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowClientList(true); setClientName(''); setClientNumber(''); }} className="w-full pl-10 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg" />
                            </div>
                            {showClientList && filteredClients.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                    {filteredClients.map(client => (
                                        <li key={client.id} onClick={() => selectClient(client)} className="p-3 hover:bg-blue-100 cursor-pointer">
                                            <p className="font-bold">{client.name}</p>
                                            <p className="text-sm text-gray-600">{client.number}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <label className="font-bold text-lg">{t.clientName}</label>
                            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-3 mt-1 border-2 border-gray-300 rounded-lg text-lg" />
                        </div>
                        <div>
                            <label className="font-bold text-lg">{t.clientNumber}</label>
                            <input type="tel" value={clientNumber} onChange={e => setClientNumber(e.target.value)} className="w-full p-3 mt-1 border-2 border-gray-300 rounded-lg text-lg" />
                        </div>
                        <div className="border-t pt-4">
                            <h3 className="font-bold text-xl mb-3">{t.items}</h3>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                                        <select value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-md">
                                            <option value="dry_clean">{t.dry_clean}</option>
                                            <option value="ironing">{t.ironing}</option>
                                            <option value="shoes">{t.shoes}</option>
                                            <option value="curtains">{t.curtains}</option>
                                            <option value="bedsheets">{t.bedsheets}</option>
                                        </select>
                                        <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-24 p-2 border border-gray-300 rounded-md text-md" min="1" />
                                        <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addNewItem} className="mt-3 text-blue-600 font-bold flex items-center gap-2"><Plus size={18} /> {t.addNewItem}</button>
                        </div>
                         <div className="border-t pt-4">
                            <label htmlFor="notes" className="font-bold text-xl mb-3">{t.notes}</label>
                            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.addNotesPlaceholder} className="w-full p-3 mt-1 border-2 border-gray-300 rounded-lg text-lg h-24"></textarea>
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <button onClick={handleSaveOrder} className="w-full bg-blue-500 text-white font-bold text-xl py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition-colors">{t.saveOrder}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Client History Modal ---
function ClientHistoryModal({ client, orders, t, formatDate, onClose }) {
    const clientOrders = useMemo(() => {
        return orders
            .filter(o => o.clientNumber === client.clientNumber)
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }, [orders, client]);

    return (
        <div id="modal-backdrop" className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={(e) => { if (e.target.id === 'modal-backdrop') onClose();}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={28} /></button>
                    <h2 className="text-3xl font-bold text-center text-indigo-600">{t.clientHistory}</h2>
                    <p className="text-center text-xl font-semibold">{client.clientName}</p>
                    <p className="text-center text-gray-600">{client.clientNumber}</p>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {clientOrders.length > 0 ? clientOrders.map(order => (
                        <div key={order.id} className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-lg">{t.invoice} #{order.invoiceNumber}</p>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${order.status === 'delivered' ? 'bg-gray-500' : 'bg-blue-500'}`}>{t[order.status]}</span>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-red-500'}`}>{t[order.paymentStatus]}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{formatDate(order.createdAt)}</p>
                            <ul className="list-disc list-inside text-sm">
                                {order.items.map((item, i) => <li key={i}>{t[item.category]}: {item.quantity}</li>)}
                            </ul>
                            {order.notes && <p className="text-sm mt-2 bg-yellow-100 p-2 rounded"><strong>{t.notes}:</strong> {order.notes}</p>}
                        </div>
                    )) : <p className="text-center text-gray-500">{t.noHistory}</p>}
                </div>
            </div>
        </div>
    );
}

// --- Confirmation Modal Component ---
function ConfirmDeleteModal({ t, onConfirm, onClose }) {
    return (
        <div id="modal-backdrop" className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={(e) => { if (e.target.id === 'modal-backdrop') onClose();}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-4">{t.areYouSure}</h2>
                <p className="text-gray-600 mb-6">{t.confirmDelete}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="py-2 px-8 font-bold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">{t.cancel}</button>
                    <button onClick={onConfirm} className="py-2 px-8 font-bold bg-red-500 text-white rounded-lg hover:bg-red-600">{t.delete}</button>
                </div>
            </div>
        </div>
    );
}

// --- Generated Message Modal Component ---
function GeneratedMessageModal({ t, order, message, isLoading, onClose }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textarea = document.createElement('textarea');
        textarea.value = message;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { console.error('Failed to copy text: ', err); }
        document.body.removeChild(textarea);
    };
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = order?.clientNumber.replace(/\D/g, '') || '';
    const whatsappNumber = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;

    return (
        <div id="modal-backdrop" className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={(e) => { if (e.target.id === 'modal-backdrop') onClose();}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={28} /></button>
                 <h2 className="text-3xl font-bold text-center mb-4 text-purple-600 flex items-center justify-center gap-2">
                    <MessageSquareText />
                    {t.deliveryMessage}
                </h2>
                <div className="bg-gray-100 rounded-lg p-4 my-4 min-h-[150px] whitespace-pre-wrap text-md">
                    {isLoading ? (<div className="flex justify-center items-center h-full"><p className="text-gray-500 animate-pulse">{t.generating}</p></div>) : (message)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a href={`sms:${phoneNumber}?body=${encodedMessage}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className={`w-full text-center bg-blue-500 text-white font-bold text-md py-3 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 ${isLoading || !message ? 'opacity-50 cursor-not-allowed' : ''}`}>
                       <Send size={18}/> {t.sendSMS}
                    </a>
                     <a href={`https://wa.me/${whatsappNumber}?text=${encodedMessage}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className={`w-full text-center bg-green-500 text-white font-bold text-md py-3 px-4 rounded-lg shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 ${isLoading || !message ? 'opacity-50 cursor-not-allowed' : ''}`}>
                       <MessageCircle size={18}/> {t.sendWhatsApp}
                    </a>
                    <button onClick={handleCopy} disabled={isLoading || !message} className="w-full bg-gray-500 text-white font-bold text-md py-3 px-4 rounded-lg shadow-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        <Clipboard size={18} />
                        {copied ? t.copied : t.copy}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Stain Advisor Modal ---
function StainAdvisorModal({ t, callGeminiAPI, onClose }) {
    const [stainType, setStainType] = useState('');
    const [fabricType, setFabricType] = useState('');
    const [advice, setAdvice] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGetAdvice = async () => {
        if (!stainType || !fabricType) {
            alert("Please enter both stain and fabric type.");
            return;
        }
        setIsGenerating(true);
        setAdvice('');
        
        const languageInstruction = t.title === "धोबीघाट लॉन्ड्री ट्रैकर" 
            ? "Provide the instructions in Hindi." 
            : "Provide the instructions in English.";

        const prompt = `You are an expert dry cleaner in India. Provide professional, step-by-step instructions for treating a ${stainType} stain on a ${fabricType} garment. The instructions should be clear, concise, and safe for the fabric. Use simple language. ${languageInstruction}`;
        
        const result = await callGeminiAPI(prompt);
        setAdvice(result);
        setIsGenerating(false);
    };

    return (
        <div id="modal-backdrop" className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={(e) => { if (e.target.id === 'modal-backdrop') onClose();}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={28} /></button>
                 <h2 className="text-3xl font-bold text-center mb-4 text-cyan-600 flex items-center justify-center gap-2">
                    <Droplet />
                    {t.stainAdvisor}
                </h2>
                <div className="space-y-4">
                    <input type="text" value={stainType} onChange={e => setStainType(e.target.value)} placeholder={t.stainType} className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg" />
                    <input type="text" value={fabricType} onChange={e => setFabricType(e.target.value)} placeholder={t.fabricType} className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg" />
                    <button onClick={handleGetAdvice} disabled={isGenerating} className="w-full bg-cyan-500 text-white font-bold text-xl py-3 px-6 rounded-lg shadow-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-400">
                        {isGenerating ? t.generating : t.getAdvice}
                    </button>
                </div>
                { (advice || isGenerating) &&
                    <div className="bg-gray-100 rounded-lg p-4 my-4 min-h-[150px] whitespace-pre-wrap text-md">
                        {isGenerating ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-500 animate-pulse">{t.generating}</p>
                            </div>
                        ) : (
                            advice
                        )}
                    </div>
                }
            </div>
        </div>
    );
}
