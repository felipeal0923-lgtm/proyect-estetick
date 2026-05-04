import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { View, Image, StyleSheet, Pressable, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import ImagePerfil from './ImagePerfil';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../config';

export default function Header({ onNavigate, unreadCount, onPressNoti }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileImage, setProfileImage] = useState('https://i.pravatar.cc/150?u=antigravity');

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedImage = localStorage.getItem('profileImage');
      if (savedImage && !savedImage.startsWith('blob:')) {
        setProfileImage(savedImage);
      }
    }
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);

      // Solo guardamos en localStorage si NO es una URL temporal de navegador (blob)
      if (typeof localStorage !== 'undefined' && !uri.startsWith('blob:')) {
        localStorage.setItem('profileImage', uri);
      }
    }
  };

  const menuOptions = [
    { id: 1, label: 'Mis Agendas' },
    { id: 2, label: 'Mi Perfil' },
    { id: 3, label: 'Salir' },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Image
              source={require('../img/icons/Union.png')}
              style={styles.iconsMenu}
              resizeMode="contain"
            />
          </Pressable>

          <TouchableOpacity
            onPress={onPressNoti}
            style={{ marginLeft: 15, position: 'relative' }}
          >
            <Feather name="bell" size={24} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '+9' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>


        <View style={[styles.logoContainer, { pointerEvents: 'none' }]}>
          <Image
            source={require('../img/icons/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>


        <TouchableOpacity onPress={pickImage}>
          <ImagePerfil
            imageUrl={profileImage}
          />
        </TouchableOpacity>
      </View>



      {/* Menú Desplegable */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setMenuVisible(false)}
        >

          <LinearGradient
            colors={['#898989', '#F14C8B']}
            style={styles.menuContainer}
          >
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  if ((option.id === 1 || option.id === 2) && typeof onNavigate === 'function') {
                    onNavigate(3);
                  } else if (option.id === 3) {
                    if (typeof localStorage !== 'undefined') {
                      localStorage.removeItem('userId');
                      localStorage.removeItem('userName');
                      window.location.reload();
                    }
                  }
                }}
              >
                <Text style={styles.menuLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </Pressable>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 110,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
  },
  menuButton: {
    padding: 10,
    marginLeft: -10,
  },
  iconsMenu: {
    width: 30,
    height: 20,

  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  logo: {
    width: 184,
    height: 182,
    justifyContent: 'center',

  },

  // Estilos del Menú
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    borderRadius: 15,
    padding: 10,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F14C8B',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiContainer: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notiTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notiItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  unreadNoti: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
  },
  notiText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 5,
  },
  notiDate: {
    color: '#FFF',
    fontSize: 11,
  },
  emptyNoti: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
  }
});
