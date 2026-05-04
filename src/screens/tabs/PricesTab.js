import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function PricesTab() {
    const [prices, setPrices] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('home'); // 'home' o 'promos'

    useEffect(() => {
        const fetchPrices = fetch(`${API_URL}/api/prices`).then(res => res.json());
        const fetchPromos = fetch(`${API_URL}/api/promotions`).then(res => res.json());

        Promise.all([fetchPrices, fetchPromos])
            .then(([pricesData, promosData]) => {
                if (pricesData.success) setPrices(pricesData.prices);
                if (promosData.success) setPromotions(promosData.promotions);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#F14C8B" />
            </View>
        );
    }

    const currentData = viewMode === 'home' ? prices : promotions;

    return (
        <View style={styles.outerContainer}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
                {viewMode === 'promos' && (
                    <View style={styles.promoHeader}>
                        <Text style={styles.promoHeaderText}>Promociones De Lunes a Jueves</Text>

                    </View>
                )}

                <View style={styles.list}>
                    {currentData.map((item, index) => (
                        <View key={index} style={styles.itemRowWrapper}>
                            <View style={[styles.itemRow, viewMode === 'promos' && styles.itemRowPromo]}>
                                <View style={styles.accentBar} />
                                <View style={styles.itemMainInfo}>
                                    <Text style={styles.nameText}>{item.name}</Text>
                                    <View style={styles.priceCapsule}>
                                        <Text style={styles.priceText}>${item.price}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerButtons}>
                    <TouchableOpacity onPress={() => setViewMode('home')}>
                        {viewMode === 'home' ? (
                            <LinearGradient
                                colors={['#431515', '#C61056']}
                                style={styles.activeFooterBtn}
                            >
                                <Text style={styles.footerBtnText}>Precios</Text>
                            </LinearGradient>
                        ) : (
                            <View style={styles.footerBtn}>
                                <Text style={styles.footerBtnText}>Precios</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setViewMode('promos')}>
                        {viewMode === 'promos' ? (
                            <LinearGradient
                                colors={['#431515', '#C61056']}
                                style={styles.activeFooterBtn}
                            >
                                <Text style={styles.footerBtnText}>Promociones</Text>
                            </LinearGradient>
                        ) : (
                            <View style={styles.footerBtn}>
                                <Text style={styles.footerBtnText}>Promociones</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.paginationDots}>
                    <View style={[styles.dot, viewMode === 'home' && styles.activeDot]} />
                    <View style={[styles.dot, viewMode === 'promos' && styles.activeDot]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    list: {
        width: '100%',
    },
    itemRowWrapper: {
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 18,
        minHeight: 65,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#F14C8B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },

    itemMainInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    itemRowPromo: {
        minHeight: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#F14C8B',
    },
    nameText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
        letterSpacing: 0.3,
    },
    priceCapsule: {
        backgroundColor: '#F14C8B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,

    },
    priceText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    promoHeader: {
        marginBottom: 15,
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
    },
    promoHeaderText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    footer: {
        paddingBottom: 20,
        paddingTop: 10,
        alignItems: 'center',
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 15,
    },
    footerBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 15,
        height: 38,
        borderRadius: 17,
        minWidth: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeFooterBtn: {
        paddingHorizontal: 15,
        height: 38,
        borderRadius: 17,
        minWidth: 120,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#C61056',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    footerBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    paginationDots: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    activeDot: {
        backgroundColor: '#C61056',
    }
});
