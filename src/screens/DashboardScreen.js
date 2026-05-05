import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Header from '../components/Header';
import Menu from '../components/menu';

import ScheduleTab from './tabs/ScheduleTab';
import PricesTab from './tabs/PricesTab';
import GalleryTab from './tabs/GalleryTab';
import ProfileTab from './tabs/ProfileTab';
import MyAppointmentsTab from './tabs/MyAppointmentsTab';

import { API_URL } from '../config';

export default function DashboardScreen() {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [notiVisible, setNotiVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async (userId) => {
        try {
            const res = await fetch(`${API_URL}/api/notifications/${userId}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.read).length);
            }
        } catch (err) {
            console.log('Error fetching notifications:', err);
        }
    }, []);

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_URL}/api/notifications/${id}`, { method: 'DELETE' });
            const userId = localStorage.getItem('userId');
            if (userId) fetchNotifications(userId);
        } catch (err) { console.log(err); }
    };

    const clearNotifications = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        try {
            const res = await fetch(`${API_URL}/api/notifications/user/${userId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (err) {
            console.log('Error clearing notifications:', err);
        }
    };

    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            const userId = localStorage.getItem('userId');
            if (userId) {
                fetchNotifications(userId);
                const interval = setInterval(() => fetchNotifications(userId), 30000); // Polling cada 30s
                return () => clearInterval(interval);
            }
        }
    }, [fetchNotifications]);

    const renderTabContent = () => {
        switch (activeTabIndex) {
            case 0: return <ScheduleTab />;
            case 1: return <PricesTab />;
            case 2: return <GalleryTab />;
            case 3: return <ProfileTab />;
            case 4: return <MyAppointmentsTab />;
            default: return <ScheduleTab />;
        }
    };

    return (
        <LinearGradient
            colors={['#898989', '#F14C8B']}
            style={styles.container}
        >
            <Header 
                onNavigate={setActiveTabIndex} 
                unreadCount={unreadCount}
                onPressNoti={() => {
                    setNotiVisible(true);
                    setUnreadCount(0);
                }}
            />
            <Menu 
                activeIndex={activeTabIndex} 
                onSetActiveIndex={setActiveTabIndex} 
            />

            <View style={styles.content}>
                {renderTabContent()}
            </View>

            {/* Modal de Notificaciones */}
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
                        colors={['#898989', '#F14C8B']}
                        style={styles.notiContainer}
                    >
                        <View style={styles.notiHeader}>
                            <Text style={styles.notiTitle}>Notificaciones</Text>
                            <TouchableOpacity onPress={() => {
                                setNotiVisible(false);
                                clearNotifications();
                            }}>
                                <Feather name="x" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {notifications.length === 0 ? (
                                <Text style={styles.emptyNoti}>No tienes notificaciones.</Text>
                            ) : (
                                notifications.map((n, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.notiItem, !n.read && styles.unreadNoti]}
                                        onPress={() => markAsRead(n.id)}
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        marginTop: 10,
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
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    unreadNoti: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 10,
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
