import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { loginUser } from '../store/auth.store';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      const user = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      Alert.alert('Sucesso', `Bem-vindo ${user.name}`);
      router.replace('/dashboard' as any);
    } catch (err: any) {
      console.log('===== LOGIN ERROR =====');
      console.log(err);
      console.log('message:', err?.message);
      console.log('code:', err?.code);
      console.log('response:', err?.response?.data);

      const detalhes =
        err?.response?.data?.message ||
        err?.message ||
        err?.code ||
        'Erro desconhecido';

      Alert.alert('Erro no login', String(detalhes));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 25,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: 'bold',
          marginBottom: 30,
        }}
      >
        ChinaFast
      </Text>

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 15,
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 15,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: '#ff6600',
          padding: 18,
          borderRadius: 10,
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
