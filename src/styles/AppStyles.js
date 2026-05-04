import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,

  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  }
});
