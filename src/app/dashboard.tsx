import { router } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getCurrentUser,
  logoutUser,
} from '../store/auth.store';

export default function DashboardScreen() {
  const user = getCurrentUser();

  async function handleLogout() {
    await logoutUser();
    router.replace('/login' as any);
  }

  function handleNovaEntrega() {
    router.push('/nova-entrega' as any);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>ChinaFast</Text>

            <Text style={styles.welcome}>
              Olá, {user?.name || 'usuário'}
            </Text>

            <Text style={styles.accountType}>
              {user?.role === 'company'
                ? 'Conta empresarial'
                : 'Conta de cliente'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            Entregas rápidas e seguras
          </Text>

          <Text style={styles.bannerDescription}>
            Solicite uma coleta e acompanhe sua entrega pelo aplicativo.
          </Text>

          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleNovaEntrega}
          >
            <Text style={styles.mainButtonText}>
              Solicitar entrega
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Serviços</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={handleNovaEntrega}
          >
            <Text style={styles.cardIcon}>📦</Text>
            <Text style={styles.cardTitle}>Nova entrega</Text>
            <Text style={styles.cardDescription}>
              Informe a coleta e o destino.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🛵</Text>
            <Text style={styles.cardTitle}>Acompanhar</Text>
            <Text style={styles.cardDescription}>
              Veja entregas em andamento.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🧾</Text>
            <Text style={styles.cardTitle}>Histórico</Text>
            <Text style={styles.cardDescription}>
              Consulte entregas anteriores.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>Meu perfil</Text>
            <Text style={styles.cardDescription}>
              Atualize seus dados.
            </Text>
          </TouchableOpacity>
        </View>

        {user?.role === 'company' && (
          <>
            <Text style={styles.sectionTitle}>
              Área da empresa
            </Text>

            <View style={styles.companyCard}>
              <Text style={styles.companyTitle}>
                Gestão empresarial
              </Text>

              <Text style={styles.companyDescription}>
                Controle solicitações, entregas, usuários e relatórios
                da sua empresa.
              </Text>

              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  Abrir painel empresarial
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
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
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    color: '#f26522',
    fontSize: 28,
    fontWeight: '900',
  },

  welcome: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },

  accountType: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 2,
  },

  logoutButton: {
    borderColor: '#f26522',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  logoutText: {
    color: '#f26522',
    fontWeight: '700',
  },

  banner: {
    backgroundColor: '#17202a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
  },

  bannerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },

  bannerDescription: {
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 20,
  },

  mainButton: {
    backgroundColor: '#f26522',
    borderRadius: 12,
    paddingVertical: 16,
  },

  mainButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },

  sectionTitle: {
    color: '#17202a',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    minHeight: 150,
  },

  cardIcon: {
    fontSize: 30,
    marginBottom: 12,
  },

  cardTitle: {
    color: '#17202a',
    fontSize: 16,
    fontWeight: '800',
  },

  cardDescription: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },

  companyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },

  companyTitle: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '800',
  },

  companyDescription: {
    color: '#6b7280',
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 18,
  },

  secondaryButton: {
    borderColor: '#f26522',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },

  secondaryButtonText: {
    color: '#f26522',
    textAlign: 'center',
    fontWeight: '800',
  },
});
