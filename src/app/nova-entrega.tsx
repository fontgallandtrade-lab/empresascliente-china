import { router } from 'expo-router';
import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { WebView } from 'react-native-webview';

import {
  calculateAddressRoute,
  calculateQuote,
  createDelivery,
  type DeliveryPayload,
  type QuoteResult,
  type RouteResult,
} from '../services/delivery.service';

type PackageType = DeliveryPayload['package_type'];
type ServiceType = DeliveryPayload['service_type'];
type PaymentMethod = DeliveryPayload['payment_method'];

type ConfirmedPoint = {
  latitude: number;
  longitude: number;
};

type MapTarget = 'pickup' | 'destination';

type AddressForm = {
  recipient_name: string;
  recipient_phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  reference_point: string;
};

const emptyAddress: AddressForm = {
  recipient_name: '',
  recipient_phone: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: 'SP',
  postal_code: '',
  reference_point: '',
};

const CITY_CENTERS: Record<string, ConfirmedPoint> = {
  'alambari': { latitude: -23.5503, longitude: -47.8980 },
  'aracoiaba da serra': { latitude: -23.5050, longitude: -47.6160 },
  'boituva': { latitude: -23.2830, longitude: -47.6720 },
  'capela do alto': { latitude: -23.4700, longitude: -47.7350 },
  'cerquilho': { latitude: -23.1650, longitude: -47.7430 },
  'cesario lange': { latitude: -23.2260, longitude: -47.9530 },
  'ipero': { latitude: -23.3510, longitude: -47.6880 },
  'itapetininga': { latitude: -23.5880, longitude: -48.0480 },
  'itu': { latitude: -23.2640, longitude: -47.2990 },
  'quadra': { latitude: -23.2990, longitude: -48.0540 },
  'sorocaba': { latitude: -23.5015, longitude: -47.4526 },
  'tatui': { latitude: -23.3509, longitude: -47.8465 },
};

function normalizeCity(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function initialPointForCity(city: string): ConfirmedPoint {
  return (
    CITY_CENTERS[normalizeCity(city)] || {
      latitude: -23.3509,
      longitude: -47.8465,
    }
  );
}


function buildMapHtml(
  point: ConfirmedPoint,
): string {
  const latitude = Number(point.latitude);
  const longitude = Number(point.longitude);

  return `
<!DOCTYPE html>
<html>
<head>
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<style>
html, body, #map {
  width:100%;
  height:100%;
  margin:0;
  padding:0;
}

body {
  background:#f3f4f6;
}

.map-tip {
  position:absolute;
  z-index:9999;
  top:12px;
  left:12px;
  right:12px;
  background:rgba(23,32,42,.92);
  color:#fff;
  border-radius:12px;
  padding:10px;
  text-align:center;
  font-family:Arial,sans-serif;
  font-size:13px;
  pointer-events:none;
}

.leaflet-control-attribution {
  font-size:9px;
}
</style>
</head>

<body>

<div class="map-tip">
Toque no mapa ou arraste o pino até a entrada correta.
</div>

<div id="map"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
const map = L.map('map').setView(
  [${latitude}, ${longitude}],
  17
);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);

const marker = L.marker(
  [${latitude}, ${longitude}],
  { draggable: true }
).addTo(map);

function enviar(lat, lng) {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'point',
      latitude: lat,
      longitude: lng
    })
  );
}

map.on('click', function(event) {
  marker.setLatLng(event.latlng);
  enviar(event.latlng.lat, event.latlng.lng);
});

marker.on('dragend', function(event) {
  const p = event.target.getLatLng();
  enviar(p.lat, p.lng);
});

setTimeout(function() {
  map.invalidateSize();
}, 300);
</script>

</body>
</html>
`;
}

const packageOptions: Array<{
  value: PackageType;
  label: string;
}> = [
  { value: 'document', label: 'Documento' },
  { value: 'food', label: 'Alimento' },
  { value: 'medicine', label: 'Medicamento' },
  { value: 'flowers', label: 'Flores' },
  { value: 'auto_parts', label: 'Autopeças' },
  { value: 'electronics', label: 'Eletrônicos' },
  { value: 'market', label: 'Mercado' },
  { value: 'box', label: 'Caixa' },
  { value: 'other', label: 'Outro' },
];

function money(value: number): string {
  return Number(value || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  );
}

function numericValue(value: string): number {
  return Number(
    value
      .replace(',', '.')
      .replace(/[^\d.]/g, ''),
  );
}

function cleanPhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

function cleanPostalCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  required = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'decimal-pad';
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? (
          <Text style={styles.required}> *</Text>
        ) : null}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.textArea,
        ]}
      />
    </View>
  );
}

