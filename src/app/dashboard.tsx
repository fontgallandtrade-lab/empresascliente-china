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

  const initial =
    user?.name
      ?.trim()
      .charAt(0)
      .toUpperCase() || 'U';

  async function handleLogout() {
    await logoutUser();
    router.replace('/login' as any);
  }

  function handleNovaEntrega() {
    router.push('/nova-entrega' as any);
  }

  function handleAcompanhar() {
    router.push('/acompanhar' as any);
  }

  function handleHistorico() {
    router.push('/historico' as any);
  }

  function handlePerfil() {
    router.push('/perfil' as any);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.userArea}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {initial}
              </Text>
            </View>

            <View style={styles.userInformation}>
              <Text style={styles.welcomeLabel}>
                BEM-VINDO
              </Text>

              <Text
                style={styles.welcome}
                numberOfLines={1}
              >
                Olá, {user?.name || 'usuário'}
              </Text>

              <Text style={styles.accountType}>
                {user?.role === 'company'
                  ? 'Conta empresarial'
                  : 'Conta de cliente'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>
              ↪
            </Text>

            <Text style={styles.logoutText}>
              Sair
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.brandRow}>
          <Text style={styles.logo}>
            China
          </Text>

          <Text style={styles.logoAccent}>
            Fast
          </Text>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />

            <Text style={styles.onlineText}>
              Online
            </Text>
          </View>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerDecorationOne} />
          <View style={styles.bannerDecorationTwo} />

          <View style={styles.bannerIcon}>
            <Text style={styles.bannerIconText}>
              🚀
            </Text>
          </View>

          <Text style={styles.bannerTitle}>
            Entregas rápidas e seguras
          </Text>

          <Text style={styles.bannerDescription}>
            Solicite uma coleta, acompanhe cada etapa
            e tenha mais segurança na sua entrega.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.mainButton}
            onPress={handleNovaEntrega}
          >
            <Text style={styles.mainButtonIcon}>
              ＋
            </Text>

            <Text style={styles.mainButtonText}>
              SOLICITAR ENTREGA
            </Text>

            <Text style={styles.mainButtonArrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Serviços
            </Text>

            <Text style={styles.sectionSubtitle}>
              O que você deseja fazer?
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            activeOpacity={0.82}
            style={[
              styles.card,
              styles.orangeCard,
            ]}
            onPress={handleNovaEntrega}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconBox,
                  styles.orangeIconBox,
                ]}
              >
                <Text style={styles.cardIcon}>
                  📦
                </Text>
              </View>

              <Text style={styles.cardArrow}>
                ›
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Nova entrega
              </Text>

              <Text style={styles.cardDescription}>
                Informe a coleta e o destino.
              </Text>
            </View>

            <View
              style={[
                styles.cardAccent,
                styles.orangeAccent,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            style={[
              styles.card,
              styles.greenCard,
            ]}
            onPress={handleAcompanhar}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconBox,
                  styles.greenIconBox,
                ]}
              >
                <Text style={styles.cardIcon}>
                  🛵
                </Text>
              </View>

              <Text style={styles.cardArrow}>
                ›
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Acompanhar
              </Text>

              <Text style={styles.cardDescription}>
                Veja entregas em andamento.
              </Text>
            </View>

            <View
              style={[
                styles.cardAccent,
                styles.greenAccent,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            style={[
              styles.card,
              styles.blueCard,
            ]}
            onPress={handleHistorico}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconBox,
                  styles.blueIconBox,
                ]}
              >
                <Text style={styles.cardIcon}>
                  🧾
                </Text>
              </View>

              <Text style={styles.cardArrow}>
                ›
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Histórico
              </Text>

              <Text style={styles.cardDescription}>
                Consulte entregas anteriores.
              </Text>
            </View>

            <View
              style={[
                styles.cardAccent,
                styles.blueAccent,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            style={[
              styles.card,
              styles.purpleCard,
            ]}
            onPress={handlePerfil}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconBox,
                  styles.purpleIconBox,
                ]}
              >
                <Text style={styles.cardIcon}>
                  👤
                </Text>
              </View>

              <Text style={styles.cardArrow}>
                ›
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Meu perfil
              </Text>

              <Text style={styles.cardDescription}>
                Consulte os dados da sua conta.
              </Text>
            </View>

            <View
              style={[
                styles.cardAccent,
                styles.purpleAccent,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Text style={styles.securityIconText}>
              🔒
            </Text>
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Entregas protegidas
            </Text>

            <Text style={styles.securityDescription}>
              Seus pedidos utilizam códigos de retirada
              e entrega para oferecer mais segurança.
            </Text>
          </View>
        </View>

        {user?.role === 'company' && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Área da empresa
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Ferramentas empresariais
                </Text>
              </View>
            </View>

            <View style={styles.companyCard}>
              <View style={styles.companyIcon}>
                <Text style={styles.companyIconText}>
                  🏢
                </Text>
              </View>

              <Text style={styles.companyTitle}>
                Gestão empresarial
              </Text>

              <Text style={styles.companyDescription}>
                Controle solicitações, entregas, usuários
                e relatórios da sua empresa.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryButton}
              >
                <Text
                  style={
                    styles.secondaryButtonText
                  }
                >
                  ABRIR PAINEL EMPRESARIAL
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
    backgroundColor: '#f3f5f8',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 48,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  userArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#17202a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,

    shadowColor: '#17202a',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '900',
  },

  userInformation: {
    flex: 1,
  },

  welcomeLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  welcome: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },

  accountType: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,

    shadowColor: '#17202a',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  logoutIcon: {
    color: '#6b7280',
    fontSize: 17,
    marginRight: 5,
  },

  logoutText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '800',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  logo: {
    color: '#17202a',
    fontSize: 30,
    fontWeight: '900',
  },

  logoAccent: {
    color: '#f26522',
    fontSize: 30,
    fontWeight: '900',
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf8f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1ea866',
    marginRight: 6,
  },

  onlineText: {
    color: '#16824e',
    fontSize: 11,
    fontWeight: '800',
  },

  banner: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#17202a',
    borderRadius: 28,
    padding: 24,
    marginBottom: 30,

    shadowColor: '#17202a',
    shadowOpacity: 0.23,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 8,
  },

  bannerDecorationOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#223140',
    right: -65,
    top: -70,
  },

  bannerDecorationTwo: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#2a3d4f',
    right: 25,
    bottom: -55,
  },

  bannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#2b3948',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  bannerIconText: {
    fontSize: 26,
  },

  bannerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    maxWidth: '85%',
  },

  bannerDescription: {
    color: '#c8d0d9',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 22,
    maxWidth: '92%',
  },

  mainButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f26522',
    borderRadius: 17,
    paddingHorizontal: 18,
  },

  mainButtonIcon: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '400',
    marginRight: 9,
  },

  mainButtonText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  mainButtonArrow: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 31,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },

  sectionTitle: {
    color: '#17202a',
    fontSize: 22,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#8b95a1',
    fontSize: 13,
    marginTop: 3,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  card: {
    position: 'relative',
    overflow: 'hidden',
    width: '48.3%',
    minHeight: 170,
    borderRadius: 22,
    padding: 17,
    marginBottom: 14,
    justifyContent: 'space-between',

    shadowColor: '#17202a',
    shadowOpacity: 0.07,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  orangeCard: {
    backgroundColor: '#fffaf7',
  },

  greenCard: {
    backgroundColor: '#f6fcf9',
  },

  blueCard: {
    backgroundColor: '#f6f9ff',
  },

  purpleCard: {
    backgroundColor: '#faf7ff',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  orangeIconBox: {
    backgroundColor: '#ffeadf',
  },

  greenIconBox: {
    backgroundColor: '#def5e9',
  },

  blueIconBox: {
    backgroundColor: '#e3edff',
  },

  purpleIconBox: {
    backgroundColor: '#eee3ff',
  },

  cardIcon: {
    fontSize: 25,
  },

  cardArrow: {
    color: '#9ca3af',
    fontSize: 28,
    lineHeight: 29,
  },

  cardTitle: {
    color: '#17202a',
    fontSize: 17,
    fontWeight: '900',
  },

  cardDescription: {
    color: '#75808d',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },

  cardAccent: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: 4,
  },

  orangeAccent: {
    backgroundColor: '#f26522',
  },

  greenAccent: {
    backgroundColor: '#1ea866',
  },

  blueAccent: {
    backgroundColor: '#3578e5',
  },

  purpleAccent: {
    backgroundColor: '#8854d0',
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 28,

    shadowColor: '#17202a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  securityIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: '#fff1e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  securityIconText: {
    fontSize: 22,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    color: '#17202a',
    fontSize: 16,
    fontWeight: '900',
  },

  securityDescription: {
    color: '#75808d',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  companyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,

    shadowColor: '#17202a',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  companyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#eef1f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  companyIconText: {
    fontSize: 26,
  },

  companyTitle: {
    color: '#17202a',
    fontSize: 19,
    fontWeight: '900',
  },

  companyDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 19,
  },

  secondaryButton: {
    borderColor: '#f26522',
    borderWidth: 1.5,
    borderRadius: 15,
    paddingVertical: 15,
  },

  secondaryButtonText: {
    color: '#f26522',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '900',
  },
});
