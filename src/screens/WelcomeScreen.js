import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/buttom';

export default function WelcomeScreen({ navigateTo }) {
    return (
        <LinearGradient
            colors={['#898989', '#F14C8B']}
            style={styles.container}
        >
            <View style={styles.content}>
                <Image
                    source={require('../../assets/LogoM.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Iniciar Sesión"
                        onPress={() => navigateTo('Login')}
                    />
                    <CustomButton
                        title="Registrarse"
                        onPress={() => navigateTo('Register')}
                    />
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 250,
        height: 250,
        marginBottom: 20,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
        letterSpacing: 2,
    },
    buttonContainer: {
        width: '100%',
    }
});
