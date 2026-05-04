import React from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const MenuOption = ({ title, isActive, onPress }) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [
            styles.optionWrapper,
            pressed && styles.pressed
        ]}
    >
        {isActive ? (
            <LinearGradient
                colors={['#431515', '#C61056']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.activeGradient}
            >
                <Text style={[styles.optionText, styles.activeOptionText]}>
                    {title}
                </Text>
            </LinearGradient>
        ) : (
            <View style={styles.inactiveWrapper}>
                <Text style={styles.optionText}>
                    {title}
                </Text>
            </View>
        )}
    </Pressable>
);

export default function Menu({ activeIndex, onSetActiveIndex }) {
    const options = [
        { id: 'schedule', title: 'Horarios' },
        { id: 'fixed-price', title: 'Precios' },
        { id: 'photo-gallery', title: 'Galeria' }
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.menuBar}
            >
                {options.map((option, index) => (
                    <MenuOption
                        key={option.id}
                        title={option.title}
                        isActive={activeIndex === index}
                        onPress={() => onSetActiveIndex(index)}
                    />
                ))}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 10,
        backgroundColor: 'transparent',
        boxShadow: 'inset 0 10px 17px -8px #ffffff',
    },
    menuBar: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        width: 'auto',
        paddingVertical: 12,
        paddingHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },

    optionWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },

    optionText: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '700',
        textAlign: 'center',
    },
    activeOptionText: {
        color: '#FFFFFF',
        fontWeight: 700,
        textShadowColor: 'rgba(255, 255, 255, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    activeGradient: {
        width: 120,
        height: 40,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#C61056',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    inactiveWrapper: {
        width: 120,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notiOption: {
        width: 50,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    notiIconWrapper: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#F14C8B',
        borderRadius: 9,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
