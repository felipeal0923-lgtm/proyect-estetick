import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { API_URL } from '../../config';

export default function GalleryTab() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef(null);
    const ITEM_WIDTH = 280;

    useEffect(() => {
        fetch(`${API_URL}/api/gallery`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setImages(data.images.map(img => img.url));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / ITEM_WIDTH);
        if (index >= 0 && index < images.length) {
            setActiveIndex(index);
        }
    };

    const handleDotPress = (index) => {
        setActiveIndex(index);
        scrollViewRef.current?.scrollTo({ x: index * ITEM_WIDTH, animated: true });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#F14C8B" />
            </View>
        );
    }

    if (images.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={{ color: '#DDD' }}>No hay imágenes en la galería</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
            >
                {images.map((img, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image
                            source={{ uri: img }}
                            style={styles.image}
                        />
                    </View>
                ))}
            </ScrollView>
            <View style={styles.dotsContainer}>
                {images.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleDotPress(index)}
                        style={{ padding: 5 }}
                    >
                        <View style={[styles.dot, index === activeIndex && styles.activeDot]} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    scrollView: {
        flexGrow: 0,
        height: 310,
        width: '100%',
    },
    scrollContent: {
        alignItems: 'center',
    },
    imageContainer: {
        width: 280, // Reduced size
        height: 310,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        backgroundColor: '#CCC',
        borderWidth: 2,
        borderColor: '#C61056',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
    }
});
