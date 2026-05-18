import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/buttom';
import InputText from '../components/inputText';
import { API_URL } from '../config';
import Storage from '../storage';


export default function LoginScreen({ navigateTo }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    return (
        <LinearGradient
            colors={['#898989', '#F14C8B']}
            style={styles.container}
        >
            <View style={styles.content}>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
                    <Text style={styles.subtitlePhrase}>¡Estamos encantados de tenerte de nuevo!</Text>
                </View>



                <View style={styles.inputContainer}>

                    <Text style={styles.subtitle}>INFORMACIÓN DE LA CUENTA</Text>
                    <InputText
                        placeholder="Correo electrónico o número de teléfono"
                        value={identifier}
                        onChangeText={setIdentifier}
                    />
                    <View style={{ height: 15 }} />
                    <InputText
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        isPassword={true}
                    />
                    <CustomButton style={styles.buttonEnter}
                        title="Entrar"
                        onPress={async () => {
                            if (identifier === 'admin' && password === 'admin') {
                                navigateTo('Admin');
                                return;
                            }
                            if (!identifier || !password) {
                                alert('Por favor ingresa usuario y contraseña');
                                return;
                            }
                            try {
                                const response = await fetch(`${API_URL}/api/login`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ identifier, password })
                                });
                                const data = await response.json();
                                if (data.success) {
                                    await Storage.setItem('userId', String(data.userId));
                                    await Storage.setItem('userName', data.name || '');
                                    navigateTo('Dashboard');
                                } else {
                                    alert(data.error || 'Credenciales inválidas');
                                }
                            } catch (e) {
                                alert('Error al conectar con el servidor. Verifica tu conexión.');
                            }
                        }}
                    />

                </View>


                <TouchableOpacity onPress={() => navigateTo('ResetPassword')}>
                    <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>O entra con</Text>
                    <View style={styles.divider} />
                </View>

                <TouchableOpacity style={styles.googleButton}>
                    <AntDesign name="google" size={30} color="#DB4437" />
                </TouchableOpacity>

            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonEnter: {
        marginTop: 50,
        width: 'auto',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 28,
    },
    subtitlePhrase: {
        paddingBottom: 50,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'semibold',
        textAlign: 'center',
        lineHeight: 'auto',
    },
    subtitle: {
        color: '#FFFFFF',
        fontSize: 12,
        alignSelf: 'flex-start',
        marginBottom: 10,
        letterSpacing: 1,
    },

    forgotPassword: {
        color: '#FFFFFF',
        marginTop: 20,
        textDecorationLine: 'underline',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
        width: '80%',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    dividerText: {
        color: '#FFFFFF',
        marginHorizontal: 10,
        fontSize: 14,
    },
    googleButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    googleIcon: {
        width: 30,
        height: 30,
    }
});
