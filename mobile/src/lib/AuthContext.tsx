// 인증 컨텍스트. Supabase 세션을 추적하고 구글 로그인 / 로그아웃을 제공한다.
// Supabase 미설정 시 모두 비활성(no-op) — 앱은 로컬 전용으로 동작한다.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

// 소셜 로그인 후 앱으로 돌아오는 딥링크. Supabase URL Configuration 에 등록해야 한다.
const REDIRECT_URL = "formi://auth-callback";

type AuthContextValue = {
  session: Session | null;
  // 익명이 아닌 진짜 계정(구글 등)으로 로그인된 상태
  isLoggedIn: boolean;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
};

const Context = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: REDIRECT_URL,
          skipBrowserRedirect: true
        }
      });
      if (error || !data.url) return;
      const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);
      if (result.type !== "success" || !result.url) return;
      // 리다이렉트 URL 에서 토큰 추출 (해시 또는 쿼리 어느 쪽이든)
      const raw = result.url.includes("#")
        ? result.url.split("#")[1]
        : (result.url.split("?")[1] ?? "");
      const params = new URLSearchParams(raw);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
      }
    } catch {
      // 로그인 취소나 실패는 조용히 넘어간다
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // 무시
    }
  }, []);

  const isLoggedIn = Boolean(
    session && session.user && session.user.is_anonymous !== true
  );

  return (
    <Context.Provider value={{ session, isLoggedIn, signInWithGoogle, signOut }}>
      {children}
    </Context.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("AuthProvider 가 트리 위에 없습니다.");
  }
  return ctx;
}
