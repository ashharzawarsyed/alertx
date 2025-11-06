import React, { useState, forwardRef } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: "default" | "filled" | "outline";
  size?: "small" | "medium" | "large";
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = "outline",
      size = "medium",
      containerStyle,
      inputStyle,
      labelStyle,
      required = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const getContainerStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        ...styles.container,
        ...styles[`${size}Container`],
      };

      const variantStyles: Record<string, ViewStyle> = {
        default: {
          borderWidth: 0,
          backgroundColor: theme.colors.backgroundTertiary,
        },
        filled: {
          borderWidth: 0,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        outline: {
          borderWidth: 2,
          borderColor: error
            ? theme.colors.error
            : isFocused
              ? theme.colors.primary
              : theme.colors.border,
          backgroundColor: theme.colors.white,
        },
      };

      return {
        ...baseStyle,
        ...variantStyles[variant],
      };
    };

    const getIconSize = () => {
      const sizes = {
        small: 18,
        medium: 20,
        large: 22,
      };
      return sizes[size];
    };

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, labelStyle]}>
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
        )}

        <View style={getContainerStyle()}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={getIconSize()}
              color={error ? theme.colors.error : theme.colors.textSecondary}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            ref={ref}
            style={[styles.input, styles[`${size}Input`], inputStyle]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor={theme.colors.textLight}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIcon}
            >
              <Ionicons
                name={rightIcon}
                size={getIconSize()}
                color={error ? theme.colors.error : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {(error || helperText) && (
          <Text
            style={[
              styles.helperText,
              error ? styles.errorText : styles.normalHelperText,
            ]}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginVertical: theme.spacing.xs,
  },
  labelContainer: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  required: {
    color: theme.colors.error,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  smallContainer: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.sm,
  },
  mediumContainer: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
  },
  largeContainer: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.normal,
  },
  smallInput: {
    fontSize: theme.fontSize.sm,
  },
  mediumInput: {
    fontSize: theme.fontSize.md,
  },
  largeInput: {
    fontSize: theme.fontSize.lg,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error,
  },
  normalHelperText: {
    color: theme.colors.textSecondary,
  },
});
