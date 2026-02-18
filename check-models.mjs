import { config } from 'dotenv';
config({ path: '.env.local' }); 

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error("❌ ERROR: API Key tidak ditemukan.");
  process.exit(1);
}

async function listModels() {
  console.log(`🔍 Memeriksa daftar SEMUA model untuk API Key: ${API_KEY.substring(0, 5)}...`);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Google Error:", data.error.message);
      return;
    }

    console.log("✅ KONEKSI SUKSES! Berikut model GENERATIVE (Chat) yang tersedia:");
    
    // Kita cari model yang BUKAN embedding (biasanya untuk chat)
    const chatModels = data.models?.filter(m => !m.name.includes("embedding")) || [];
    
    chatModels.forEach(model => {
        console.log(`- ${model.name} \n  (Capabilities: ${model.supportedGenerationMethods})`);
        console.log("---------------------------------------------------");
    });

  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

listModels();