/**
 * Storage universal: AsyncStorage en nativo, localStorage en web.
 * Usar getItem/setItem/removeItem como si fuera localStorage,
 * pero retorna Promises para ser compatible con AsyncStorage.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = {
    async getItem(key) {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await AsyncStorage.getItem(key);
    },
    async setItem(key, value) {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        await AsyncStorage.setItem(key, String(value));
    },
    async removeItem(key) {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        await AsyncStorage.removeItem(key);
    },
};

export default Storage;
