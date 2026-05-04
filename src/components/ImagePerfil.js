import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function ImagePerfil({ imageUrl }) {
  const defaultImage = 'https://via.placeholder.com/150'; // Placeholder premium

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl || defaultImage }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
    borderColor: 'none',
    backgroundColor: '#525252',
  },
  image: {
    width: 50,
    height: 50,
  },
});
