import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfile, upsertProfile } from '../profile';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/src/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@/src/db/schema', () => ({
  profiles: {
    userId: 'userId',
    displayName: 'displayName',
    avatarUrl: 'avatarUrl',
  },
}));

vi.mock('@/src/lib/supabase/server', () => ({
  createSupabaseClient: vi.fn(),
}));

import { auth } from '@clerk/nextjs/server';
import { db } from '@/src/db';
import { createSupabaseClient } from '@/src/lib/supabase/server';

describe('Profile Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return null if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);
      const result = await getProfile();
      expect(result).toBeNull();
    });

    it('should return profile data when authenticated and data exists', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-123' } as any);
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([{ displayName: 'Test User', avatarUrl: 'http://example.com/avatar.jpg' }]);
      
      vi.mocked(db.select).mockImplementation(() => ({
        from: mockFrom,
      }) as any);
      
      mockFrom.mockImplementation(() => ({
        where: mockWhere,
      }));
      
      mockWhere.mockImplementation(() => ({
        limit: mockLimit,
      }));

      const result = await getProfile();
      
      expect(result).toEqual({ displayName: 'Test User', avatarUrl: 'http://example.com/avatar.jpg' });
    });
  });

  describe('upsertProfile', () => {
    it('should fail if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);
      const result = await upsertProfile('New Name');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Tidak terautentikasi.');
    });

    it('should reject file size over 5MB', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-123' } as any);
      const largeFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
      
      const result = await upsertProfile('New Name', largeFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Ukuran file maksimal 5MB.');
    });

    it('should reject unsupported file types', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-123' } as any);
      const svgFile = new File(['<svg></svg>'], 'avatar.svg', { type: 'image/svg+xml' });
      
      const result = await upsertProfile('New Name', svgFile);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Tipe file tidak didukung');
    });

    it('should successfully update profile without avatar', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-123' } as any);
      
      const mockValues = vi.fn().mockReturnThis();
      const mockOnConflictDoUpdate = vi.fn().mockResolvedValue([]);
      
      vi.mocked(db.insert).mockImplementation(() => ({
        values: mockValues,
      }) as any);
      
      mockValues.mockImplementation(() => ({
        onConflictDoUpdate: mockOnConflictDoUpdate,
      }));

      const result = await upsertProfile('Updated Name');
      
      expect(result.success).toBe(true);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user-123',
        displayName: 'Updated Name',
      }));
    });
  });
});
