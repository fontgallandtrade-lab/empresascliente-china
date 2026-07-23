import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CadastroScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Voltar</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Criar conta</Text>

        <Text style={styles.subtitle}>
          Como deseja utilizar o ChinaFast?
        </Text>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Pessoa Física</Text>
          <Text style={styles.cardDescription}>
            Para enviar documentos, encomendas, presentes e produtos.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Empresa</Text>
          <Text style={styles.cardDescription}>
            Para comércios, distribuidoras, farmácias, lojas e escritórios.
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 24,
  },
  back: {
    color: '#0B1F3A',
    fontSize: 17,
    marginTop: 18,
  },
  content: {
    marginTop: 44,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#172033',
  },
  subtitle: {
    color: '#667085',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#0B1F3A',
    fontSize: 21,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
});
