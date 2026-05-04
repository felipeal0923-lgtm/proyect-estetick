import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function InputText({ placeholder, value, onChangeText, style, isPassword, prefix, keyboardType }) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleTextChange = (text) => {
        if (keyboardType === 'numeric' || keyboardType === 'number-pad' || keyboardType === 'phone-pad') {
            // Filtrar para que solo entren números
            const filtered = text.replace(/[^0-9]/g, '');
            onChangeText(filtered);
        } else {
            onChangeText(text);
        }
    };

    return (
        <View style={[styles.container, style]}>
            {prefix && <Text style={styles.prefix}>{prefix}</Text>}
            <TextInput
                style={[styles.input, prefix && { paddingHorizontal: 10 }]}
                placeholder={placeholder}
                placeholderTextColor="#ffffff"
                value={value}
                onChangeText={handleTextChange}
                secureTextEntry={isPassword && !isPasswordVisible}
                keyboardType={keyboardType || 'default'}
            />
            {isPassword && (
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                    <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={24} color="#ffffff" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        width: 290,
        backgroundColor: '#525252',
        borderRadius: 10,
        alignSelf: 'center',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 20,
        color: '#ffffff',
        outlineStyle: 'none',
        fontSize: 14,
    },
    prefix: {
        color: '#ffffff',
        paddingLeft: 20,
        fontSize: 14,
        fontWeight: 'bold',
    },
    eyeIcon: {
        padding: 10,
    }
});