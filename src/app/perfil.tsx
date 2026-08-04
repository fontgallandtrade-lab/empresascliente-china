import { router } from 'expo-router';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
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
  getCurrentUser,
  logoutUser,
  restoreSession,
} from '../store/auth.store';

import type {
  User,
} from '../services/auth.service';

function accountType(role?: string): string {
  if (role === 'company') {
    return 'Conta empresarial';
  }

  return 'Conta de cliente';
}

export default function PerfilScreen() {
  const [user, setUser] =
    useState<User | null>(
      getCurrentUser(),
    );

  const [loading, setLoading] =
    useState(!user);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadProfile = useCallback(
    async () => {
      try {
        setError(null);

        const restoredUser =
          await restoreSession();

        if (!restoredUser) {
          router.replace('/login' as any);
          return;
        }

        setUser(restoredUser);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Não foi possível carregar seu perfil.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadProfile();
  }

  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair do aplicativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            router.replace('/login' as any);
          },
        },
      ],
    );
  }

  const initial =
    user?.name
      ?.trim()
      .charAt(0)
      .toUpperCase() || 'U';

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#f26522"
        />

        <Text style={styles.loadingText}>
          Carregando perfil...
        </Text>
      </SafeAreaView>
    );
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

        <Text style={styles.headerTitle}>
          Meu perfil
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
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
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              onPress={loadProfile}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                TENTAR NOVAMENTE
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initial}
            </Text>
          </View>

          <Text style={styles.userName}>
            {user?.name || 'Usuário'}
          </Text>

          <Text style={styles.accountType}>
            {accountType(user?.role)}
          </Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              Conta ativa
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Dados pessoais
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>
                👤
              </Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Nome
              </Text>

              <Text style={styles.detailValue}>
                {user?.name || 'Não informado'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>
                ✉️
              </Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                E-mail
              </Text>

              <Text style={styles.detailValue}>
                {user?.email || 'Não informado'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>
                📞
              </Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Telefone
              </Text>

              <Text style={styles.detailValue}>
                {user?.phone || 'Não informado'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>
                🪪
              </Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Tipo da conta
              </Text>

              <Text style={styles.detailValue}>
                {accountType(user?.role)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Atualização de dados
          </Text>

          <Text style={styles.infoText}>
            A edição de nome, telefone, e-mail e senha
            será liberada quando a rota de atualização
            do perfil estiver disponível na API.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>
            SAIR DA CONTA
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  center: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 14,
  },
  header: {
    minHeight: 74,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  headerTitle: {
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
    paddingBottom: 50,
  },
  profileCard: {
    backgroundColor: '#17202a',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#f26522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
  },
  userName: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 16,
    textAlign: 'center',
  },
  accountType: {
    color: '#d1d5db',
    fontSize: 14,
    marginTop: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#243344',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginTop: 16,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#24c777',
    marginRight: 7,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#17202a',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 13,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 6,
  },
  detailRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#fff0e7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
  },
  detailValue: {
    color: '#17202a',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#edf0f3',
    marginLeft: 57,
  },
  infoCard: {
    backgroundColor: '#fff8f3',
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
  },
  infoTitle: {
    color: '#d85718',
    fontSize: 16,
    fontWeight: '900',
  },
  infoText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  logoutButton: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '900',
  },
  errorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f26522',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginTop: 15,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '900',
  },
});
