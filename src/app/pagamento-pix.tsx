import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createPixPayment,
  getDeliveryDetails,
  type PixPaymentResponse,
} from '../services/delivery.service';

type PixData = PixPaymentResponse['payment'];

export default function PagamentoPixScreen() {
  const params = useLocalSearchParams<{
    deliveryId?: string;
    publicCode?: string;
    pickupCode?: string;
    deliveryCode?: string;
    total?: string;
  }>();

  const deliveryId = Number(params.deliveryId || 0);
  const [pix, setPix] = useState<PixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const redirectingRef = useRef(false);

  const generatePix = useCallback(async () => {
    if (!deliveryId) {
      setError('Pedido inválido.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await createPixPayment(deliveryId);
      setPix(response.payment);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Não foi possível gerar o PIX.',
      );
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    generatePix();
  }, [generatePix]);

  useEffect(() => {
    if (!deliveryId || paymentConfirmed) {
      return;
    }

    let active = true;

    async function checkPayment() {
      try {
        const delivery =
          await getDeliveryDetails(deliveryId);

        if (
          active &&
          String(delivery.payment_status).toLowerCase() === 'paid' &&
          !redirectingRef.current
        ) {
          redirectingRef.current = true;
          setPaymentConfirmed(true);

          setTimeout(() => {
            continueToDelivery();
          }, 1200);
        }
      } catch {
        // Mantém a tela funcionando mesmo se uma consulta temporária falhar.
      }
    }

    checkPayment();

    const interval = setInterval(
      checkPayment,
      3000,
    );

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [deliveryId, paymentConfirmed]);

  async function copyPix() {
    if (!pix?.pix_payload) return;
    await Clipboard.setStringAsync(pix.pix_payload);
    Alert.alert('PIX copiado', 'Código Pix copia e cola copiado com sucesso.');
  }

  function continueToDelivery() {
    router.replace({
      pathname: '/entrega-criada',
      params: {
        deliveryId: String(deliveryId),
        publicCode: params.publicCode || '',
        pickupCode: params.pickupCode || '',
        deliveryCode: params.deliveryCode || '',
        total: params.total || '',
      },
    } as any);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6f8" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>PAGAMENTO</Text>
        <Text style={styles.title}>Pague com PIX</Text>
        <Text style={styles.subtitle}>
          O entregador receberá a corrida após a confirmação do pagamento.
        </Text>

        <View style={styles.card}>
          <Text style={styles.codeLabel}>PEDIDO</Text>
          <Text style={styles.codeValue}>{params.publicCode || '-'}</Text>
          <Text style={styles.amountLabel}>TOTAL</Text>
          <Text style={styles.amount}>{params.total || 'R$ 0,00'}</Text>

          {paymentConfirmed ? (
            <View style={styles.confirmedBox}>
              <Text style={styles.confirmedIcon}>✓</Text>
              <Text style={styles.confirmedTitle}>
                Pagamento confirmado
              </Text>
              <Text style={styles.confirmedText}>
                Sua corrida foi liberada para os entregadores.
              </Text>
              <ActivityIndicator
                size="small"
                color="#22c55e"
                style={{ marginTop: 16 }}
              />
            </View>
          ) : loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#ff641f" />
              <Text style={styles.loadingText}>Gerando PIX...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Não foi possível gerar o PIX</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={generatePix}>
                <Text style={styles.retryText}>TENTAR NOVAMENTE</Text>
              </TouchableOpacity>
            </View>
          ) : pix ? (
            <>
              <View style={styles.qrBox}>
                <Image
                  source={{
                    uri: `data:image/png;base64,${pix.pix_encoded_image}`,
                  }}
                  style={styles.qr}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.status}>Status: {pix.status}</Text>

              <Text selectable style={styles.payload} numberOfLines={4}>
                {pix.pix_payload}
              </Text>

              <TouchableOpacity style={styles.copyButton} onPress={copyPix}>
                <Text style={styles.copyText}>COPIAR PIX COPIA E COLA</Text>
              </TouchableOpacity>

              {pix.expiration_date ? (
                <Text style={styles.expiration}>
                  Validade: {pix.expiration_date}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>

        {!paymentConfirmed ? (
          <Text style={styles.help}>
            Aguardando confirmação do pagamento...
            {'\n'}
            Esta tela avançará automaticamente após a confirmação do PIX.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  content: { padding: 24, paddingBottom: 48 },
  eyebrow: { color: '#ff641f', fontSize: 13, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#111827', fontSize: 32, fontWeight: '900', marginTop: 6 },
  subtitle: { color: '#6b7280', fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 22 },
  card: { backgroundColor: '#17202d', borderRadius: 26, padding: 22 },
  codeLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '800' },
  codeValue: { color: '#ffffff', fontSize: 20, fontWeight: '900', marginTop: 5 },
  amountLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '800', marginTop: 18 },
  amount: { color: '#ff6a00', fontSize: 38, fontWeight: '900', marginTop: 2 },
  loadingBox: { alignItems: 'center', paddingVertical: 42, gap: 12 },
  loadingText: { color: '#d1d5db', fontSize: 15, fontWeight: '700' },
  confirmedBox: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: 12 },
  confirmedIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#22c55e', color: '#ffffff', textAlign: 'center', lineHeight: 72, fontSize: 42, fontWeight: '900' },
  confirmedTitle: { color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 18, textAlign: 'center' },
  confirmedText: { color: '#d1d5db', fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: 'center' },
  qrBox: { backgroundColor: '#ffffff', borderRadius: 20, padding: 14, alignItems: 'center', marginTop: 22 },
  qr: { width: 250, height: 250 },
  status: { color: '#86efac', textAlign: 'center', fontWeight: '800', marginTop: 15 },
  payload: { color: '#d1d5db', backgroundColor: '#0f1720', borderRadius: 14, padding: 14, marginTop: 15, fontSize: 12, lineHeight: 17 },
  copyButton: { minHeight: 58, borderRadius: 17, backgroundColor: '#ff641f', alignItems: 'center', justifyContent: 'center', marginTop: 15, paddingHorizontal: 16 },
  copyText: { color: '#ffffff', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  expiration: { color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 12 },
  errorBox: { marginTop: 24, backgroundColor: '#301b1b', borderRadius: 18, padding: 18 },
  errorTitle: { color: '#fecaca', fontSize: 18, fontWeight: '900' },
  errorText: { color: '#fca5a5', marginTop: 7, lineHeight: 20 },
  retryButton: { backgroundColor: '#ff641f', minHeight: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  retryText: { color: '#ffffff', fontWeight: '900' },
  continueButton: { minHeight: 60, borderRadius: 18, borderWidth: 2, borderColor: '#17202d', alignItems: 'center', justifyContent: 'center', marginTop: 20, paddingHorizontal: 16 },
  continueText: { color: '#17202d', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  help: { color: '#6b7280', textAlign: 'center', fontSize: 13, lineHeight: 19, marginTop: 14, paddingHorizontal: 8 },
});
