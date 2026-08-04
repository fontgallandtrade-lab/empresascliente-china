import { router } from 'expo-router';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getMyDeliveries,
  type CustomerDelivery,
} from '../services/delivery.service';

type ScreenMode =
  | 'active'
  | 'history';

type Props = {
  mode: ScreenMode;
};

const activeStatuses = new Set([
  'searching_driver',
  'accepted',
  'driver_going_to_pickup',
  'arrived_at_pickup',
  'picked_up',
  'in_transit',
  'arrived_at_destination',
]);

const historyStatuses = new Set([
  'delivered',
  'cancelled',
  'canceled',
]);

const statusLabels:
Record<string, string> = {
  searching_driver:
    'Procurando entregador',
  accepted:
    'Entregador aceitou',
  driver_going_to_pickup:
    'Entregador indo à coleta',
  arrived_at_pickup:
    'Entregador chegou à coleta',
  picked_up:
    'Encomenda coletada',
  in_transit:
    'Em trânsito',
  arrived_at_destination:
    'Chegou ao destino',
  delivered:
    'Entregue',
  cancelled:
    'Cancelada',
  canceled:
    'Cancelada',
};

function money(value: number | string): string {
  return Number(value || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function address(
  street: string,
  number: string,
  neighborhood: string,
  city: string,
): string {
  return [
    street,
    number,
    neighborhood,
    city,
  ]
    .filter(Boolean)
    .join(', ');
}

export default function CustomerDeliveriesScreen({
  mode,
}: Props) {
  const [deliveries, setDeliveries] =
    useState<CustomerDelivery[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const title =
    mode === 'active'
      ? 'Acompanhar entregas'
      : 'Histórico';

  const emptyMessage =
    mode === 'active'
      ? 'Você não possui entregas em andamento.'
      : 'Você ainda não possui entregas finalizadas.';

  const loadDeliveries =
    useCallback(async () => {
      try {
        setError(null);

        const allDeliveries =
          await getMyDeliveries();

        const filtered =
          allDeliveries.filter(
            delivery =>
              mode === 'active'
                ? activeStatuses.has(
                    delivery.status,
                  )
                : historyStatuses.has(
                    delivery.status,
                  ),
          );

        setDeliveries(filtered);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Não foi possível carregar as entregas.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [mode]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDeliveries();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f4f6f8"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {title}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#f26522"
          />

          <Text style={styles.loadingText}>
            Carregando entregas...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            deliveries.length === 0 &&
              styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#f26522']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.messageCard}>
              <Text style={styles.errorText}>
                {error}
              </Text>

              <TouchableOpacity
                onPress={loadDeliveries}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>
                  TENTAR NOVAMENTE
                </Text>
              </TouchableOpacity>
            </View>
          ) : deliveries.length === 0 ? (
            <View style={styles.messageCard}>
              <Text style={styles.emptyIcon}>
                {mode === 'active'
                  ? '🛵'
                  : '🧾'}
              </Text>

              <Text style={styles.emptyTitle}>
                Nenhuma entrega
              </Text>

              <Text style={styles.emptyText}>
                {emptyMessage}
              </Text>

              {mode === 'active' && (
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      '/nova-entrega' as any,
                    )
                  }
                  style={styles.newDeliveryButton}
                >
                  <Text
                    style={
                      styles.newDeliveryText
                    }
                  >
                    SOLICITAR ENTREGA
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            deliveries.map(delivery => (
              <View
                key={delivery.id}
                style={styles.deliveryCard}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.codeLabel}>
                      PEDIDO
                    </Text>

                    <Text style={styles.code}>
                      {delivery.public_code}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text
                      style={styles.statusText}
                    >
                      {statusLabels[
                        delivery.status
                      ] || delivery.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeRow}>
                  <View
                    style={[
                      styles.routeDot,
                      styles.pickupDot,
                    ]}
                  />

                  <View style={styles.routeContent}>
                    <Text
                      style={styles.routeLabel}
                    >
                      RETIRADA
                    </Text>

                    <Text
                      style={styles.routeAddress}
                    >
                      {address(
                        delivery.pickup_street,
                        delivery.pickup_number,
                        delivery
                          .pickup_neighborhood,
                        delivery.pickup_city,
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routeRow}>
                  <View
                    style={[
                      styles.routeDot,
                      styles.destinationDot,
                    ]}
                  />

                  <View style={styles.routeContent}>
                    <Text
                      style={styles.routeLabel}
                    >
                      ENTREGA
                    </Text>

                    <Text
                      style={styles.routeAddress}
                    >
                      {address(
                        delivery
                          .destination_street,
                        delivery
                          .destination_number,
                        delivery
                          .destination_neighborhood,
                        delivery
                          .destination_city,
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View>
                    <Text style={styles.infoLabel}>
                      Criada em
                    </Text>

                    <Text style={styles.infoValue}>
                      {formatDate(
                        delivery.created_at,
                      )}
                    </Text>
                  </View>

                  <View style={styles.priceArea}>
                    <Text style={styles.infoLabel}>
                      Valor
                    </Text>

                    <Text style={styles.price}>
                      {money(
                        delivery.total_price,
                      )}
                    </Text>
                  </View>
                </View>

                {mode === 'active' && (
                  <View
                    style={
                      styles.progressContainer
                    }
                  >
                    <Text
                      style={
                        styles.progressTitle
                      }
                    >
                      Situação atual
                    </Text>

                    <Text
                      style={
                        styles.progressStatus
                      }
                    >
                      {statusLabels[
                        delivery.status
                      ] || delivery.status}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    minHeight: 74,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#17202a',
    fontSize: 38,
    lineHeight: 40,
  },
  title: {
    flex: 1,
    color: '#17202a',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 20,
    paddingBottom: 45,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 14,
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    color: '#17202a',
    fontSize: 22,
    fontWeight: '900',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
    lineHeight: 21,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#f26522',
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  newDeliveryButton: {
    marginTop: 22,
    backgroundColor: '#f26522',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  newDeliveryText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  deliveryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 17,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  codeLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '800',
  },
  code: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  statusBadge: {
    maxWidth: '55%',
    backgroundColor: '#fff0e7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    color: '#d85718',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginTop: 4,
    marginRight: 14,
  },
  pickupDot: {
    backgroundColor: '#169b62',
  },
  destinationDot: {
    backgroundColor: '#f26522',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#d1d5db',
    marginLeft: 5.5,
    marginVertical: 3,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '900',
  },
  routeAddress: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  priceArea: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#f26522',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  progressContainer: {
    backgroundColor: '#eef9f3',
    borderRadius: 15,
    padding: 15,
    marginTop: 17,
  },
  progressTitle: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '700',
  },
  progressStatus: {
    color: '#16834f',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
  },
});
