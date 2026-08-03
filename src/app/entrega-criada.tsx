import { router, useLocalSearchParams } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EntregaCriadaScreen() {
  const params = useLocalSearchParams<{
    publicCode?: string;
    pickupCode?: string;
    deliveryCode?: string;
    total?: string;
  }>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F6F8"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successIcon}>
          <Text style={styles.successText}>✓</Text>
        </View>

        <Text style={styles.title}>
          Entrega solicitada!
        </Text>

        <Text style={styles.subtitle}>
          Guarde os códigos abaixo. Eles serão usados
          durante a retirada e a entrega.
        </Text>

        <View style={styles.orderCard}>
          <Text style={styles.label}>PEDIDO</Text>

          <Text style={styles.orderCode}>
            {params.publicCode || '-'}
          </Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.label}>
            CÓDIGO DE RETIRADA
          </Text>

          <Text style={styles.code}>
            {params.pickupCode || '------'}
          </Text>

          <Text style={styles.help}>
            Informe este código ao entregador somente quando ele chegar para retirar a encomenda.
          </Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.label}>
            CÓDIGO DE ENTREGA
          </Text>

          <Text style={styles.code}>
            {params.deliveryCode || '------'}
          </Text>

          <Text style={styles.help}>
            Envie este código à pessoa que receberá a encomenda. Ela deve informar ao entregador somente depois de receber o pacote.
          </Text>
        </View>

        {params.total && (
          <View style={styles.totalCard}>
            <Text style={styles.label}>TOTAL</Text>

            <Text style={styles.total}>
              {params.total}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.replace('/dashboard' as any)
          }
        >
          <Text style={styles.buttonText}>
            IR PARA O INÍCIO
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  content: {
    padding: 24,
    alignItems: 'center',
  },

  successIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#0DB690',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  successText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#171717',
    marginTop: 22,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#686868',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
  },

  orderCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },

  codeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 14,
  },

  totalCard: {
    width: '100%',
    backgroundColor: '#FFF4EA',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },

  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#777777',
    letterSpacing: 0.8,
  },

  orderCode: {
    fontSize: 20,
    fontWeight: '900',
    color: '#171717',
    marginTop: 8,
  },

  code: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FF6A00',
    letterSpacing: 6,
    marginTop: 10,
  },

  help: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6F6F6F',
    textAlign: 'center',
    marginTop: 12,
  },

  total: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FF6A00',
    marginTop: 7,
  },

  button: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 24,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
