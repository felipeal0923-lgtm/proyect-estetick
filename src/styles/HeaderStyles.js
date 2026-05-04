import { StyleSheet } from 'react-native';

export const headerStyles = StyleSheet.create({
  header: {
    height: 90,
    backgroundColor: '#1e293b',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerText: {
    textAlign: 'center',
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
  }
});
