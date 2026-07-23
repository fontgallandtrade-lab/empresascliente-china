import { router } from 'expo-router';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1F3A" />

      <View style={styles.header}>
        <Text style={styles.logo}>ChinaFast</Text>
        <Text style={styles.subtitle}>Logística regional rápida e segura</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Envie para toda a região</Text>

        <Text style={styles.description}>
          Solicite entregas locais e intermunicipais para documentos,
          encomendas, peças, produtos e muito mais.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.primaryButtonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/cadastro')}
        >
          <Text style={styles.secondaryButtonText}>Criar conta</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Pessoa física e empresa em um só aplicativo</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 52,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
  },
  subtitle: {
    color: '#D0D5DD',
    fontSize: 16,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
  },
  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
  },
  description: {
    color: '#667085',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 18,
    marginBottom: 38,
  },
  primaryButton: {
    backgroundColor: '#F59E0B',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  secondaryButtonText: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    color: '#98A2B3',
    fontSize: 13,
    textAlign: 'center',
    paddingBottom: 24,
  },
});
