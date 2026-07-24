"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import { getProfile } from "@/src/lib/actions/profile";

interface ProfileData {
  displayName: string | null;
  avatarUrl: string | null;
}

interface ProfileContextValue {
  profile: ProfileData;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  setProfileOptimistic: (data: Partial<ProfileData>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [profile, setProfile] = useState<ProfileData>({
    displayName: null,
    avatarUrl: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isClerkLoaded || !user) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await getProfile();
      setProfile({
        displayName: data?.displayName ?? null,
        avatarUrl: data?.avatarUrl ?? null,
      });
    } catch {
      // Gagal fetch, biarkan null (fallback ke Clerk data di UI)
    } finally {
      setIsLoading(false);
    }
  }, [isClerkLoaded, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Optimistic update — perbarui UI seketika sebelum DB selesai tersimpan
  const setProfileOptimistic = useCallback((data: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        refreshProfile: fetchProfile,
        setProfileOptimistic,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile harus digunakan di dalam ProfileProvider");
  }
  return ctx;
}
