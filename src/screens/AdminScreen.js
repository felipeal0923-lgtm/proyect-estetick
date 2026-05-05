import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Image, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../config';

export default function AdminScreen({ navigateTo }) {
    const [activeTab, setActiveTab] = useState('agendas');
    const [appointments, setAppointments] = useState([]);
    const [prices, setPrices] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    const [notiVisible, setNotiVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const userId = localStorage.getItem('userId') || 1; // El admin suele ser id=1
        try {
            const res = await fetch(`${API_URL}/api/notifications/${userId}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.length);
            }
        } catch (err) { console.log('Error fetching admin notis:', err); }
    };

    const deleteNotification = async (id) => {
        try {
            await fetch(`${API_URL}/api/notifications/${id}`, { method: 'DELETE' });
            fetchNotifications();
        } catch (err) { console.log(err); }
    };

    const clearNotifications = async () => {
        const userId = localStorage.getItem('userId') || 1;
        try {
            await fetch(`${API_URL}/api/notifications/user/${userId}`, { method: 'DELETE' });
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) { console.log('Error clearing admin notis:', err); }
    };

    useEffect(() => {
        fetchData();
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Polling cada 30s
        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'agendas') {
                const res = await fetch(`${API_URL}/api/admin/all-data`);
                const data = await res.json();
                setAppointments(data.success ? (data.allAppointments || []) : []);
            } else if (activeTab === 'prices') {
                const res = await fetch(`${API_URL}/api/prices`);
                const data = await res.json();
                setPrices(data.success ? (data.prices || []) : []);
            } else if (activeTab === 'gallery') {
                const res = await fetch(`${API_URL}/api/gallery`);
                const data = await res.json();
                setGallery(data.success ? (data.images || []) : []);
            } else if (activeTab === 'promotions') {
                const res = await fetch(`${API_URL}/api/promotions`);
                const data = await res.json();
                setPromotions(data.success ? (data.promotions || []) : []);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
            // Reset all to empty arrays on network error
            if (activeTab === 'agendas') setAppointments([]);
            else if (activeTab === 'prices') setPrices([]);
            else if (activeTab === 'gallery') setGallery([]);
            else if (activeTab === 'promotions') setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPrice = async () => {
        if (!newName || !newPrice) return alert('Llene todos los campos');
        try {
            const res = await fetch(`${API_URL}/api/admin/prices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, price: newPrice })
            });
            const data = await res.json();
            if (data.success) {
                alert('Precio agregado con éxito');
                setNewName('');
                setNewPrice('');
                fetchData();
            }
        } catch (err) { alert('Error al guardar: ' + err.message); }
    };

    const handleDeletePrice = (id) => {
        const confirmDelete = () => {
            fetch(`${API_URL}/api/admin/prices/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) fetchData();
                    else alert('Error al eliminar: ' + (data.error || 'Error desconocido'));
                })
                .catch(err => {
                    console.error(err);
                    alert('Error de conexión al eliminar');
                });
        };

        if (Platform.OS === 'web') {
            if (window.confirm('¿Seguro que deseas eliminar este precio?')) {
                confirmDelete();
            }
        } else {
            Alert.alert('Eliminar', '¿Seguro que deseas eliminar este precio?', [
                { text: 'Cancelar' },
                { text: 'Eliminar', onPress: confirmDelete }
            ]);
        }
    };

    const handleAddPromotion = async () => {
        if (!newName || !newPrice) return alert('Llene todos los campos');
        try {
            const res = await fetch(`${API_URL}/api/admin/promotions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, price: newPrice })
            });
            const data = await res.json();
            if (data.success) {
                alert('Promoción agregada con éxito');
                setNewName('');
                setNewPrice('');
                fetchData();
            }
        } catch (err) { alert('Error al guardar: ' + err.message); }
    };

    const handleDeletePromotion = (id) => {
        const confirmDelete = () => {
            fetch(`${API_URL}/api/admin/promotions/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) fetchData();
                    else alert('Error al eliminar: ' + (data.error || 'Error desconocido'));
                })
                .catch(err => {
                    console.error(err);
                    alert('Error de conexión al eliminar');
                });
        };

        if (Platform.OS === 'web') {
            if (window.confirm('¿Seguro que deseas eliminar esta promoción?')) {
                confirmDelete();
            }
        } else {
            Alert.alert('Eliminar', '¿Seguro que deseas eliminar esta promoción?', [
                { text: 'Cancelar' },
                { text: 'Eliminar', onPress: confirmDelete }
            ]);
        }
    };

    const handleAddImage = async () => {
        if (!newImageUrl) return alert('Ingrese una URL');
        try {
            const res = await fetch(`${API_URL}/api/admin/gallery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newImageUrl })
            });
            const data = await res.json();
            if (data.success) {
                alert('Imagen agregada con éxito');
                setNewImageUrl('');
                fetchData();
            }
        } catch (err) { alert('Error al guardar: ' + err.message); }
    };

    const handleDeleteImage = (id) => {
        const confirmDelete = () => {
            fetch(`${API_URL}/api/admin/gallery/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) fetchData();
                    else alert('Error al eliminar: ' + (data.error || 'Error desconocido'));
                })
                .catch(err => {
                    console.error(err);
                    alert('Error de conexión al eliminar');
                });
        };

        if (Platform.OS === 'web') {
            if (window.confirm('¿Seguro que deseas eliminar esta imagen?')) {
                confirmDelete();
            }
        } else {
            Alert.alert('Eliminar', '¿Seguro que deseas eliminar esta imagen?', [
                { text: 'Cancelar' },
                { text: 'Eliminar', onPress: confirmDelete }
            ]);
        }
    };

    const handleDeleteAppointment = (id) => {
        const confirmDelete = () => {
            fetch(`${API_URL}/api/appointments/${id}?source=admin`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('Cita cancelada y usuario notificado');
                        fetchData();
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('Error al cancelar la cita');
                });
        };

        if (Platform.OS === 'web') {
            if (window.confirm('¿Seguro que deseas cancelar esta cita? Se notificará al usuario.')) {
                confirmDelete();
            }
        } else {
            Alert.alert('Cancelar Cita', '¿Seguro que deseas cancelar esta cita? Se notificará al usuario.', [
                { text: 'No' },
                { text: 'Sí, cancelar', onPress: confirmDelete }
            ]);
        }
    };

    const renderAgendas = () => (
        <ScrollView style={styles.tabContent}>
            {appointments.length === 0 ? (
                <Text style={styles.emptyText}>No hay citas registradas.</Text>
            ) : (
                appointments.map((app, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardTop}>
                            <Feather name="calendar" size={20} color="#84CC16" />
                            <Text style={styles.cardDateText}>{app.date}   |   {app.time}</Text>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={() => handleDeleteAppointment(app.id)}>
                                <Feather name="trash-2" size={18} color="#FF4D6D" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.cardBottom}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Feather name="user" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.cardInfoText} numberOfLines={1}>{app.name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                                <Feather name="phone" size={14} color="#898989" style={{ marginRight: 6 }} />
                                <Text style={styles.cardInfoText}>{app.phone || 'Sin número'}</Text>
                            </View>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );

    const renderPrices = () => (
        <View style={styles.tabContent}>
            <View style={styles.formCard}>
                <TextInput
                    style={styles.inputAdmin}
                    placeholder="Nombre del servicio"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={newName}
                    onChangeText={setNewName}
                />
                <TextInput
                    style={styles.inputAdmin}
                    placeholder="Precio (ej: 25,000)"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={newPrice}
                    onChangeText={(text) => setNewPrice(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                />
                <TouchableOpacity style={styles.btnAddPrice} onPress={handleAddPrice}>
                    <LinearGradient
                        colors={['#84CC16', '#65A30D']}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.btnAddText}>Agregar Servicio</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {prices.map((p, index) => (
                    <View
                        key={index}
                        style={styles.priceRowAdmin}
                    >
                        <View style={styles.accentBarAdmin} />
                        <View style={styles.priceMainInfoAdmin}>
                            <Text style={styles.priceNameAdmin}>{p.name}</Text>
                            <View style={styles.priceRightAdmin}>
                                <View style={styles.priceCapsuleAdmin}>
                                    <Text style={styles.priceValueAdmin}>${p.price}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDeletePrice(p.id)}
                                    style={styles.deleteBtnAdmin}
                                >
                                    <View style={styles.deleteIconBg}>
                                        <Feather name="trash-2" size={16} color="#FFF" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const renderPromotions = () => (
        <View style={styles.tabContent}>
            <View style={styles.formCard}>
                <TextInput
                    style={styles.inputAdmin}
                    placeholder="Nombre de la promoción"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={newName}
                    onChangeText={setNewName}
                />
                <TextInput
                    style={styles.inputAdmin}
                    placeholder="Precio (ej: 25,000)"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={newPrice}
                    onChangeText={(text) => setNewPrice(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                />
                <TouchableOpacity style={styles.btnAddPrice} onPress={handleAddPromotion}>
                    <LinearGradient
                        colors={['#84CC16', '#65A30D']}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.btnAddText}>Agregar Promoción</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {promotions.map((p, index) => (
                    <View
                        key={index}
                        style={styles.priceRowAdmin}
                    >

                        <View style={styles.priceMainInfoAdmin}>
                            <Text style={styles.priceNameAdmin}>{p.name}</Text>
                            <View style={styles.priceRightAdmin}>
                                <View style={styles.priceCapsuleAdmin}>
                                    <Text style={styles.priceValueAdmin}>${p.price}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDeletePromotion(p.id)}
                                    style={styles.deleteBtnAdmin}
                                >
                                    <View style={styles.deleteIconBg}>
                                        <Feather name="trash-2" size={16} color="#FFF" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const renderGallery = () => (
        <View style={styles.tabContent}>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="URL de la imagen"
                    placeholderTextColor="#FFFFFF"
                    value={newImageUrl}
                    onChangeText={setNewImageUrl}
                />
                {newImageUrl ? (
                    <View style={{ marginBottom: 15, alignItems: 'center' }}>
                        <Text style={{ color: '#FFF', marginBottom: 5 }}>Vista previa:</Text>
                        <Image
                            source={{ uri: newImageUrl }}
                            style={{ width: 150, height: 150, borderRadius: 10, backgroundColor: '#444' }}
                            resizeMode="cover"
                        />
                    </View>
                ) : null}
                <TouchableOpacity style={styles.btnAdd} onPress={handleAddImage}>
                    <Text style={styles.btnAddText}>Agregar Imagen</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.galleryGrid}>
                    {gallery.map((img, index) => (
                        <View key={index} style={styles.galleryItem}>
                            <Image source={{ uri: img.url }} style={styles.galleryImage} />
                            <TouchableOpacity
                                style={styles.deleteBadge}
                                onPress={() => handleDeleteImage(img.id)}
                            >
                                <Feather name="x" size={16} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#C2185B', '#E91E63']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigateTo('Login')} style={{ padding: 10 }}>
                    <Feather name="log-out" size={24} color="#FFF" />
                </TouchableOpacity>

                <Text style={styles.title}>Hola Bienvenida!!</Text>

                <TouchableOpacity
                    onPress={() => {
                        setNotiVisible(true);
                        setUnreadCount(0);
                    }}
                    style={{ padding: 10, position: 'relative' }}
                >
                    <Feather name="bell" size={24} color="#FFF" />
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount > 9 ? '+9' : unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'agendas' && styles.activeTab]}
                    onPress={() => setActiveTab('agendas')}
                >
                    <Feather name="calendar" size={18} color={activeTab === 'agendas' ? "#FFF" : "#888"} />
                    <Text style={[styles.tabText, activeTab === 'agendas' && styles.activeTabText]}>Agendas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'prices' && styles.activeTab]}
                    onPress={() => setActiveTab('prices')}
                >
                    <Feather name="tag" size={18} color={activeTab === 'prices' ? "#FFF" : "#888"} />
                    <Text style={[styles.tabText, activeTab === 'prices' && styles.activeTabText]}>Precios</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'promotions' && styles.activeTab]}
                    onPress={() => setActiveTab('promotions')}
                >
                    <Feather name="star" size={18} color={activeTab === 'promotions' ? "#FFF" : "#888"} />
                    <Text style={[styles.tabText, activeTab === 'promotions' && styles.activeTabText]}>Promos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
                    onPress={() => setActiveTab('gallery')}
                >
                    <Feather name="image" size={18} color={activeTab === 'gallery' ? "#FFF" : "#888"} />
                    <Text style={[styles.tabText, activeTab === 'gallery' && styles.activeTabText]}>Galería</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#FF5C8A" style={{ marginTop: 50 }} />
                ) : (
                    <>
                        {activeTab === 'agendas' && renderAgendas()}
                        {activeTab === 'prices' && renderPrices()}
                        {activeTab === 'promotions' && renderPromotions()}
                        {activeTab === 'gallery' && renderGallery()}
                    </>
                )}
            </View>

            <Modal
                visible={notiVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setNotiVisible(false);
                    clearNotifications();
                }}
            >
                <View style={styles.notiModalOverlay}>
                    <LinearGradient
                        colors={['#C2185B', '#E91E63']}
                        style={styles.notiContainer}
                    >
                        <View style={styles.notiHeader}>
                            <Text style={styles.notiTitle}>Avisos de Clientes</Text>
                            <TouchableOpacity onPress={() => {
                                setNotiVisible(false);
                                clearNotifications();
                            }}>
                                <Feather name="x" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {notifications.length === 0 ? (
                                <Text style={styles.emptyNoti}>No hay avisos nuevos.</Text>
                            ) : (
                                notifications.map((n, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.notiItem}
                                        onPress={() => deleteNotification(n.id)}
                                    >
                                        <Text style={styles.notiText}>{n.message}</Text>
                                        <Text style={styles.notiDate}>{new Date(n.date).toLocaleString()}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </LinearGradient>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F48FB1',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#2c2c2c',
        padding: 5,
        marginHorizontal: 8,
        marginTop: 20,
        borderRadius: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    activeTab: { backgroundColor: '#F14C8B' },
    tabText: { color: '#FFFFFF', fontWeight: 'bold' },
    activeTabText: { color: '#FFF' },
    content: { flex: 1, padding: 20 },
    tabContent: { flex: 1 },
    emptyText: { color: '#FFFFFF', fontSize: 18, textAlign: 'center', marginTop: 50 },
    card: {
        backgroundColor: '#2c2c2c7b',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,


    },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardDateText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 15 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 },
    cardBottom: { flexDirection: 'row', alignItems: 'center' },
    cardInfoText: { color: '#FFFFFF', fontSize: 14 },
    form: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#2c2c2c',
        color: '#FFF',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        outlineStyle: 'none',
    },
    btnAdd: {
        backgroundColor: '#84CC16',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnAddText: { color: '#FFF', fontWeight: 'bold' },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2c2c2c',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    listTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    listSubtitle: { color: '#FFFFFF', fontSize: 14 },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    galleryItem: {
        width: '31%',
        aspectRatio: 1,
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    galleryImage: { width: '100%', height: '100%' },
    deleteBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputAdmin: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        color: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 15,
        outlineStyle: 'none',
    },
    btnAddPrice: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 5,
    },
    btnGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    priceRowAdmin: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 18,
        minHeight: 70,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    priceMainInfoAdmin: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    priceRightAdmin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    priceNameAdmin: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
    },
    priceCapsuleAdmin: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    priceValueAdmin: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    deleteBtnAdmin: {
        padding: 5,
    },
    deleteIconBg: {
        backgroundColor: '#FF4D6D',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FFFFFF',
        borderRadius: 9,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#E91E63',
        fontSize: 10,
        fontWeight: 'bold',
    },
    notiModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notiContainer: {
        width: '90%',
        borderRadius: 20,
        padding: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    notiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    notiTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    notiItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    notiText: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 5,
    },
    notiDate: {
        color: '#FFF',
        fontSize: 11,
    },
    emptyNoti: {
        color: '#FFF',
        textAlign: 'center',
        marginTop: 20,
    }
});
