import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Image, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../config';
import Storage from '../storage';

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

    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [editingPrice, setEditingPrice] = useState('');
    const pricesScrollRef = useRef(null);
    const promotionsScrollRef = useRef(null);

    const [notiVisible, setNotiVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const storedId = await Storage.getItem('userId');
        const userId = storedId || 1; // El admin suele ser id=1
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
        const storedId = await Storage.getItem('userId');
        const userId = storedId || 1;
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

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditingName(item.name);
        setEditingPrice(item.price);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
        setEditingPrice('');
    };

    const handleUpdatePrice = async () => {
        if (!editingName || !editingPrice) return alert('Llene todos los campos');
        try {
            const res = await fetch(`${API_URL}/api/admin/prices/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName, price: editingPrice })
            });
            const data = await res.json();
            if (data.success) {
                alert('Precio actualizado con éxito');
                cancelEdit();
                fetchData();
            }
        } catch (err) { alert('Error al actualizar: ' + err.message); }
    };

    const handleUpdatePromotion = async () => {
        if (!editingName || !editingPrice) return alert('Llene todos los campos');
        try {
            const res = await fetch(`${API_URL}/api/admin/promotions/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName, price: editingPrice })
            });
            const data = await res.json();
            if (data.success) {
                alert('Promoción actualizada con éxito');
                cancelEdit();
                fetchData();
            }
        } catch (err) { alert('Error al actualizar: ' + err.message); }
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
        <ScrollView ref={pricesScrollRef} style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Lista de servicios</Text>
                    <TouchableOpacity style={styles.addHeaderButton} onPress={() => pricesScrollRef.current?.scrollToEnd({ animated: true })}>
                        <Feather name="plus" size={16} color="#EC4899" />
                        <Text style={styles.addHeaderButtonText}>Agregar servicio</Text>
                    </TouchableOpacity>
                </View>
                {prices.length === 0 ? (
                    <Text style={styles.emptyText}>No hay servicios registrados.</Text>
                ) : (
                    prices.map((p, index) => (
                        <View key={index} style={styles.priceRowAdmin}>
                            {editingId === p.id ? (
                                <View style={styles.editRow}>
                                    <TextInput
                                        style={[styles.inputAdmin, { marginBottom: 10 }]}
                                        placeholder="Nombre del servicio"
                                        placeholderTextColor="#9CA3AF"
                                        value={editingName}
                                        onChangeText={setEditingName}
                                    />
                                    <TextInput
                                        style={[styles.inputAdmin, { marginBottom: 10 }]}
                                        placeholder="Precio (ej: 25.000)"
                                        placeholderTextColor="#9CA3AF"
                                        value={editingPrice}
                                        onChangeText={(text) => setEditingPrice(text.replace(/[^0-9,.]/g, ''))}
                                        keyboardType="numeric"
                                    />
                                    <View style={styles.editButtonsRow}>
                                        <TouchableOpacity style={styles.btnAddPrice} onPress={handleUpdatePrice}>
                                            <LinearGradient
                                                colors={['#34D399', '#22C55E']}
                                                style={styles.btnGradient}
                                            >
                                                <Text style={styles.addServiceButtonText}>Guardar</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.btnCancelPrice} onPress={cancelEdit}>
                                            <LinearGradient
                                                colors={['#F87171', '#EF4444']}
                                                style={styles.btnGradient}
                                            >
                                                <Text style={styles.addServiceButtonText}>Cancelar</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.priceRowContent}> 
                                    <View style={styles.priceRowLeft}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.priceNameAdmin}>{p.name}</Text>
                                            <Text style={styles.priceSubtitleAdmin}>Servicio</Text>
                                        </View>
                                    </View>
                                    <View style={styles.priceRowRight}>
                                        <Text style={styles.priceValueAdmin}>${p.price}</Text>
                                        <TouchableOpacity onPress={() => startEdit(p)} style={styles.iconAction}>
                                            <Feather name="edit" size={16} color="#EC4899" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeletePrice(p.id)} style={[styles.iconAction, styles.iconActionDelete]}>
                                            <Feather name="trash-2" size={16} color="#EC4899" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>
            <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Agregar nuevo servicio</Text>
                <View style={styles.inputWrapper}>
                    <Feather name="tag" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        style={styles.inputAdmin}
                        placeholder="Nombre del servicio"
                        placeholderTextColor="#9CA3AF"
                        value={newName}
                        onChangeText={setNewName}
                    />
                </View>
                <View style={styles.inputWrapper}>
                    <Feather name="dollar-sign" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        style={styles.inputAdmin}
                        placeholder="Precio (ej: 25.000)"
                        placeholderTextColor="#9CA3AF"
                        value={newPrice}
                        onChangeText={(text) => setNewPrice(text.replace(/[^0-9,.]/g, ''))}
                        keyboardType="numeric"
                    />
                </View>
                <TouchableOpacity style={styles.addServiceButton} onPress={handleAddPrice}>
                    <LinearGradient
                        colors={['#34D399', '#22C55E']}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.addServiceButtonText}>+ Agregar servicio</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderPromotions = () => (
        <ScrollView ref={promotionsScrollRef} style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Promociones</Text>
                    <TouchableOpacity style={styles.addHeaderButton} onPress={() => promotionsScrollRef.current?.scrollToEnd({ animated: true })}>
                        <Feather name="plus" size={16} color="#EC4899" />
                        <Text style={styles.addHeaderButtonText}>Agregar promoción</Text>
                    </TouchableOpacity>
                </View>
                {promotions.length === 0 ? (
                    <Text style={styles.emptyText}>No hay promociones registradas.</Text>
                ) : (
                    promotions.map((p, index) => (
                        <View key={index} style={styles.priceRowAdmin}>
                            {editingId === p.id ? (
                                <View style={styles.editRow}>
                                    <TextInput
                                        style={[styles.inputAdmin, { marginBottom: 10 }]}
                                        placeholder="Nombre de la promoción"
                                        placeholderTextColor="#9CA3AF"
                                        value={editingName}
                                        onChangeText={setEditingName}
                                    />
                                    <TextInput
                                        style={[styles.inputAdmin, { marginBottom: 10 }]}
                                        placeholder="Precio (ej: 25.000)"
                                        placeholderTextColor="#9CA3AF"
                                        value={editingPrice}
                                        onChangeText={(text) => setEditingPrice(text.replace(/[^0-9,.]/g, ''))}
                                        keyboardType="numeric"
                                    />
                                    <View style={styles.editButtonsRow}>
                                        <TouchableOpacity style={styles.btnAddPrice} onPress={handleUpdatePromotion}>
                                            <LinearGradient
                                                colors={['#34D399', '#22C55E']}
                                                style={styles.btnGradient}
                                            >
                                                <Text style={styles.addServiceButtonText}>Guardar</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.btnCancelPrice} onPress={cancelEdit}>
                                            <LinearGradient
                                                colors={['#F87171', '#EF4444']}
                                                style={styles.btnGradient}
                                            >
                                                <Text style={styles.addServiceButtonText}>Cancelar</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.priceRowContent}>
                                    <View style={styles.priceRowLeft}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.priceNameAdmin}>{p.name}</Text>
                                            <Text style={styles.priceSubtitleAdmin}>Promoción</Text>
                                        </View>
                                    </View>
                                    <View style={styles.priceRowRight}>
                                        <Text style={styles.priceValueAdmin}>${p.price}</Text>
                                        <TouchableOpacity onPress={() => startEdit(p)} style={styles.iconAction}>
                                            <Feather name="edit" size={16} color="#EC4899" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeletePromotion(p.id)} style={[styles.iconAction, styles.iconActionDelete]}>
                                            <Feather name="trash-2" size={16} color="#EC4899" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>
            <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Agregar nueva promoción</Text>
                <View style={styles.inputWrapper}>
                    <Feather name="star" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        style={styles.inputAdmin}
                        placeholder="Nombre de la promoción"
                        placeholderTextColor="#9CA3AF"
                        value={newName}
                        onChangeText={setNewName}
                    />
                </View>
                <View style={styles.inputWrapper}>
                    <Feather name="dollar-sign" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        style={styles.inputAdmin}
                        placeholder="Precio (ej: 25.000)"
                        placeholderTextColor="#9CA3AF"
                        value={newPrice}
                        onChangeText={(text) => setNewPrice(text.replace(/[^0-9,.]/g, ''))}
                        keyboardType="numeric"
                    />
                </View>
                <TouchableOpacity style={styles.addServiceButton} onPress={handleAddPromotion}>
                    <LinearGradient
                        colors={['#34D399', '#22C55E']}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.addServiceButtonText}>+ Agregar promoción</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
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

                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>Hola, Bienvenida!</Text>
                    <Text style={styles.subtitle}>Administra tus servicios</Text>
                </View>

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
                    <Feather name="calendar" size={18} color={activeTab === 'agendas' ? "#EC4899" : "#9CA3AF"} />
                    <Text style={[styles.tabText, activeTab === 'agendas' && styles.activeTabText]}>Agendas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'prices' && styles.activeTab]}
                    onPress={() => setActiveTab('prices')}
                >
                    <Feather name="tag" size={18} color={activeTab === 'prices' ? "#EC4899" : "#9CA3AF"} />
                    <Text style={[styles.tabText, activeTab === 'prices' && styles.activeTabText]}>Precios</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'promotions' && styles.activeTab]}
                    onPress={() => setActiveTab('promotions')}
                >
                    <Feather name="star" size={18} color={activeTab === 'promotions' ? "#EC4899" : "#9CA3AF"} />
                    <Text style={[styles.tabText, activeTab === 'promotions' && styles.activeTabText]}>Promos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
                    onPress={() => setActiveTab('gallery')}
                >
                    <Feather name="image" size={18} color={activeTab === 'gallery' ? "#EC4899" : "#9CA3AF"} />
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
    headerTextContainer: {
        alignItems: 'center',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.95)',
        fontSize: 14,
        marginTop: 4,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 8,
        marginHorizontal: 8,
        marginTop: 20,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 20,
        paddingHorizontal: 8,
    },
    activeTab: {
        backgroundColor: '#FEE2E2',
    },
    tabText: { color: '#9CA3AF', fontWeight: '600' },
    activeTabText: { color: '#EC4899' },
    content: { flex: 1, padding: 20 },
    tabContent: { flex: 1 },
    emptyText: { color: '#6B7280', fontSize: 16, textAlign: 'center', marginTop: 20 },
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
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 6,
    },
    inputAdmin: {
        backgroundColor: '#F3F4F6',
        color: '#111827',
        padding: 16,
        paddingLeft: 48,
        borderRadius: 16,
        marginBottom: 14,
        fontSize: 15,
        width: '100%',
        borderWidth: 0,
        borderColor: 'transparent',
        outlineWidth: 0,
        outlineColor: 'transparent',
    },
    btnAddPrice: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        flex: 1,
    },
    btnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 6,
    },
    sectionTitle: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    addHeaderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: '#FEE2E2',
    },
    addHeaderButtonText: {
        color: '#EC4899',
        fontWeight: '700',
        fontSize: 14,
    },
    listScroll: {
        maxHeight: '70%',
    },
    editRow: {
        flex: 1,
        padding: 4,
    },
    editButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    priceRowAdmin: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    priceRowContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    priceRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    priceRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    priceNameAdmin: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '700',
        flexShrink: 1,
    },
    priceSubtitleAdmin: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 2,
    },
    priceValueAdmin: {
        color: '#EC4899',
        fontSize: 16,
        fontWeight: '700',
    },

    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
    },
    addServiceButton: {
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 10,
    },
    addServiceButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        width: '30',
    },
    iconAction: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconActionDelete: {
        backgroundColor: '#FEE2E2',
    },
    btnCancelPrice: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        flex: 1,
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
