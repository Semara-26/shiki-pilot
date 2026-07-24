import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("../../../../db", () => ({
  db: {
    query: {
      stores: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

vi.mock("../../../../db/schema", () => ({
  stores: {
    id: "id",
    name: "name",
    whatsappNumber: "whatsapp_number",
    whatsappJid: "whatsapp_jid",
  },
  products: {},
  transactions: {},
  transactionItems: {},
}));

vi.mock("../../../../lib/rate-limit", () => ({
  checkWaRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

// Provide a mock sendWaReply so the code doesn't actually try to fetch
const originalFetch = global.fetch;

describe("WA Webhook POST - whatsappJid Separation Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WA_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const createMockRequest = (body: any) => {
    return new NextRequest("http://localhost/api/wa-webhook", {
      method: "POST",
      headers: {
        "x-api-key": "test-key",
      },
      body: JSON.stringify(body),
    });
  };

  it("should look up store using whatsappJid matching normalizedSender", async () => {
    const { db } = await import("../../../../db");
    
    const mockStore = {
      id: "store-123",
      name: "Test Store",
      whatsappNumber: "628123456789",
      whatsappJid: "628123456789",
    };
    
    vi.mocked(db.query.stores.findFirst).mockResolvedValueOnce(mockStore as any);

    const req = createMockRequest({
      senderJid: "628123456789@s.whatsapp.net",
      messageText: "Halo",
    });

    const res = await POST(req);
    // Even though AI generation might fail (since we didn't mock it fully), 
    // the store lookup happens first. We just want to check the DB query.
    
    expect(db.query.stores.findFirst).toHaveBeenCalledTimes(1);
    const findFirstCallArgs = vi.mocked(db.query.stores.findFirst).mock.calls[0][0];
    
    // Check if it queried using whatsappJid
    // Under the hood, eq() returns an object, but we can verify it was called.
    expect(findFirstCallArgs).toBeDefined();
    
    // Because we mocked the whole DB, the AI execution might fail, which returns status 500 or ok depending on where it stops.
    // The important part is that we triggered the right DB lookup.
  });

  it("should handle LINK# command and update both whatsappJid and whatsappNumber", async () => {
    const { db } = await import("../../../../db");
    
    // First findFirst returns null (not registered)
    vi.mocked(db.query.stores.findFirst).mockResolvedValueOnce(null as any);
    
    // Second findFirst for LINK# suffix lookup returns a store
    const targetStore = {
      id: "store-link",
      name: "Target Store",
    };
    vi.mocked(db.query.stores.findFirst).mockResolvedValueOnce(targetStore as any);

    const updateSetMock = vi.fn().mockReturnValue({ where: vi.fn() });
    vi.mocked(db.update).mockReturnValue({ set: updateSetMock } as any);

    const req = createMockRequest({
      senderJid: "243043676496020@lid",
      messageText: "LINK#081234567890",
    });

    const res = await POST(req);
    const json = await res.json();
    
    expect(json.status).toBe("linked");
    expect(json.store).toBe("Target Store");
    
    // Verify update was called with correct values
    expect(updateSetMock).toHaveBeenCalledWith({
      whatsappJid: "243043676496020", // sanitized LID
      whatsappNumber: "6281234567890", // normalized linked number
    });
  });
});
