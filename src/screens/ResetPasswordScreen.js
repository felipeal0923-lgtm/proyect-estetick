import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/buttom';

export default function ResetPasswordScreen({ navigateTo }) {
    const [code, setCode] = useState(['', '', '', '']);

    const handleChange = (text, index) => {
        // Solo permitir números
        const digit = text.replace(/[^0-9]/g, '');
        if (digit.length > 0 || text === '') {
            let newCode = [...code];
            newCode[index] = digit.substring(digit.length - 1);
            setCode(newCode);
        }
    };

    return (
        <LinearGradient
            colors={['#898989', '#F14C8B']}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Redefine password</Text>

                <Text style={styles.subtitle}>
                    A reset code has been sent{"\n"}to your email or phone number
                </Text>

                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <View key={index} style={styles.inputWrapper}>
                            <TextInput
                                style={styles.codeInput}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                            />
                        </View>
                    ))}
                </View>

                <Text style={styles.putCodeText}>put the code</Text>

                <View style={styles.buttonWrapper}>
                    <CustomButton
                        title="Redefine password"
                        onPress={() => navigateTo('Login')}
                    />
                </View>

                <TouchableOpacity onPress={() => navigateTo('Login')} style={styles.backButton}>
                    <Text style={styles.backText}>Cancel</Text>
                </TouchableOpacity>

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
    title: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        color: '#E5E7EB',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        width: '100%',
        paddingHorizontal: 20,
    },
    inputWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        width: 50,
        height: 60,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    codeInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        width: '100%',
        height: '100%',
    },
    putCodeText: {
        color: '#FFFFFF',
        fontSize: 12,
        marginBottom: 40,
        marginTop: 10,
    },
    buttonWrapper: {
        width: '100%',
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
