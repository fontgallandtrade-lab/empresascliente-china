import {
  io,
  type Socket,
} from 'socket.io-client';

const SOCKET_URL =
  'https://api.chamabebidas.com.br';

export type DriverLocationUpdate = {
  driverId?: number;
  deliveryId: number;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number | string;
};

let socket: Socket | null = null;
let joinedDeliveryId: number | null = null;

export function getTrackingSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    socket.on('connect', () => {
      console.log(
        '[tracking] Socket conectado:',
        socket?.id,
      );

      if (joinedDeliveryId) {
        socket?.emit(
          'join-delivery-room',
          joinedDeliveryId,
        );
      }
    });

    socket.on('connect_error', error => {
      console.log(
        '[tracking] Erro de conexão:',
        error.message,
      );
    });

    socket.on('disconnect', reason => {
      console.log(
        '[tracking] Socket desconectado:',
        reason,
      );
    });
  }

  return socket;
}

export function connectDeliveryTracking(
  deliveryId: number,
): Socket {
  const currentSocket =
    getTrackingSocket();

  joinedDeliveryId = deliveryId;

  if (currentSocket.connected) {
    currentSocket.emit(
      'join-delivery-room',
      deliveryId,
    );
  } else {
    currentSocket.connect();
  }

  return currentSocket;
}

export function disconnectDeliveryTracking():
void {
  if (!socket) {
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();

  socket = null;
  joinedDeliveryId = null;
}
