// RN 런타임 예외를 잡아 빈 화면 대신 복구 UI 를 보여주는 최상위 경계.
import { Component, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../lib/tokens";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) {
      console.error("Formi error boundary caught", error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>잠깐 문제가 생겼어요.</Text>
          <Text style={styles.body}>
            기록은 안전하게 저장되어 있어요. 다시 시도하면 이어서 쓸 수 있어요.
          </Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>다시 시도</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background
  },
  card: {
    width: "100%",
    maxWidth: 360,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm,
    alignItems: "center"
  },
  title: { ...typography.h2, color: colors.ink, textAlign: "center" },
  body: { ...typography.body, color: colors.muted, textAlign: "center" },
  button: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: colors.ink
  },
  buttonText: { color: colors.white, fontWeight: "900", fontSize: 14 }
});
