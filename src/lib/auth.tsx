import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { fetchProfile, type UserProfile } from "./api";
import { isSupabaseConfigured, supabase } from "./supabase";

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  accessToken: string | null;
  profile: UserProfile | null;
  emailVerifiedNotice: boolean;
  dismissEmailVerified: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readEmailVerificationFromHash(): boolean {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return false;
  const params = new URLSearchParams(hash);
  const type = params.get("type");
  return Boolean(params.get("access_token") && (type === "signup" || type === "email" || type === "recovery"));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emailVerifiedNotice, setEmailVerifiedNotice] = useState(() => readEmailVerificationFromHash());

  const accessToken = session?.access_token ?? null;

  const refreshProfile = useCallback(async () => {
    if (!accessToken) {
      setProfile(null);
      return;
    }
    try {
      const next = await fetchProfile(accessToken);
      setProfile(next);
    } catch {
      setProfile(null);
    }
  }, [accessToken]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const dismissEmailVerified = useCallback(() => {
    setEmailVerifiedNotice(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session && window.location.hash.includes("access_token")) {
        if (readEmailVerificationFromHash()) {
          setEmailVerifiedNotice(true);
        }
        window.history.replaceState({}, "", window.location.pathname);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "SIGNED_IN" && readEmailVerificationFromHash()) {
        setEmailVerifiedNotice(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setProfile(null);
      return;
    }
    refreshProfile();
  }, [accessToken, refreshProfile]);

  const value = useMemo(
    () => ({
      ready,
      session,
      accessToken,
      profile,
      emailVerifiedNotice,
      dismissEmailVerified,
      refreshProfile,
      signOut,
    }),
    [ready, session, accessToken, profile, emailVerifiedNotice, dismissEmailVerified, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext);
}
