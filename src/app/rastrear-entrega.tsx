import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  WebView,
} from 'react-native-webview';

import {
  getDeliveryDetails,
  type TrackingDelivery,
} from '../services/delivery.service';

import {
  connectDeliveryTracking,
  disconnectDeliveryTracking,
  type DriverLocationUpdate,
} from '../services/tracking.socket';

type Coordinate = {
  latitude: number;
  longitude: number;
};

const statusLabels: Record<string, string> = {
  searching_driver: 'Procurando entregador',
  accepted: 'Entregador aceitou',
  driver_going_to_pickup:
    'Entregador indo para a coleta',
  arrived_at_pickup:
    'Entregador chegou à coleta',
  picked_up: 'Encomenda coletada',
  in_transit: 'Encomenda em trânsito',
  arrived_at_destination:
    'Entregador chegou ao destino',
  delivered: 'Entrega concluída',
  cancelled: 'Entrega cancelada',
};

function coordinate(
  latitude?: number | string | null,
  longitude?: number | string | null,
): Coordinate | null {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (
    !Number.isFinite(parsedLatitude) ||
    !Number.isFinite(parsedLongitude) ||
    parsedLatitude === 0 ||
    parsedLongitude === 0
  ) {
    return null;
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  };
}

function address(
  street?: string,
  number?: string,
  neighborhood?: string,
  city?: string,
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

export default function RastrearEntregaScreen() {
  const params = useLocalSearchParams<{
    id?: string;
  }>();

  const deliveryId =
    Number(params.id || 0);

  const [delivery, setDelivery] =
    useState<TrackingDelivery | null>(null);

  const [driverPosition, setDriverPosition] =
    useState<Coordinate | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [connected, setConnected] =
    useState(false);

  const [lastUpdate, setLastUpdate] =
    useState<string | null>(null);

  const loadDelivery = useCallback(
    async () => {
      if (!deliveryId) {
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);

        const result =
          await getDeliveryDetails(deliveryId);

        setDelivery(result);

        const storedDriverPosition =
          coordinate(
            result.driver_latitude,
            result.driver_longitude,
          );

        if (storedDriverPosition) {
          setDriverPosition(
            storedDriverPosition,
          );
        }
      } catch (error) {
        console.log(
          '[tracking] Erro ao carregar entrega:',
          error,
        );

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar esta entrega.',
        );
      } finally {
        setLoading(false);
      }
    },
    [deliveryId],
  );

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

  useEffect(() => {
    if (!deliveryId) {
      return;
    }

    const socket =
      connectDeliveryTracking(deliveryId);

    function handleConnect() {
      setConnected(true);
    }

    function handleDisconnect() {
      setConnected(false);
    }

    function handleLocation(
      update: DriverLocationUpdate,
    ) {
      if (
        Number(update.deliveryId) !==
        deliveryId
      ) {
        return;
      }

      const nextPosition = coordinate(
        update.latitude,
        update.longitude,
      );

      if (!nextPosition) {
        return;
      }

      setDriverPosition(nextPosition);

      setLastUpdate(
        new Date(
          update.timestamp || Date.now(),
        ).toLocaleTimeString(
          'pt-BR',
          {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          },
        ),
      );


    }

    function handleStatusUpdate(
      payload: {
        deliveryId?: number;
        status?: string;
      },
    ) {
      if (
        Number(payload.deliveryId) !==
        deliveryId
      ) {
        return;
      }

      setDelivery(current =>
        current
          ? {
              ...current,
              status:
                payload.status ||
                current.status,
            }
          : current,
      );
    }

    socket.on('connect', handleConnect);
    socket.on(
      'disconnect',
      handleDisconnect,
    );

    socket.on(
      'driver-location-updated',
      handleLocation,
    );

    socket.on(
      'delivery-status-updated',
      handleStatusUpdate,
    );

    setConnected(socket.connected);

    return () => {
      socket.off(
        'connect',
        handleConnect,
      );

      socket.off(
        'disconnect',
        handleDisconnect,
      );

      socket.off(
        'driver-location-updated',
        handleLocation,
      );

      socket.off(
        'delivery-status-updated',
        handleStatusUpdate,
      );

      disconnectDeliveryTracking();
    };
  }, [deliveryId]);

  if (!deliveryId) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>
          Entrega inválida
        </Text>

        <TouchableOpacity
          style={styles.backErrorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backErrorText}>
            VOLTAR
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#f26522"
        />

        <Text style={styles.loadingText}>
          Carregando rastreamento...
        </Text>
      </SafeAreaView>
    );
  }

  if (loadError || !delivery) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>
          Não foi possível carregar
        </Text>

        <Text style={styles.loadingText}>
          {loadError ||
            'Entrega não encontrada.'}
        </Text>

        <TouchableOpacity
          style={styles.backErrorButton}
          onPress={loadDelivery}
        >
          <Text style={styles.backErrorText}>
            TENTAR NOVAMENTE
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pickupPosition = coordinate(
    delivery.pickup_latitude,
    delivery.pickup_longitude,
  );

  const destinationPosition = coordinate(
    delivery.destination_latitude,
    delivery.destination_longitude,
  );

  const initialCenter =
    driverPosition ||
    pickupPosition ||
    destinationPosition || {
      latitude: -23.3509,
      longitude: -47.8465,
    };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
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

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Acompanhar entrega
          </Text>

          <Text style={styles.orderCode}>
            Pedido {delivery.public_code}
          </Text>
        </View>

        <View
          style={[
            styles.connectionBadge,
            connected
              ? styles.connectedBadge
              : styles.disconnectedBadge,
          ]}
        >
          <View
            style={[
              styles.connectionDot,
              connected
                ? styles.connectedDot
                : styles.disconnectedDot,
            ]}
          />

          <Text
            style={[
              styles.connectionText,
              connected
                ? styles.connectedText
                : styles.disconnectedText,
            ]}
          >
            {connected
              ? 'AO VIVO'
              : 'CONECTANDO'}
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          style={styles.mapWebView}
          source={{
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
  />

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />

  <style>
    html,
    body,
    #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }

    .driver-marker {
      width: 42px;
      height: 42px;
      border-radius: 21px;
      background: #17202a;
      border: 4px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 3px 8px rgba(0,0,0,.3);
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
  </script>

  <script>
    const fallbackLat = -23.3509;
    const fallbackLng = -47.8465;

    const driverLat =
      ${driverPosition?.latitude ?? 'null'};

    const driverLng =
      ${driverPosition?.longitude ?? 'null'};

    const pickupLat =
      ${pickupPosition?.latitude ?? 'null'};

    const pickupLng =
      ${pickupPosition?.longitude ?? 'null'};

    const destinationLat =
      ${destinationPosition?.latitude ?? 'null'};

    const destinationLng =
      ${destinationPosition?.longitude ?? 'null'};

    const centerLat =
      driverLat ??
      pickupLat ??
      destinationLat ??
      fallbackLat;

    const centerLng =
      driverLng ??
      pickupLng ??
      destinationLng ??
      fallbackLng;

    const map = L.map('map').setView(
      [centerLat, centerLng],
      15
    );

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; OpenStreetMap contributors'
      }
    ).addTo(map);

    const bounds = [];

    if (
      pickupLat !== null &&
      pickupLng !== null
    ) {
      const pickupMarker = L.marker(
        [pickupLat, pickupLng]
      )
        .addTo(map)
        .bindPopup('Local da coleta');

      bounds.push(
        [pickupLat, pickupLng]
      );
    }

    if (
      destinationLat !== null &&
      destinationLng !== null
    ) {
      const destinationMarker = L.marker(
        [destinationLat, destinationLng]
      )
        .addTo(map)
        .bindPopup('Destino da entrega');

      bounds.push(
        [destinationLat, destinationLng]
      );
    }

    if (
      driverLat !== null &&
      driverLng !== null
    ) {
      const driverIcon = L.divIcon({
        className: '',
        html:
          '<div class="driver-marker">🛵</div>',
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      L.marker(
        [driverLat, driverLng],
        {
          icon: driverIcon,
        }
      )
        .addTo(map)
        .bindPopup('Entregador');

      bounds.push(
        [driverLat, driverLng]
      );
    }

    if (bounds.length >= 2) {
      map.fitBounds(
        bounds,
        {
          padding: [40, 40],
        }
      );
    }
  </script>
</body>
</html>
            `,
          }}
        />
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>
              🛵
            </Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>
              SITUAÇÃO ATUAL
            </Text>

            <Text style={styles.statusValue}>
              {statusLabels[
                delivery.status
              ] || delivery.status}
            </Text>
          </View>
        </View>

        {!driverPosition ? (
          <View style={styles.waitingCard}>
            <ActivityIndicator
              size="small"
              color="#f26522"
            />

            <Text style={styles.waitingText}>
              Aguardando a primeira localização
              do entregador...
            </Text>
          </View>
        ) : (
          <View style={styles.liveCard}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              Localização sendo atualizada
              em tempo real
            </Text>
          </View>
        )}

        {lastUpdate && (
          <Text style={styles.lastUpdate}>
            Última atualização: {lastUpdate}
          </Text>
        )}

        <View style={styles.securityCodesCard}>
          <Text style={styles.securityCodesTitle}>
            Códigos de segurança
          </Text>

          <View style={styles.securityCodesRow}>
            <View style={styles.securityCodeItem}>
              <Text style={styles.securityCodeLabel}>
                RETIRADA
              </Text>

              <Text style={styles.securityCodeValue}>
                {delivery.pickup_code || '------'}
              </Text>

              <Text style={styles.securityCodeHelp}>
                Informe somente quando o entregador chegar para retirar.
              </Text>
            </View>

            <View style={styles.securityCodeDivider} />

            <View style={styles.securityCodeItem}>
              <Text style={styles.securityCodeLabel}>
                ENTREGA
              </Text>

              <Text style={styles.securityCodeValue}>
                {delivery.delivery_code || '------'}
              </Text>

              <Text style={styles.securityCodeHelp}>
                Envie este código para quem receberá a encomenda.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.routeSummary}>
          <View style={styles.routeItem}>
            <View
              style={[
                styles.routePoint,
                styles.pickupPoint,
              ]}
            />

            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>
                COLETA
              </Text>

              <Text
                style={styles.routeAddress}
                numberOfLines={2}
              >
                {address(
                  delivery.pickup_street,
                  delivery.pickup_number,
                  delivery.pickup_neighborhood,
                  delivery.pickup_city,
                )}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeItem}>
            <View
              style={[
                styles.routePoint,
                styles.destinationPoint,
              ]}
            />

            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>
                DESTINO
              </Text>

              <Text
                style={styles.routeAddress}
                numberOfLines={2}
              >
                {address(
                  delivery.destination_street,
                  delivery.destination_number,
                  delivery
                    .destination_neighborhood,
                  delivery.destination_city,
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 14,
  },
  errorTitle: {
    color: '#17202a',
    fontSize: 23,
    fontWeight: '900',
  },
  backErrorButton: {
    marginTop: 20,
    backgroundColor: '#f26522',
    borderRadius: 14,
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  backErrorText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  header: {
    minHeight: 76,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#17202a',
    fontSize: 19,
    fontWeight: '900',
  },
  orderCode: {
    color: '#7b8490',
    fontSize: 12,
    marginTop: 2,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  connectedBadge: {
    backgroundColor: '#e9f8f0',
  },
  disconnectedBadge: {
    backgroundColor: '#fff2e9',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectedDot: {
    backgroundColor: '#1aa765',
  },
  disconnectedDot: {
    backgroundColor: '#f26522',
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '900',
  },
  connectedText: {
    color: '#16824e',
  },
  disconnectedText: {
    color: '#d85718',
  },
  map: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    minHeight: 330,
    backgroundColor: '#e9eef4',
  },
  mapWebView: {
    flex: 1,
    backgroundColor: '#e9eef4',
  },
  driverMarker: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#17202a',
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
  },
  driverMarkerIcon: {
    fontSize: 25,
  },
  bottomCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 21,
    paddingTop: 20,
    paddingBottom: 26,
    marginTop: -22,
    elevation: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#fff0e7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  statusIconText: {
    fontSize: 25,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statusValue: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f3',
    borderRadius: 14,
    padding: 13,
    marginTop: 16,
  },
  waitingText: {
    flex: 1,
    color: '#7b5c49',
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 10,
  },
  liveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ebf9f2',
    borderRadius: 14,
    padding: 13,
    marginTop: 16,
  },
  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#1aa765',
    marginRight: 9,
  },
  liveText: {
    color: '#16824e',
    fontSize: 12,
    fontWeight: '800',
  },
  lastUpdate: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 8,
  },
  securityCodesCard: {
    backgroundColor: '#f7f8fa',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
  },
  securityCodesTitle: {
    color: '#17202a',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },
  securityCodesRow: {
    flexDirection: 'row',
  },
  securityCodeItem: {
    flex: 1,
  },
  securityCodeDivider: {
    width: 1,
    backgroundColor: '#dfe3e8',
    marginHorizontal: 13,
  },
  securityCodeLabel: {
    color: '#8b95a1',
    fontSize: 10,
    fontWeight: '900',
  },
  securityCodeValue: {
    color: '#f26522',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },
  securityCodeHelp: {
    color: '#6b7280',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
  },
  routeSummary: {
    marginTop: 18,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routePoint: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginTop: 4,
    marginRight: 13,
  },
  pickupPoint: {
    backgroundColor: '#169b62',
  },
  destinationPoint: {
    backgroundColor: '#f26522',
  },
  routeLine: {
    width: 2,
    height: 17,
    backgroundColor: '#d1d5db',
    marginLeft: 5.5,
    marginVertical: 3,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '900',
  },
  routeAddress: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
