import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/buttom';
import InputText from '../components/inputText';
import { API_URL } from '../config';
import Storage from '../storage';


export default function RegisterScreen({ navigateTo }) {
    const [identifier, setIdentifier] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <LinearGradient
            colors={['#898989', '#F14C8B']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Crea tu cuenta</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nombre Completo</Text>
                    <InputText
                        placeholder="Ingresa tu nombre"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Número de Celular</Text>
                    <InputText
                        prefix="+57  |"
                        placeholder="ej. 123.."
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Correo Electrónico (Para iniciar sesión)</Text>
                    <InputText
                        placeholder="tuemail@example.com"
                        value={identifier}
                        onChangeText={setIdentifier}
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Contraseña</Text>
                    <InputText
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        onChangeText={setPassword}
                        isPassword={true}
                    />

                    <Text style={styles.label}>Confirmar contraseña</Text>
                    <InputText
                        placeholder="Confirma tu contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        isPassword={true}
                    />
                </View>

                <View style={{ marginTop: 20 }}>
                    <CustomButton
                        title="Registrarse"
                        onPress={async () => {
                            if (!identifier || !name || !phone || !password || password !== confirmPassword) {
                                alert('Verifica todos los campos y que las contraseñas coincidan');
                                return;
                            }
                            try {
                                const response = await fetch(`${API_URL}/api/register`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ identifier, name, phone, password })
                                });
                                const data = await response.json();
                                if (data.success) {
                                    await Storage.setItem('userId', String(data.userId));
                                    await Storage.setItem('userName', data.name || name);
                                    navigateTo('Dashboard');
                                } else {
                                    alert(data.error || 'Error al registrarse');
                                }
                            } catch (e) {
                                alert('Error al conectar con el servidor. Verifica tu conexión.');
                            }
                        }}
                    />
                </View>

                <TouchableOpacity onPress={() => navigateTo('Welcome')} style={styles.backButton}>
                    <Text style={styles.backText}>Cancelar</Text>
                </TouchableOpacity>

            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 80,
        paddingBottom: 40,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 30,
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: '#D1D5DB', // light gray
        borderRadius: 25,
        width: '80%',
        height: 45,
        marginBottom: 30,
        padding: 2,
    },
    segmentButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 23,
    },
    segmentActive: {
        backgroundColor: '#C61056', // Active color from the logo
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    segmentText: {
        color: '#6B7280', // Text color when inactive
        fontWeight: '600',
    },
    segmentTextActive: {
        color: '#FFFFFF',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 10,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 12,
        marginTop: 15,
        marginBottom: 8,
        marginLeft: 20,
    },
    backButton: {
        marginTop: 15,
        padding: 10,
    },
    backText: {
        color: '#FFFFFF',
        textDecorationLine: 'underline',
    }
});
