import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export interface SecurityCodeInputRef {
  clear: () => void;
  focus: () => void;
}

interface SecurityCodeInputProps {
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  success?: boolean;
  onChangeCode?: (code: string) => void;
  onComplete?: (code: string) => void;
}

const SecurityCodeInput = forwardRef<
  SecurityCodeInputRef,
  SecurityCodeInputProps
>(
  (
    {
      length = 6,
      disabled = false,
      hasError = false,
      success = false,
      onChangeCode,
      onComplete,
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);

    const [code, setCode] = useState('');
    const [focused, setFocused] = useState(false);

    function handleChange(value: string) {
      const numericCode = value
        .replace(/\D/g, '')
        .slice(0, length);

      setCode(numericCode);
      onChangeCode?.(numericCode);

      if (numericCode.length === length) {
        onComplete?.(numericCode);
      }
    }

    function clear() {
      setCode('');
      onChangeCode?.('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    useImperativeHandle(ref, () => ({
      clear,
      focus: () => inputRef.current?.focus(),
    }));

    const activeIndex =
      code.length >= length
        ? length - 1
        : code.length;

    return (
      <Pressable
        onPress={() => {
          if (!disabled) {
            inputRef.current?.focus();
          }
        }}
        style={styles.wrapper}
      >
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          maxLength={length}
          editable={!disabled}
          caretHidden
          autoFocus
          contextMenuHidden={false}
          style={styles.hiddenInput}
        />

        <View style={styles.boxes}>
          {Array.from({ length }).map((_, index) => {
            const digit = code[index] || '';

            const isActive =
              focused &&
              !disabled &&
              index === activeIndex;

            return (
              <View
                key={index}
                style={[
                  styles.box,
                  isActive && styles.boxActive,
                  hasError && styles.boxError,
                  success && styles.boxSuccess,
                  disabled && styles.boxDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.digit,
                    hasError && styles.digitError,
                    success && styles.digitSuccess,
                  ]}
                >
                  {digit}
                </Text>

                {isActive && !digit && (
                  <View style={styles.cursor} />
                )}
              </View>
            );
          })}
        </View>
      </Pressable>
    );
  }
);

SecurityCodeInput.displayName = 'SecurityCodeInput';

export default SecurityCodeInput;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  boxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  box: {
    flex: 1,
    height: 74,
    maxWidth: 58,
    borderWidth: 2,
    borderColor: '#454545',
    borderRadius: 17,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  boxActive: {
    borderColor: '#ff6b2c',
    borderWidth: 3,
  },

  boxError: {
    borderColor: '#ef4444',
    backgroundColor: '#261313',
  },

  boxSuccess: {
    borderColor: '#22c55e',
    backgroundColor: '#102017',
  },

  boxDisabled: {
    opacity: 0.7,
  },

  digit: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '900',
  },

  digitError: {
    color: '#fca5a5',
  },

  digitSuccess: {
    color: '#86efac',
  },

  cursor: {
    width: 2,
    height: 34,
    backgroundColor: '#ff6b2c',
    borderRadius: 2,
  },
});
