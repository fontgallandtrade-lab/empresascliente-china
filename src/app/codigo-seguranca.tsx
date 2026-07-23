import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SecurityCodeInput, {
  type SecurityCodeInputRef,
} from '../components/SecurityCodeInput';

type CodeType = 'pickup' | 'delivery';

export default function CodigoSegurancaScreen() {
  const params = useLocalSearchParams<{
    type?: string;
    deliveryId?: string;
    publicCode?: string;
  }>();

  const inputRef =
    useRef<SecurityCodeInputRef>(null);

  const codeType: CodeType =
    params.type === 'delivery'
      ? 'delivery'
      : 'pickup';

  const isPickup = codeType === 'pickup';

  const [code, setCode] = useState('');
  const [loading, setLoading] =
    useState(false);
  const [hasError, setHasError] =
    useState(false);
  const [success, setSuccess] =
    useState(false);

  async function handleConfirm() {
    if (code.length !== 6) {
      setHasError(true);

      Alert.alert(
        'Código incompleto',
        'Digite os seis números do código de segurança.'
      );

      return;
    }

    try {
      setLoading(true);
      setHasError(false);
      setSuccess(false);

      /*
       * A validação real será conectada à rota
       * do backend do entregador.
       *
       * Não compare o código apenas no aplicativo.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      setSuccess(true);

      Alert.alert(
        isPickup
          ? 'Código de coleta informado'
          : 'Código de entrega informado',
        'A tela está pronta. O próximo passo é conectar a validação ao backend.'
      );
    } catch (error: any) {
      setHasError(true);
      setSuccess(false);

      inputRef.current?.clear();

      Alert.alert(
        'Código incorreto',
        error?.response?.data?.message ||
          'Confira o código e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(value: string) {
    setCode(value);
    setHasError(false);
    setSuccess(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#151515"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isPickup
              ? 'Validar retirada'
              : 'Validar entrega'}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.headerDivider} />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.instructionRow}>
            <Text style={styles.required}>*</Text>

            <Text style={styles.instruction}>
              {isPickup
                ? 'Peça o código de retirada para o cliente'
                : 'Peça o código de entrega ao destinatário'}
            </Text>
          </View>

          <Text style={styles.description}>
            {isPickup
              ? 'Peça ao cliente o código de 6 dígitos e digite abaixo para confirmar que a coleta foi realizada.'
              : 'Peça ao destinatário o código de 6 dígitos e digite abaixo para confirmar que a entrega foi realizada.'}
          </Text>

          {params.publicCode && (
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryBadgeLabel}>
                ENTREGA
              </Text>

              <Text style={styles.deliveryBadgeCode}>
                {params.publicCode}
              </Text>
            </View>
          )}

          <View style={styles.codeArea}>
            <SecurityCodeInput
              ref={inputRef}
              length={6}
              disabled={loading || success}
              hasError={hasError}
              success={success}
              onChangeCode={handleCodeChange}
            />
          </View>

          {hasError && (
            <Text style={styles.errorText}>
              Código inválido. Confira os números.
            </Text>
          )}

          {success && (
            <Text style={styles.successText}>
              Código preenchido com sucesso.
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.helpButton}
            onPress={() =>
              Alert.alert(
                isPickup
                  ? 'O cliente não tem o código?'
                  : 'O destinatário não tem o código?',
                isPickup
                  ? 'Verifique se você está no endereço correto e peça ao cliente para abrir os detalhes da entrega no aplicativo ChinaFast.'
                  : 'Verifique se você está no endereço correto e peça ao destinatário para consultar o código recebido.'
              )
            }
          >
            <Text style={styles.helpText}>
              {isPickup
                ? 'O cliente não recebeu o código de retirada?'
                : 'O destinatário não recebeu o código de entrega?'}
            </Text>
          </TouchableOpacity>

          <View style={styles.securityCard}>
            <View style={styles.shield}>
              <Text style={styles.shieldIcon}>🔒</Text>
            </View>

            <Text style={styles.securityText}>
              {isPickup
                ? 'Este código garante a segurança da coleta. Nunca retire a mercadoria sem confirmar o código.'
                : 'Este código garante a segurança da entrega. Nunca finalize sem confirmar com o destinatário.'}
            </Text>
          </View>

          <View style={styles.testArea}>
            <Text style={styles.testIcon}>📝</Text>

            <View>
              <Text style={styles.testLabel}>
                Tela de teste:
              </Text>

              <Text style={styles.testValue}>
                use qualquer código de 6 números
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              code.length !== 6 ||
              loading ||
              success
            }
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              (code.length !== 6 ||
                loading ||
                success) &&
                styles.confirmButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#111111"
              />
            ) : (
              <Text
                style={[
                  styles.confirmButtonText,
                  (code.length !== 6 ||
                    success) &&
                    styles.confirmButtonTextDisabled,
                ]}
              >
                {isPickup
                  ? 'VALIDAR RETIRADA'
                  : 'VALIDAR ENTREGA'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            onPress={() =>
              inputRef.current?.clear()
            }
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>
              Limpar código
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ORANGE = '#ff6b2c';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    height: 92,
    paddingHorizontal: 20,
    backgroundColor: '#2b2b2b',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 54,
    height: 54,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backIcon: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: '300',
    lineHeight: 58,
  },

  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '900',
    textAlign: 'center',
  },

  headerSpacer: {
    width: 54,
  },

  headerDivider: {
    height: 68,
    backgroundColor: '#070707',
  },

  content: {
    flexGrow: 1,
    backgroundColor: '#2b2b2b',
    paddingHorizontal: 27,
    paddingTop: 38,
    paddingBottom: 20,
  },

  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  required: {
    color: '#ff4567',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 48,
    marginRight: 8,
  },

  instruction: {
    flex: 1,
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 37,
    fontWeight: '900',
  },

  description: {
    color: '#c3c3c3',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 14,
    marginLeft: 28,
  },

  deliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: '#454545',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 22,
    marginLeft: 28,
  },

  deliveryBadgeLabel: {
    color: '#8c8c8c',
    fontSize: 10,
    fontWeight: '900',
  },

  deliveryBadgeCode: {
    color: ORANGE,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },

  codeArea: {
    marginTop: 38,
  },

  errorText: {
    color: '#f87171',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 13,
  },

  successText: {
    color: '#4ade80',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 13,
  },

  helpButton: {
    marginTop: 30,
  },

  helpText: {
    color: ORANGE,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#3b3b3b',
    borderRadius: 18,
    padding: 18,
    marginTop: 30,
  },

  shield: {
    width: 52,
    height: 52,
    borderWidth: 2,
    borderColor: ORANGE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  shieldIcon: {
    fontSize: 24,
  },

  securityText: {
    flex: 1,
    color: '#c9c9c9',
    fontSize: 14,
    lineHeight: 20,
  },

  testArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 6,
  },

  testIcon: {
    fontSize: 31,
    marginRight: 14,
  },

  testLabel: {
    color: '#a6a6a6',
    fontSize: 14,
  },

  testValue: {
    color: ORANGE,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },

  bottomSpace: {
    height: 20,
  },

  footer: {
    backgroundColor: '#2b2b2b',
    paddingHorizontal: 27,
    paddingTop: 14,
    paddingBottom: 13,
  },

  confirmButton: {
    height: 64,
    backgroundColor: ORANGE,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmButtonDisabled: {
    backgroundColor: '#141414',
  },

  confirmButtonText: {
    color: '#101010',
    fontSize: 18,
    fontWeight: '900',
  },

  confirmButtonTextDisabled: {
    color: '#575757',
  },

  clearButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  clearText: {
    color: '#999999',
    fontSize: 13,
    fontWeight: '700',
  },
});
