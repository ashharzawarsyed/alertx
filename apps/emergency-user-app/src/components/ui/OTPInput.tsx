import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, StyleSheet } from "react-native";

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === length && !otpString.includes("")) {
      onComplete(otpString);
    }
  }, [otp, length, onComplete]);

  const handleChange = (value: string, index: number) => {
    if (disabled) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onChange?.(newOtp.join(""));

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          style={[
            styles.input,
            digit && styles.inputFilled,
            disabled && styles.inputDisabled,
          ]}
          value={digit}
          onChangeText={(value) => handleChange(value.slice(-1), index)}
          onKeyPress={({ nativeEvent }) =>
            handleKeyPress(nativeEvent.key, index)
          }
          keyboardType="numeric"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 10,
    gap: 8, // Space between inputs
  },
  input: {
    flex: 1,
    maxWidth: 50,
    height: 52,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  inputFilled: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
  },
});
