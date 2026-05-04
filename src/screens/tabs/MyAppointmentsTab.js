import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function MyAppointmentsTab() {
    const [userAppointments, setUserAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [newPhone, setNewPhone] = useState('');

    const fetchUserAppointments = async () => {
        const userId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
        if (!userId) return;
        
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/appointments/user/${userId}`);
            const data = await res.json();
            if (data.success) {
                setUserAppointments(data.appointments);
            }
        } catch (err) {
            console.log('Error fetching user appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        const userId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
        if (!userId) return;
        try {
            const res = await fetch(`${API_URL}/api/user/${userId}`);
            const data = await res.json();
            if (data.success) {
                setUserData(data.user);
            }
        } catch (err) { console.log(err); }
    };

    const handleUpdatePhone = async () => {
        const userId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
        if (!newPhone || !userId) return alert('Ingresa un número válido');
        try {
            const response = await fetch(`${API_URL}/api/user/update-phone`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, phone: newPhone })
            });
            const data = await response.json();
            if (data.success) {
                alert('Número actualizado con éxito');
                fetchUserData();
                setNewPhone('');
            }
        } catch (err) {
            alert('Error al actualizar el teléfono');
        }
    };

    useEffect(() => {
        fetchUserAppointments();
        fetchUserData();
    }, []);

    const handleCancelAppointment = (id) => {
        const cancelAction = async () => {
            try {
                const res = await fetch(`${API_URL}/api/appointments/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert('Cita cancelada con éxito');
                    fetchUserAppointments();
                }
            } catch (err) {
                alert('Error al cancelar la cita');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
                cancelAction();
            }
        } else {
            Alert.alert(
                'Cancelar Cita',
                '¿Estás seguro de que deseas cancelar esta cita?',
                [
                    { text: 'No' },
                    { text: 'Sí, cancelar', onPress: cancelAction }
                ]
            );
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>Tus agendamientos</Text>
                <TouchableOpacity onPress={fetchUserAppointments}>
                    <Feather name="refresh-cw" size={20} color="#84CC16" />
                </TouchableOpacity>
            </View>

            {userData && (!userData.phone || userData.phone === '') && (
                <View style={styles.phoneAlert}>
                    <Feather name="alert-circle" size={24} color="#FFF" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.phoneAlertText}>¡Falta tu número de contacto!</Text>
                        <View style={styles.phoneInputRow}>
                            <TextInput 
                                style={styles.phoneInput} 
                                placeholder="ej. 300..."
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={newPhone}
                                onChangeText={setNewPhone}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity style={styles.btnSavePhone} onPress={handleUpdatePhone}>
                                <Text style={styles.btnSavePhoneText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            
            {loading ? (
                <Text style={styles.emptyText}>Cargando...</Text>
            ) : userAppointments.length === 0 ? (
                <Text style={styles.emptyText}>No tienes citas agendadas.</Text>
            ) : (
                userAppointments.map((app, index) => (
                    <View key={index} style={styles.appointmentCard}>
                        <View style={styles.appointmentInfo}>
                            <Feather name="calendar" size={20} color="#84CC16" />
                            <Text style={styles.appointmentDate}>{app.date} | {app.time}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.btnCancel} 
                            onPress={() => handleCancelAppointment(app.id)}
                        >
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    appointmentCard: {
        backgroundColor: 'rgba(56, 56, 56, 0.8)',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    appointmentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appointmentDate: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 10,
    },
    btnCancel: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    btnCancelText: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 30,
    },
    phoneAlert: {
        backgroundColor: '#F14C8B',
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    phoneAlertText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 10,
    },
    phoneInputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    phoneInput: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        flex: 1,
        height: 40,
        borderRadius: 8,
        paddingHorizontal: 10,
        color: '#FFF',
    },
    btnSavePhone: {
        backgroundColor: '#84CC16',
        paddingHorizontal: 15,
        justifyContent: 'center',
        borderRadius: 8,
    },
    btnSavePhoneText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});
