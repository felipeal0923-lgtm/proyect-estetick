import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../../config';
import Storage from '../../storage';

export default function ProfileTab() {
    const [userAppointments, setUserAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Edit states
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const fetchUserAppointments = async () => {
        const userId = await Storage.getItem('userId');
        if (!userId) return;

        try {
            const res = await fetch(`${API_URL}/api/appointments/user/${userId}`);
            const data = await res.json();
            if (data.success) {
                setUserAppointments(data.appointments);
            }
        } catch (err) {
            console.log('Error fetching user appointments:', err);
        }
    };

    const fetchUserData = async () => {
        const userId = await Storage.getItem('userId');
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/user/${userId}`);
            if (!res.ok) throw new Error('Respuesta no válida del servidor');
            const data = await res.json();
            if (data.success) {
                setUserData(data.user);
                setEditName(data.user.name);
                setEditPhone(data.user.phone || '');
                setEditEmail(data.user.identifier);
            }
        } catch (err) {
            console.log('Error al cargar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        const userId = await Storage.getItem('userId');
        if (!userId) return;

        try {
            const response = await fetch(`${API_URL}/api/user/update-profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    name: editName,
                    phone: editPhone,
                    identifier: editEmail
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Perfil actualizado con éxito');
                setIsEditing(false);
                fetchUserData();
                await Storage.setItem('userName', editName);
            } else {
                alert(data.error || 'Error al actualizar');
            }
        } catch (err) {
            alert('Error de conexión');
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

    if (loading && !userData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#F14C8B" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Sección de Perfil */}
            <View style={styles.profileHeader}>
                <View style={styles.profileInfoMain}>
                    <Text style={styles.sectionTitle}>Mi Perfil</Text>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editBtn}>
                        <Feather name={isEditing ? "x" : "edit-2"} size={20} color="#FFFFFF" />
                        <Text style={styles.editBtnText}>{isEditing ? "Cancelar" : "Editar"}</Text>
                    </TouchableOpacity>
                </View>

                {isEditing ? (
                    <View style={styles.editContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Teléfono</Text>
                            <TextInput
                                style={styles.input}
                                value={editPhone}
                                onChangeText={setEditPhone}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Correo / Usuario</Text>
                            <TextInput
                                style={styles.input}
                                value={editEmail}
                                onChangeText={setEditEmail}
                            />
                        </View>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
                            <LinearGradient colors={['#84CC16', '#4D7C0F']} style={styles.saveBtnGradient}>
                                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.infoDisplay}>
                        <View style={styles.infoRow}>
                            <Feather name="user" size={18} color="#F14C8B" />
                            <Text style={styles.infoText}>{userData?.name || 'Cargando...'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Feather name="phone" size={18} color="#F14C8B" />
                            <Text style={styles.infoText}>{userData?.phone || 'Sin teléfono'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Feather name="mail" size={18} color="#F14C8B" />
                            <Text style={styles.infoText}>{userData?.identifier || '-'}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Sección de Agendas fue movida a MyAppointmentsTab.js */}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    profileHeader: {
        marginBottom: 20,
    },
    profileInfoMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        gap: 6,
    },
    editBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    infoDisplay: {
        backgroundColor: '#4f4d4d',
        padding: 20,
        borderRadius: 20,
        gap: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    infoText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    editContainer: {
        backgroundColor: '#4f4d4d',
        padding: 20,
        borderRadius: 20,
        gap: 15,
    },
    inputGroup: {
        gap: 5,
    },
    inputLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginLeft: 5,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        color: '#FFFFFF',
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
        outlineStyle: 'none',
    },
    saveBtn: {
        marginTop: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveBtnGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#4f4d4d',
        marginVertical: 30,
    },
    agendasHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
    }
});
