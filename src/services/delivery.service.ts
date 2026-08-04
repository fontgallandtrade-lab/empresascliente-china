import { api } from '../api/client';
import { getToken } from './token.service';

export type AddressPayload = {
  label?: string;
  recipient_name: string;
  recipient_phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code?: string;
  reference_point?: string;
  latitude?: number;
  longitude?: number;
};

export type DeliveryPayload = {
  pickup: AddressPayload;
  destination: AddressPayload;
  package_type:
    | 'document'
    | 'food'
    | 'medicine'
    | 'flowers'
    | 'auto_parts'
    | 'electronics'
    | 'market'
    | 'box'
    | 'other';
  package_description?: string;
  package_weight_kg?: number;
  declared_value?: number;
  fragile?: boolean;
  thermal_bag_required?: boolean;
  signature_required?: boolean;
  service_type: 'normal' | 'express';
  route_distance_km: number;
  estimated_duration_minutes?: number;
  toll_fee?: number;
  payment_method: 'pix' | 'card' | 'cash';
  customer_notes?: string;
};

export type QuoteResult = {
  same_city: boolean;
  route_distance_km: number;
  billable_distance_km: number;
  estimated_duration_minutes: number | null;
  delivery_type: 'urban' | 'intercity';
  base_fee: number;
  distance_fee: number;
  urgency_fee: number;
  night_fee: number;
  toll_fee: number;
  total_price: number;
  platform_amount: number;
  driver_amount: number;
  return_multiplier: number;
  tariff_city: string;
};

export type QuoteResponse = {
  success: boolean;
  message: string;
  quote: QuoteResult;
};

export type RouteResult = {
  pickup: {
    latitude: number;
    longitude: number;
    display_name: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    display_name: string;
  };
  route_distance_km: number;
  estimated_duration_minutes: number;
};

export type RouteResponse = {
  success: boolean;
  message: string;
  route: RouteResult;
};

export type CreateDeliveryResponse = {
  success: boolean;
  message: string;
  delivery: {
    id: number;
    public_code: string;
    status: string;
    pickup_code: string;
    delivery_code: string;
    quote: QuoteResult;
  };
};

async function authHeaders() {
  const token = await getToken();

  if (!token) {
    throw new Error('Sua sessão expirou. Entre novamente.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function calculateAddressRoute(
  pickup: AddressPayload,
  destination: AddressPayload,
): Promise<RouteResponse> {
  const response = await api.post<RouteResponse>(
    '/routes/calculate',
    {
      pickup,
      destination,
    },
    {
      headers: await authHeaders(),
    },
  );

  return response.data;
}

export async function calculateQuote(
  payload: DeliveryPayload,
): Promise<QuoteResponse> {
  const response = await api.post<QuoteResponse>(
    '/deliveries/quote',
    payload,
    {
      headers: await authHeaders(),
    },
  );

  return response.data;
}

export async function createDelivery(
  payload: DeliveryPayload,
): Promise<CreateDeliveryResponse> {
  const response =
    await api.post<CreateDeliveryResponse>(
      '/deliveries',
      payload,
      {
        headers: await authHeaders(),
      },
    );

  return response.data;
}

export type CustomerDelivery = {
  id: number;
  public_code: string;
  package_type: string;
  service_type: string;
  route_distance_km: number | string;
  billable_distance_km: number | string;
  total_price: number | string;
  driver_amount: number | string;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;

  pickup_street: string;
  pickup_number: string;
  pickup_neighborhood: string;
  pickup_city: string;

  destination_street: string;
  destination_number: string;
  destination_neighborhood: string;
  destination_city: string;
};

export type MyDeliveriesResponse = {
  success: boolean;
  total: number;
  deliveries: CustomerDelivery[];
};

export async function getMyDeliveries():
Promise<CustomerDelivery[]> {
  const response =
    await api.get<MyDeliveriesResponse>(
      '/deliveries/my',
      {
        headers: await authHeaders(),
      },
    );

  return response.data.deliveries;
}