function ChoiceButton({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.choiceButton,
        selected && styles.choiceButtonSelected,
      ]}
    >
      <Text
        style={[
          styles.choiceText,
          selected && styles.choiceTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function NovaEntregaScreen() {
  const [pickup, setPickup] =
    useState<AddressForm>({
      ...emptyAddress,
      recipient_name: 'Cliente Teste',
    });

  const [destination, setDestination] =
    useState<AddressForm>({
      ...emptyAddress,
    });

  const [packageType, setPackageType] =
    useState<PackageType>('document');

  const [packageDescription, setPackageDescription] =
    useState('');

  const [packageWeight, setPackageWeight] =
    useState('');

  const [declaredValue, setDeclaredValue] =
    useState('');

  const [tollFee, setTollFee] =
    useState('0');

  const [customerNotes, setCustomerNotes] =
    useState('');

  const [serviceType, setServiceType] =
    useState<ServiceType>('normal');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('pix');

  const [fragile, setFragile] =
    useState(false);

  const [
    thermalBagRequired,
    setThermalBagRequired,
  ] = useState(false);

  const [
    signatureRequired,
    setSignatureRequired,
  ] = useState(false);

  const [routeResult, setRouteResult] =
    useState<RouteResult | null>(null);

  const [quote, setQuote] =
    useState<QuoteResult | null>(null);

  const [loadingQuote, setLoadingQuote] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [pickupPoint, setPickupPoint] =
    useState<ConfirmedPoint | null>(null);

  const [destinationPoint, setDestinationPoint] =
    useState<ConfirmedPoint | null>(null);

  const [mapVisible, setMapVisible] =
    useState(false);

  const [mapTarget, setMapTarget] =
    useState<MapTarget>('pickup');

  const [mapPoint, setMapPoint] =
    useState<ConfirmedPoint>({
      latitude: -23.3509,
      longitude: -47.8465,
    });

  const [mapHtml, setMapHtml] =
    useState('');

  const [resumeQuoteAfterMap, setResumeQuoteAfterMap] =
    useState(false);

  function updatePickup(
    field: keyof AddressForm,
    value: string,
  ) {
    setPickup(previous => ({
      ...previous,
      [field]: value,
    }));

    setPickupPoint(null);
    setRouteResult(null);
    setQuote(null);
  }

  function updateDestination(
    field: keyof AddressForm,
    value: string,
  ) {
    setDestination(previous => ({
      ...previous,
      [field]: value,
    }));

    setDestinationPoint(null);
    setRouteResult(null);
    setQuote(null);
  }

  async function openAddressPointMap(
    target: MapTarget,
  ) {
    const address =
      target === 'pickup'
        ? pickup
        : destination;

    const otherAddress =
      target === 'pickup'
        ? destination
        : pickup;

    if (!validateAddress(
      address,
      target === 'pickup'
        ? 'coleta'
        : 'entrega',
    )) {
      return;
    }

    try {
      setLoadingQuote(true);

      const makeAddress = (item: AddressForm) => ({
        recipient_name:
          item.recipient_name.trim(),
        recipient_phone:
          item.recipient_phone.trim(),
        street: item.street.trim(),
        number: item.number.trim(),
        complement: item.complement.trim(),
        neighborhood:
          item.neighborhood.trim(),
        city: item.city.trim(),
        state:
          item.state.trim().toUpperCase() ||
          'SP',
        postal_code:
          item.postal_code.trim(),
        reference_point:
          item.reference_point.trim(),
      });

      const response =
        target === 'pickup'
          ? await calculateAddressRoute(
              makeAddress(address),
              makeAddress(otherAddress),
            )
          : await calculateAddressRoute(
              makeAddress(otherAddress),
              makeAddress(address),
            );

      const routePoint =
        target === 'pickup'
          ? response.route.pickup
          : response.route.destination;

      const suggestedPoint: ConfirmedPoint = {
        latitude: Number(routePoint.latitude),
        longitude: Number(routePoint.longitude),
      };

      if (
        !Number.isFinite(
          suggestedPoint.latitude,
        ) ||
        !Number.isFinite(
          suggestedPoint.longitude,
        )
      ) {
        throw new Error(
          'O servidor não retornou uma localização válida.',
        );
      }

      console.log(
        '[map] endereço localizado:',
        target,
        address.street,
        address.number,
        suggestedPoint,
        routePoint.location_precision,
        routePoint.requires_confirmation,
      );

      Alert.alert(
        'DIAGNÓSTICO DO MAPA',
        `${target === 'pickup' ? 'COLETA' : 'ENTREGA'}\n` +
        `${address.street}, ${address.number}\n\n` +
        `Latitude: ${suggestedPoint.latitude}\n` +
        `Longitude: ${suggestedPoint.longitude}\n\n` +
        `Precisão: ${routePoint.location_precision || 'não informada'}`,
        [
          {
            text: 'ABRIR MAPA',
            onPress: () =>
              openPointMap(
                target,
                suggestedPoint,
              ),
          },
        ],
      );
    } catch (error: any) {
      console.error(
        '[map] erro ao localizar endereço:',
        error?.response?.data || error,
      );

      Alert.alert(
        'Não foi possível localizar o endereço',
        error?.response?.data?.message ||
          error?.message ||
          'Confira rua, número, bairro e cidade.',
      );
    } finally {
      setLoadingQuote(false);
    }
  }

  function openPointMap(
    target: MapTarget,
    suggestedPoint?: ConfirmedPoint,
    resumeAfterConfirm = false,
  ) {
    const address =
      target === 'pickup'
        ? pickup
        : destination;

    const confirmed =
      target === 'pickup'
        ? pickupPoint
        : destinationPoint;

    const initial =
      confirmed ||
      suggestedPoint ||
      initialPointForCity(address.city);

    setMapTarget(target);
    setMapPoint(initial);
    setMapHtml(buildMapHtml(initial));
    setResumeQuoteAfterMap(
      resumeAfterConfirm,
    );
    setMapVisible(true);
  }

  function confirmMapPoint() {
    if (mapTarget === 'pickup') {
      setPickupPoint(mapPoint);
    } else {
      setDestinationPoint(mapPoint);
    }

    setRouteResult(null);
    setQuote(null);
    setMapVisible(false);

    if (resumeQuoteAfterMap) {
      setResumeQuoteAfterMap(false);

      const confirmedPickup =
        mapTarget === 'pickup'
          ? mapPoint
          : pickupPoint;

      const confirmedDestination =
        mapTarget === 'destination'
          ? mapPoint
          : destinationPoint;

      setTimeout(() => {
        handleQuoteWithOverrides(
          confirmedPickup,
          confirmedDestination,
        );
      }, 150);
    }
  }

  function handleMapMessage(event: any) {
    try {
      const data = JSON.parse(
        event.nativeEvent.data,
      );

      if (data?.type !== 'point') {
        return;
      }

      const latitude = Number(data.latitude);
      const longitude = Number(data.longitude);

      if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
      ) {
        setMapPoint({
          latitude,
          longitude,
        });
      }
    } catch {
      // Ignora mensagem inválida.
    }
  }

  function validateAddress(
    address: AddressForm,
    type: string,
  ): boolean {
    if (
      !address.recipient_name.trim() ||
      !address.recipient_phone.trim() ||
      !address.street.trim() ||
      !address.number.trim() ||
      !address.neighborhood.trim() ||
      !address.city.trim()
    ) {
      Alert.alert(
        'Dados incompletos',
        `Preencha os campos obrigatórios do endereço de ${type}.`,
      );

      return false;
    }

    return true;
  }

  function buildPayload(
    route: RouteResult,
  ): DeliveryPayload | null {
    if (!validateAddress(pickup, 'coleta')) {
      return null;
    }

    if (!validateAddress(destination, 'entrega')) {
      return null;
    }

    return {
      pickup: {
        label: 'Coleta',
        recipient_name:
          pickup.recipient_name.trim(),
        recipient_phone:
          pickup.recipient_phone.trim(),
        street: pickup.street.trim(),
        number: pickup.number.trim(),
        complement:
          pickup.complement.trim(),
        neighborhood:
          pickup.neighborhood.trim(),
        city: pickup.city.trim(),
        state:
          pickup.state.trim().toUpperCase() ||
          'SP',
        postal_code:
          pickup.postal_code.trim(),
        reference_point:
          pickup.reference_point.trim(),
        latitude: route.pickup.latitude,
        longitude: route.pickup.longitude,
      },

      destination: {
        label: 'Entrega',
        recipient_name:
          destination.recipient_name.trim(),
        recipient_phone:
          destination.recipient_phone.trim(),
        street:
          destination.street.trim(),
        number:
          destination.number.trim(),
        complement:
          destination.complement.trim(),
        neighborhood:
          destination.neighborhood.trim(),
        city:
          destination.city.trim(),
        state:
          destination.state
            .trim()
            .toUpperCase() || 'SP',
        postal_code:
          destination.postal_code.trim(),
        reference_point:
          destination.reference_point.trim(),
        latitude:
          route.destination.latitude,
        longitude:
          route.destination.longitude,
      },

      package_type: packageType,
      package_description:
        packageDescription.trim() ||
        undefined,
      package_weight_kg:
        packageWeight
          ? numericValue(packageWeight)
          : undefined,
      declared_value:
        declaredValue
          ? numericValue(declaredValue)
          : 0,
      fragile,
      thermal_bag_required:
        thermalBagRequired,
      signature_required:
        signatureRequired,
      service_type: serviceType,
      route_distance_km:
        route.route_distance_km,
      estimated_duration_minutes:
        route.estimated_duration_minutes,
      toll_fee:
        tollFee
          ? numericValue(tollFee)
          : 0,
      payment_method: paymentMethod,
      customer_notes:
        customerNotes.trim() ||
        undefined,
    };
  }

  async function handleQuoteWithOverrides(
    pickupOverride?: ConfirmedPoint | null,
    destinationOverride?: ConfirmedPoint | null,
  ) {
    if (!validateAddress(pickup, 'coleta')) {
      return;
    }

    if (!validateAddress(destination, 'entrega')) {
      return;
    }

    const effectivePickupPoint =
      pickupOverride !== undefined
        ? pickupOverride
        : pickupPoint;

    const effectiveDestinationPoint =
      destinationOverride !== undefined
        ? destinationOverride
        : destinationPoint;

    try {
      setLoadingQuote(true);
      setQuote(null);
      setRouteResult(null);

      const routeResponse =
        await calculateAddressRoute(
          {
            label: 'Coleta',
            recipient_name:
              pickup.recipient_name.trim(),
            recipient_phone:
              pickup.recipient_phone.trim(),
            street: pickup.street.trim(),
            number: pickup.number.trim(),
            complement:
              pickup.complement.trim(),
            neighborhood:
              pickup.neighborhood.trim(),
            city: pickup.city.trim(),
            state:
              pickup.state.trim().toUpperCase() ||
              'SP',
            postal_code:
              pickup.postal_code.trim(),
            reference_point:
              pickup.reference_point.trim(),
            latitude:
              effectivePickupPoint?.latitude,
            longitude:
              effectivePickupPoint?.longitude,
          },
          {
            label: 'Entrega',
            recipient_name:
              destination.recipient_name.trim(),
            recipient_phone:
              destination.recipient_phone.trim(),
            street:
              destination.street.trim(),
            number:
              destination.number.trim(),
            complement:
              destination.complement.trim(),
            neighborhood:
              destination.neighborhood.trim(),
            city:
              destination.city.trim(),
            state:
              destination.state
                .trim()
                .toUpperCase() || 'SP',
            postal_code:
              destination.postal_code.trim(),
            reference_point:
              destination.reference_point.trim(),
            latitude:
              effectiveDestinationPoint?.latitude,
            longitude:
              effectiveDestinationPoint?.longitude,
          },
        );

      const route = routeResponse.route;

      console.log(
        'ROTA RECEBIDA:',
        JSON.stringify(route, null, 2),
      );

      const pickupNeedsConfirmation =
        !effectivePickupPoint &&
        route.pickup?.location_precision !== 'exact';

      const destinationNeedsConfirmation =
        !effectiveDestinationPoint &&
        route.destination?.location_precision !== 'exact';

      if (
        pickupNeedsConfirmation ||
        destinationNeedsConfirmation
      ) {
        setLoadingQuote(false);

        Alert.alert(
          'Confirme o endereço no mapa',
          'Não conseguimos localizar o número exato do endereço. Por favor, confirme a posição no mapa antes de calcular.',
        );

        if (pickupNeedsConfirmation) {
          openPointMap(
            'pickup',
            {
              latitude: Number(route.pickup.latitude),
              longitude: Number(route.pickup.longitude),
            },
            true,
          );
        } else if (destinationNeedsConfirmation) {
          openPointMap(
            'destination',
            {
              latitude: Number(route.destination.latitude),
              longitude: Number(route.destination.longitude),
            },
            true,
          );
        }

        return;
      }

      const payload = buildPayload(route);

      if (!payload) {
        return;
      }

      const quoteResponse =
        await calculateQuote(payload);

      router.push({
        pathname: '/resumo-entrega',
        params: {
          payload: JSON.stringify(payload),
          quote: JSON.stringify(
            quoteResponse.quote,
          ),
        },
      } as any);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível calcular a rota e o valor.';

      Alert.alert(
        'Erro no cálculo',
        message,
      );
    } finally {
      setLoadingQuote(false);
    }
  }

  async function handleQuote() {
    await handleQuoteWithOverrides(
      pickupPoint,
      destinationPoint,
    );
  }

  async function handleCreate() {
    if (!routeResult || !quote) {
      Alert.alert(
        'Calcule o valor',
        'Calcule a rota e o valor antes de solicitar a entrega.',
      );

      return;
    }

    const payload =
      buildPayload(routeResult);

    if (!payload) {
      return;
    }

    try {
      setCreating(true);

      const response =
        await createDelivery(payload);

      router.replace({
        pathname: '/entrega-criada',
        params: {
          publicCode:
            response.delivery.public_code,
          pickupCode:
            response.delivery.pickup_code,
          deliveryCode:
            response.delivery.delivery_code,
          total: money(
            response.delivery.quote.total_price
          ),
        },
      } as any);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível criar a entrega.';

      Alert.alert(
        'Erro ao solicitar entrega',
        message,
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Text style={styles.back}>
              ← Voltar
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Solicitar entrega
          </Text>

          <Text style={styles.description}>
            Preencha os dados da coleta, da entrega
            e da encomenda.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📍 Local de coleta
            </Text>

            <InputField
              label="Nome do responsável"
              value={pickup.recipient_name}
              onChangeText={value =>
                updatePickup(
                  'recipient_name',
                  value,
                )
              }
              required
            />

            <InputField
              label="Telefone"
              value={pickup.recipient_phone}
              onChangeText={value =>
                updatePickup(
                  'recipient_phone',
                  cleanPhone(value),
                )
              }
              keyboardType="phone-pad"
              placeholder="15999999999"
              required
            />

            <InputField
              label="Rua"
              value={pickup.street}
              onChangeText={value =>
                updatePickup('street', value)
              }
              required
            />

            <View style={styles.row}>
              <View style={styles.rowSmall}>
                <InputField
                  label="Número"
                  value={pickup.number}
                  onChangeText={value =>
                    updatePickup(
                      'number',
                      value,
                    )
                  }
                  required
                />
              </View>

              <View style={styles.rowLarge}>
                <InputField
                  label="Complemento"
                  value={pickup.complement}
                  onChangeText={value =>
                    updatePickup(
                      'complement',
                      value,
                    )
                  }
                />
              </View>
            </View>

            <InputField
              label="Bairro"
              value={pickup.neighborhood}
              onChangeText={value =>
                updatePickup(
                  'neighborhood',
                  value,
                )
              }
              required
            />

            <View style={styles.row}>
              <View style={styles.rowLarge}>
                <InputField
                  label="Cidade"
                  value={pickup.city}
                  onChangeText={value =>
                    updatePickup('city', value)
                  }
                  required
                />
              </View>

              <View style={styles.stateField}>
                <InputField
                  label="UF"
                  value={pickup.state}
                  onChangeText={value =>
                    updatePickup(
                      'state',
                      value.slice(0, 2),
                    )
                  }
                  required
                />
              </View>
            </View>

            <InputField
              label="CEP"
              value={pickup.postal_code}
              onChangeText={value =>
                updatePickup(
                  'postal_code',
                  cleanPostalCode(value),
                )
              }
              keyboardType="numeric"
            />

            <InputField
              label="Ponto de referência"
              value={pickup.reference_point}
              onChangeText={value =>
                updatePickup(
                  'reference_point',
                  value,
                )
              }
            />

            <TouchableOpacity
              style={[
                styles.mapConfirmButton,
                pickupPoint &&
                  styles.mapConfirmButtonDone,
              ]}
              onPress={() =>
                openAddressPointMap('pickup')
              }
            >
              <Text
                style={[
                  styles.mapConfirmButtonText,
                  pickupPoint &&
                    styles.mapConfirmButtonTextDone,
                ]}
              >
                {pickupPoint
                  ? '✓ COLETA CONFIRMADA NO MAPA'
                  : '📍 CONFIRMAR COLETA NO MAPA'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🏁 Local de entrega
            </Text>

            <InputField
              label="Nome do destinatário"
              value={
                destination.recipient_name
              }
              onChangeText={value =>
                updateDestination(
                  'recipient_name',
                  value,
                )
              }
              required
            />

            <InputField
              label="Telefone"
              value={
                destination.recipient_phone
              }
              onChangeText={value =>
                updateDestination(
                  'recipient_phone',
                  cleanPhone(value),
                )
              }
              keyboardType="phone-pad"
              placeholder="15999999999"
              required
            />

            <InputField
              label="Rua"
              value={destination.street}
              onChangeText={value =>
                updateDestination(
                  'street',
                  value,
                )
              }
              required
            />

            <View style={styles.row}>
              <View style={styles.rowSmall}>
                <InputField
                  label="Número"
                  value={destination.number}
                  onChangeText={value =>
                    updateDestination(
                      'number',
                      value,
                    )
                  }
                  required
                />
              </View>

              <View style={styles.rowLarge}>
                <InputField
                  label="Complemento"
                  value={
                    destination.complement
                  }
                  onChangeText={value =>
                    updateDestination(
                      'complement',
                      value,
                    )
                  }
                />
              </View>
            </View>

            <InputField
              label="Bairro"
              value={
                destination.neighborhood
              }
              onChangeText={value =>
                updateDestination(
                  'neighborhood',
                  value,
                )
              }
              required
            />

            <View style={styles.row}>
              <View style={styles.rowLarge}>
                <InputField
                  label="Cidade"
                  value={destination.city}
                  onChangeText={value =>
                    updateDestination(
                      'city',
                      value,
                    )
                  }
                  required
                />
              </View>

              <View style={styles.stateField}>
                <InputField
                  label="UF"
                  value={destination.state}
                  onChangeText={value =>
                    updateDestination(
                      'state',
                      value.slice(0, 2),
                    )
                  }
                  required
                />
              </View>
            </View>

            <InputField
              label="CEP"
              value={
                destination.postal_code
              }
              onChangeText={value =>
                updateDestination(
                  'postal_code',
                  cleanPostalCode(value),
                )
              }
              keyboardType="numeric"
            />

            <InputField
              label="Ponto de referência"
              value={
                destination.reference_point
              }
              onChangeText={value =>
                updateDestination(
                  'reference_point',
                  value,
                )
              }
            />

            <TouchableOpacity
              style={[
                styles.mapConfirmButton,
                destinationPoint &&
                  styles.mapConfirmButtonDone,
              ]}
              onPress={() =>
                openAddressPointMap('destination')
              }
            >
              <Text
                style={[
                  styles.mapConfirmButtonText,
                  destinationPoint &&
                    styles.mapConfirmButtonTextDone,
                ]}
              >
                {destinationPoint
                  ? '✓ ENTREGA CONFIRMADA NO MAPA'
                  : '🏁 CONFIRMAR ENTREGA NO MAPA'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📦 Encomenda
            </Text>

            <Text style={styles.label}>
              Tipo da encomenda
            </Text>

            <View style={styles.choiceGrid}>
              {packageOptions.map(option => (
                <ChoiceButton
                  key={option.value}
                  label={option.label}
                  selected={
                    packageType === option.value
                  }
                  onPress={() => {
                    setPackageType(
                      option.value,
                    );
                    setQuote(null);
                  }}
                />
              ))}
            </View>

            <InputField
              label="Descrição"
              value={packageDescription}
              onChangeText={value => {
                setPackageDescription(value);
                setQuote(null);
              }}
              placeholder="Ex.: documentos em envelope"
              multiline
            />

            <View style={styles.row}>
              <View style={styles.rowLarge}>
                <InputField
                  label="Peso aproximado (kg)"
                  value={packageWeight}
                  onChangeText={value => {
                    setPackageWeight(value);
                    setQuote(null);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.rowLarge}>
                <InputField
                  label="Valor declarado"
                  value={declaredValue}
                  onChangeText={value => {
                    setDeclaredValue(value);
                    setQuote(null);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                Encomenda frágil
              </Text>

              <Switch
                value={fragile}
                onValueChange={value => {
                  setFragile(value);
                  setQuote(null);
                }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                Precisa de bolsa térmica
              </Text>

              <Switch
                value={thermalBagRequired}
                onValueChange={value => {
                  setThermalBagRequired(
                    value,
                  );
                  setQuote(null);
                }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                Exigir assinatura
              </Text>

              <Switch
                value={signatureRequired}
                onValueChange={value => {
                  setSignatureRequired(value);
                  setQuote(null);
                }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🛣️ Rota e serviço
            </Text>

            <View style={styles.automaticRouteCard}>
              <Text style={styles.automaticRouteTitle}>
                Cálculo automático da rota
              </Text>

              <Text style={styles.automaticRouteText}>
                A distância e o tempo serão calculados
                automaticamente usando os endereços informados.
              </Text>
            </View>

            <InputField
              label="Pedágio"
              value={tollFee}
              onChangeText={value => {
                setTollFee(value);
                setQuote(null);
              }}
              keyboardType="decimal-pad"
              placeholder="0"
            />

            <Text style={styles.label}>
              Tipo de serviço
            </Text>

            <View style={styles.choiceGrid}>
              <ChoiceButton
                label="Normal"
                selected={
                  serviceType === 'normal'
                }
                onPress={() => {
                  setServiceType('normal');
                  setQuote(null);
                }}
              />

              <ChoiceButton
                label="Expresso"
                selected={
                  serviceType === 'express'
                }
                onPress={() => {
                  setServiceType('express');
                  setQuote(null);
                }}
              />
            </View>

            <Text style={styles.label}>
              Forma de pagamento
            </Text>

            <View style={styles.choiceGrid}>
              <ChoiceButton
                label="Pix"
                selected={
                  paymentMethod === 'pix'
                }
                onPress={() =>
                  setPaymentMethod('pix')
                }
              />

              <ChoiceButton
                label="Cartão"
                selected={
                  paymentMethod === 'card'
                }
                onPress={() =>
                  setPaymentMethod('card')
                }
              />

              <ChoiceButton
                label="Dinheiro"
                selected={
                  paymentMethod === 'cash'
                }
                onPress={() =>
                  setPaymentMethod('cash')
                }
              />
            </View>

            <InputField
              label="Observações"
              value={customerNotes}
              onChangeText={setCustomerNotes}
              multiline
              placeholder="Informações para o entregador"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleQuote}
            disabled={loadingQuote || creating}
            style={styles.quoteButton}
          >
            {loadingQuote ? (
              <ActivityIndicator
                color="#f26522"
              />
            ) : (
              <Text style={styles.quoteButtonText}>
                CALCULAR VALOR
              </Text>
            )}
          </TouchableOpacity>

          {quote ? (
            <View style={styles.quoteCard}>
              <Text style={styles.quoteTitle}>
                Resumo da corrida
              </Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Tipo
                </Text>

                <Text style={styles.summaryValue}>
                  {quote.same_city
                    ? 'Urbana'
                    : 'Intermunicipal'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Distância de ida
                </Text>

                <Text style={styles.summaryValue}>
                  {quote.route_distance_km} km
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Tempo estimado
                </Text>

                <Text style={styles.summaryValue}>
                  {quote.estimated_duration_minutes || 0} min
                </Text>
              </View>

              {!quote.same_city ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Ida e retorno
                  </Text>

                  <Text style={styles.summaryValue}>
                    {quote.billable_distance_km} km
                  </Text>
                </View>
              ) : null}

              {quote.base_fee > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Taxa-base
                  </Text>

                  <Text style={styles.summaryValue}>
                    {money(quote.base_fee)}
                  </Text>
                </View>
              ) : null}

              {quote.urgency_fee > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Taxa de urgência
                  </Text>

                  <Text style={styles.summaryValue}>
                    {money(quote.urgency_fee)}
                  </Text>
                </View>
              ) : null}

              {quote.night_fee > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Adicional noturno
                  </Text>

                  <Text style={styles.summaryValue}>
                    {money(quote.night_fee)}
                  </Text>
                </View>
              ) : null}

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
                onPress={handleCreate}
                disabled={creating}
                style={styles.createButton}
              >
                {creating ? (
                  <ActivityIndicator
                    color="#ffffff"
                  />
                ) : (
                  <Text
                    style={styles.createButtonText}
                  >
                    CONFIRMAR E SOLICITAR ENTREGA
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() =>
          setMapVisible(false)
        }
      >
        <SafeAreaView style={styles.mapModal}>
          <View style={styles.mapModalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapModalTitle}>
                {mapTarget === 'pickup'
                  ? 'Confirmar ponto de coleta'
                  : 'Confirmar ponto de entrega'}
              </Text>

              <Text style={styles.mapModalSubtitle}>
                Use o mapa abaixo para marcar exatamente a entrada do imóvel.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setMapVisible(false)
              }
            >
              <Text style={styles.mapClose}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <WebView
            style={styles.confirmMap}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleMapMessage}
          />

          <View style={styles.mapBottom}>
            <Text style={styles.mapHint}>
              Posicione o pino exatamente na entrada do imóvel.
            </Text>

            <TouchableOpacity
              style={styles.mapSaveButton}
              onPress={confirmMapPoint}
            >
              <Text style={styles.mapSaveButtonText}>
                CONFIRMAR ESTE PONTO
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  content: {
    padding: 20,
    paddingBottom: 60,
  },

  back: {
    color: '#f26522',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 22,
  },

  title: {
    color: '#17202a',
    fontSize: 30,
    fontWeight: '900',
  },

  description: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 22,
  },

  section: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    color: '#17202a',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 18,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },

  required: {
    color: '#dc2626',
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 13,
    backgroundColor: '#fafafa',
    color: '#17202a',
    fontSize: 15,
    paddingHorizontal: 14,
  },

  textArea: {
    minHeight: 95,
    paddingTop: 14,
    textAlignVertical: 'top',
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  rowSmall: {
    flex: 0.7,
  },

  rowLarge: {
    flex: 1.3,
  },

  stateField: {
    flex: 0.5,
  },

  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 17,
  },

  choiceButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  choiceButtonSelected: {
    borderColor: '#f26522',
    backgroundColor: '#fff0e7',
  },

  choiceText: {
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '700',
  },

  choiceTextSelected: {
    color: '#d95416',
  },

  switchRow: {
    minHeight: 52,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  switchLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },

  automaticRouteCard: {
    backgroundColor: '#eef6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },

  automaticRouteTitle: {
    color: '#1d4ed8',
    fontSize: 15,
    fontWeight: '900',
  },

  automaticRouteText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  quoteButton: {
    minHeight: 58,
    borderWidth: 2,
    borderColor: '#f26522',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },

  quoteButtonText: {
    color: '#f26522',
    fontSize: 15,
    fontWeight: '900',
  },

  quoteCard: {
    backgroundColor: '#17202a',
    borderRadius: 20,
    padding: 20,
    marginTop: 18,
  },

  quoteTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  summaryLabel: {
    color: '#d1d5db',
    fontSize: 14,
  },

  summaryValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 17,
  },

  totalLabel: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },

  totalValue: {
    color: '#f97316',
    fontSize: 28,
    fontWeight: '900',
  },

  createButton: {
    minHeight: 60,
    borderRadius: 15,
    backgroundColor: '#f26522',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  mapConfirmButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  mapConfirmButtonDone: {
    borderColor: '#16a34a',
    backgroundColor: '#ecfdf3',
  },

  mapConfirmButtonText: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '900',
  },

  mapConfirmButtonTextDone: {
    color: '#15803d',
  },

  mapModal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },

  mapModalTitle: {
    color: '#17202a',
    fontSize: 22,
    fontWeight: '900',
  },

  mapModalSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  mapClose: {
    color: '#17202a',
    fontSize: 34,
    lineHeight: 34,
  },

  confirmMap: {
    flex: 1,
  },

  mapBottom: {
    padding: 18,
    backgroundColor: '#ffffff',
  },

  mapHint: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 12,
  },

  mapSaveButton: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: '#f26522',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapSaveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
