import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NovaEntregaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Solicitar entrega</Text>

        <Text style={styles.description}>
          Nesta tela vamos cadastrar o endereço de coleta, destino,
          pacote e calcular o valor da corrida.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  content: {
    padding: 24,
  },

  back: {
    color: '#f26522',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 30,
  },

  title: {
    color: '#17202a',
    fontSize: 28,
    fontWeight: '900',
  },

  description: {
    color: '#6b7280',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
});
