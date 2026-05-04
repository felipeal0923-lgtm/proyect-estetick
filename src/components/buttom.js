import { Pressable, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomButton({ title, onPress, style }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.buttonContainer,
                { opacity: pressed ? 0.7 : 1 },
                style
            ]}
        >
            <LinearGradient
                colors={['#383838', '#C61056']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <Text style={styles.text}>{title}</Text>
            </LinearGradient>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: 30,
        overflow: 'hidden',
        marginHorizontal: 20,
        height: 52,
        marginVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 10,
    },

    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
});
