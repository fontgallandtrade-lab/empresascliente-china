import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createDelivery,
  type DeliveryPayload,
  type QuoteResult,
} from '../services/delivery.service';

function money(value: number): string {
  return Number(value || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  );
}

export default function ResumoEntregaScreen() {
  const params = useLocalSearchParams<{
    payload?: string;
    quote?: string;
  }>();

  const [creating, setCreating] =
    useState(false);

  const payload = useMemo(() => {
    try {
      return JSON.parse(
        String(params.payload || ''),
      ) as DeliveryPayload;
    } catch {
      return null;
    }
  }, [params.payload]);

  const quote = useMemo(() => {
    try {
      return JSON.parse(
        String(params.quote || ''),
      ) as QuoteResult;
    } catch {
      return null;
    }
  }, [params.quote]);

  async function handleCreate() {
    if (!payload || !quote) {
      Alert.alert(
        'Dados inválidos',
        'Não foi possível carregar o resumo da entrega.',
      );

      return;
    }

    try {
      setCreating(true);

      const response =
        await createDelivery(payload);

      const navigationParams = {
        deliveryId: String(response.delivery.id),
        publicCode: response.delivery.public_code,
        pickupCode: response.delivery.pickup_code,
        deliveryCode: response.delivery.delivery_code,
        total: money(
          response.delivery.quote.total_price,
        ),
      };

      if (payload.payment_method === 'pix') {
        router.replace({
          pathname: '/pagamento-pix',
          params: navigationParams,
        } as any);
        return;
      }

      router.replace({
        pathname: '/entrega-criada',
        params: navigationParams,
      } as any);
    } catch (error: any) {
      Alert.alert(
        'Erro ao solicitar entrega',
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível criar a entrega.',
      );
    } finally {
      setCreating(false);
    }
  }

  if (!payload || !quote) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>
          Resumo indisponível
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            VOLTAR AO PEDIDO
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pickupAddress = [
    payload.pickup.street,
    payload.pickup.number,
    payload.pickup.neighborhood,
    payload.pickup.city,
  ]
    .filter(Boolean)
    .join(', ');

  const destinationAddress = [
    payload.destination.street,
    payload.destination.number,
    payload.destination.neighborhood,
    payload.destination.city,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f5f6f8"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.back}>
            ← Alterar dados
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Resumo da entrega
        </Text>

        <Text style={styles.description}>
          Confira os dados e o valor antes de solicitar.
        </Text>

        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>
            RETIRADA
          </Text>

          <Text style={styles.addressName}>
            {payload.pickup.recipient_name}
          </Text>

          <Text style={styles.addressText}>
            {pickupAddress}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.addressLabel}>
            ENTREGA
          </Text>

          <Text style={styles.addressName}>
            {payload.destination.recipient_name}
          </Text>

          <Text style={styles.addressText}>
            {destinationAddress}
          </Text>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>
            Cálculo da corrida
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Tipo</Text>
            <Text style={styles.value}>
              {quote.same_city
                ? 'Urbana'
                : 'Intermunicipal'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Distância de ida
            </Text>

            <Text style={styles.value}>
              {quote.route_distance_km} km
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Tempo estimado
            </Text>

            <Text style={styles.value}>
              {quote.estimated_duration_minutes || 0} min
            </Text>
          </View>

          {!quote.same_city && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Ida e retorno
              </Text>

              <Text style={styles.value}>
                {quote.billable_distance_km} km
              </Text>
            </View>
          )}

          {quote.base_fee > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Taxa-base
              </Text>

              <Text style={styles.value}>
                {money(quote.base_fee)}
              </Text>
            </View>
          )}

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              {money(quote.total_price)}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={creating}
            onPress={handleCreate}
            style={[
              styles.confirmButton,
              creating &&
                styles.confirmButtonDisabled,
            ]}
          >
            {creating ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.confirmText}>
                CONFIRMAR E SOLICITAR ENTREGA
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  center: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  back: {
    color: '#f26522',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 22,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '900',
  },
  description: {
    color: '#6b7280',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
    marginBottom: 24,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
  },
  addressLabel: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '800',
  },
  addressName: {
    color: '#111827',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 7,
  },
  addressText: {
    color: '#6b7280',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  quoteCard: {
    backgroundColor: '#17202d',
    borderRadius: 26,
    padding: 24,
  },
  quoteTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 15,
  },
  label: {
    color: '#d1d5db',
    fontSize: 16,
    flex: 1,
  },
  value: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 13,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  totalValue: {
    color: '#ff6a00',
    fontSize: 34,
    fontWeight: '900',
  },
  confirmButton: {
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: '#ff641f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  confirmButtonDisabled: {
    opacity: 0.65,
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 25,
  },
  backButton: {
    backgroundColor: '#ff641f',
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
});
