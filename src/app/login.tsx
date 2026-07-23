import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
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
        email,
        password,
      });

      Alert.alert('Sucesso', `Bem-vindo ${user.name}`);

      router.replace('/');
    } catch (err: any) {
      Alert.alert(
        'Erro',
        err?.response?.data?.message || 'Falha no login'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex:1, padding:25, justifyContent:'center' }}>

      <Text style={{fontSize:30,fontWeight:'bold',marginBottom:30}}>
        ChinaFast
      </Text>

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth:1,
          borderRadius:8,
          padding:15,
          marginBottom:15
        }}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth:1,
          borderRadius:8,
          padding:15,
          marginBottom:20
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor:'#ff6600',
          padding:18,
          borderRadius:10
        }}>

        <Text
          style={{
            color:'#fff',
            textAlign:'center',
            fontWeight:'bold'
          }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>

      </TouchableOpacity>

    </View>
  );
}
