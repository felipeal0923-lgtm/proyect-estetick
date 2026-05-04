import { Text, Image, ActivityIndicator } from 'react-native';
import { splashStyles } from '../styles/SplashScreenStyles';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
    return (
        <LinearGradient
            colors={['#898989', '#F14C8B']}
            style={splashStyles.container}
        >
            <Image
                source={require('../../assets/LogoM.png')}
                style={splashStyles.logo}
                resizeMode="contain"
            />
            <Text style={splashStyles.subtitle}>Cargando experiencia...</Text>

            <ActivityIndicator size="large" color="#7a061fff" style={{ marginTop: 20 }} />
        </LinearGradient>
    );
}

