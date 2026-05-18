import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../../config';
import Storage from '../../storage';


const monthNamesEs = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const dayNamesEs = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export default function ScheduleTab() {
    const [step, setStep] = useState(1);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookedTimes, setBookedTimes] = useState([]);

    useEffect(() => {
        if (selectedDate && step === 2) {
            const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
            fetch(`${API_URL}/api/appointments?date=${dateStr}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setBookedTimes(data.bookedTimes);
                    }
                })
                .catch(err => console.log('Error fetching appointments:', err));
        }
    }, [selectedDate, step]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

        let currentDayNum = 1;
        let nextMonthDayNum = 1;
        const weeks = [];

        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    week.push({ day: prevMonthDays - firstDay + j + 1, isCurrentMonth: false });
                } else if (currentDayNum > daysInMonth) {
                    week.push({ day: nextMonthDayNum++, isCurrentMonth: false });
                } else {
                    week.push({ day: currentDayNum++, isCurrentMonth: true });
                }
            }
            weeks.push(week);
            if (currentDayNum > daysInMonth && week.length === 7) {
                break;
            }
        }
        return weeks;
    };

    const headerMonthText = () => {
        const monthStr = monthNamesEs[currentDate.getMonth()];
        const capMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
        return `${capMonth} ${currentDate.getFullYear()}`;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        const today = new Date();
        const currentMonthFirst = new Date(today.getFullYear(), today.getMonth(), 1);
        if (newDate < currentMonthFirst) return; // No permitir ir a meses pasados
        setCurrentDate(newDate);
    };

    const changeYear = (offset) => {
        const newDate = new Date(currentDate.getFullYear() + offset, currentDate.getMonth(), 1);
        const today = new Date();
        const currentMonthFirst = new Date(today.getFullYear(), today.getMonth(), 1);
        if (newDate < currentMonthFirst) {
            setCurrentDate(currentMonthFirst); // Regresar al mes mínimo actual
            return;
        }
        setCurrentDate(newDate);
    };

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '14:00 PM', '15:00 PM', '16:00 PM', '17:00 PM', '18:00 PM'
    ];

    const renderCalendar = () => {
        const weeks = generateCalendar();

        return (
            <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => changeYear(-1)} style={{ padding: 5 }}>
                        <Feather name="chevrons-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 5 }}>
                        <Feather name="chevron-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>{headerMonthText()}</Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 5 }}>
                        <Feather name="chevron-right" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeYear(1)} style={{ padding: 5 }}>
                        <Feather name="chevrons-right" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.calendarGrid}>
                    <View style={[styles.dayHeader, { marginBottom: 10 }]}>
                        {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <Text key={day} style={styles.dayText}>{day}</Text>
                        ))}
                    </View>

                    {weeks.map((week, rowIndex) => (
                        <View key={rowIndex} style={[styles.dayHeader, { marginTop: 10 }]}>
                            {week.map((dayObj, i) => {
                                const isSelected = selectedDate &&
                                    selectedDate.getDate() === dayObj.day &&
                                    selectedDate.getMonth() === currentDate.getMonth() &&
                                    selectedDate.getFullYear() === currentDate.getFullYear() &&
                                    dayObj.isCurrentMonth;

                                const today = new Date();
                                const isPast = dayObj.isCurrentMonth && 
                                               currentDate.getFullYear() === today.getFullYear() &&
                                               currentDate.getMonth() === today.getMonth() &&
                                               dayObj.day < today.getDate();

                                const isDisabled = !dayObj.isCurrentMonth || isPast;

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.dateCell, isSelected && styles.activeDateCell]}
                                        onPress={() => {
                                            if (!isDisabled) {
                                                setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObj.day));
                                                setStep(2);
                                            }
                                        }}
                                        disabled={isDisabled}
                                    >
                                        <Text style={[
                                            styles.dateText,
                                            isSelected && styles.activeDateText,
                                            isDisabled && styles.inactiveDateText
                                        ]}>
                                            {dayObj.day.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderTimes = () => (
        <View style={styles.timesContainer}>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
                <Feather name="arrow-left" size={30} color="#F14C8B" />
            </TouchableOpacity>

            <View style={styles.availableHeader}>
                <Feather name="clock" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.availableTitle}>HORARIOS DISPONIBLES:</Text>
            </View>

            <View style={styles.timeSlots}>
                {timeSlots.map((time, i) => {
                    const isSelected = selectedTime === time;
                    const isBooked = bookedTimes.includes(time);
                    return (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.timeSlot,
                                isSelected && styles.activeTimeSlot,
                                isBooked && { backgroundColor: 'rgba(56,56,56,0.3)', borderColor: 'transparent' }
                            ]}
                            disabled={isBooked}
                            onPress={() => {
                                setSelectedTime(time);
                                setStep(3);
                            }}
                        >
                            <Feather name="clock" size={16} color={isSelected ? "#FFFFFF" : isBooked ? "#555" : "#898989"} style={{ marginRight: 8 }} />
                            <Text style={[
                                styles.timeText,
                                isSelected && styles.activeTimeText,
                                isBooked && { color: '#555', textDecorationLine: 'line-through' }
                            ]}>{time}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const getConfirmationText = () => {
        if (!selectedDate) return '';
        const dayOfWeek = dayNamesEs[selectedDate.getDay()];
        const dayNumStr = selectedDate.getDate().toString().padStart(2, '0');
        const monthStr = monthNamesEs[selectedDate.getMonth()];
        const yearStr = selectedDate.getFullYear();
        return `Confirmacion de\nagendamiento\npara el ${dayOfWeek} ${dayNumStr} de\n${monthStr} de ${yearStr}\na las ${selectedTime}.`;
    };

    const [clientName, setClientName] = useState('Invitado');

    useEffect(() => {
        Storage.getItem('userName').then(name => {
            if (name) setClientName(name);
        });
    }, []);

    const renderConfirmation = () => (
        <View style={styles.confirmationContainer}>
            <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
                <Feather name="arrow-left" size={30} color="#F14C8B" />
            </TouchableOpacity>

            <LinearGradient colors={['#F14C8B', '#a82d59']} style={styles.card}>
                <Feather name="calendar" size={60} color="#FFFFFF" style={styles.cardIcon} />
                <Text style={styles.cardText}>{getConfirmationText()}</Text>
                <Text style={styles.clientText}>CLIENTE: {clientName}</Text>

                <TouchableOpacity style={styles.btnConfirm} onPress={async () => {
                    const userId = await Storage.getItem('userId');
                    if (!userId) {
                        alert('Por favor vuelve al inicio y regístrate para poder agendar tu cita.');
                        return;
                    }
                    const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
                    try {
                        const response = await fetch(`${API_URL}/api/appointments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date: dateStr, time: selectedTime, userId })
                        });
                        const data = await response.json();
                        if (data.success) {
                            setStep(4);
                        } else {
                            alert(data.error);
                            setStep(2);
                        }
                    } catch (e) {
                        alert('Error de conexión con el backend.');
                    }
                }}>
                    <LinearGradient colors={['#7a1a3a', '#4a0d22']} style={styles.btnGradientInner}>
                        <Text style={styles.btnConfirmText}>Confirmar</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnReschedule} onPress={() => setStep(1)}>
                    <LinearGradient colors={['#7a1a3a', '#4a0d22']} style={styles.btnGradientInner}>
                        <Text style={styles.btnRescheduleText}>Remarcar</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    const renderSuccess = () => (
        <View style={styles.confirmationContainer}>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
                <Feather name="arrow-left" size={30} color="#F14C8B" />
            </TouchableOpacity>

            <LinearGradient colors={['#84CC16', '#4D7C0F']} style={styles.card}>
                <Feather name="calendar" size={60} color="#FFFFFF" style={styles.cardIcon} />
                <Text style={styles.cardText}>{getConfirmationText()}</Text>
                <Text style={styles.clientText}>CLIENTE: {clientName}</Text>
            </LinearGradient>

            <View style={styles.successIconWrapper}>
                <Feather name="check" size={50} color="#FFFFFF" />
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {step === 1 && renderCalendar()}
            {step === 2 && renderTimes()}
            {step === 3 && renderConfirmation()}
            {step === 4 && renderSuccess()}
            {step === 5 && renderMyAppointments()}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    calendarContainer: {
        marginTop: 10,
    },
    timesContainer: {
        marginTop: 0,
    },
    confirmationContainer: {
        marginTop: 0,
    },
    backButton: {
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(56, 56, 56, 0.8)',
        padding: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    monthText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    calendarGrid: {
        backgroundColor: 'rgba(56, 56, 56, 0.8)',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 15,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayText: {
        color: '#FFFFFF',
        fontSize: 14,
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    dateCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 20,
    },
    activeDateCell: {
        backgroundColor: '#84CC16', // green
    },
    dateText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    activeDateText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    inactiveDateText: {
        color: '#898989',
    },
    availableHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#4d7c0f',
        padding: 15,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
    },
    availableTitle: {
        color: '#84CC16',
        fontWeight: 'bold',
        fontSize: 16,
    },
    timeSlots: {
        backgroundColor: 'rgba(56, 56, 56, 0.8)',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        gap: 10,
    },
    timeSlot: {
        flexDirection: 'row',
        backgroundColor: '#2D2D2D',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    activeTimeSlot: {
        backgroundColor: '#84CC16',
        borderColor: '#84CC16',
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    activeTimeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    card: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    cardIcon: {
        marginBottom: 20,
    },
    cardText: {
        color: '#FFFFFF',
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 28,
        marginBottom: 30,
    },
    clientText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
    },
    btnConfirm: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    btnGradientInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnConfirmText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnReschedule: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    btnRescheduleText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
    },
    successIconWrapper: {
        backgroundColor: '#84CC16',
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    }
});
