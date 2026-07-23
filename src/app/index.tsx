import { Redirect } from 'expo-router';

export default function Index() {
  return (
    <Redirect
      href={{
        pathname: '/codigo-seguranca',
        params: {
          type: 'pickup',
          publicCode: 'CF260723A82F4C',
        },
      }}
    />
  );
}
