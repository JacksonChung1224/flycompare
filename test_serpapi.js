const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return;
  
  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: 'TPE',
    arrival_id: 'KIX',
    outbound_date: '2026-06-01',
    return_date: '2026-06-05',
    currency: 'TWD',
    hl: 'zh-TW',
    type: '1',
    api_key: apiKey
  });
  
  const res = await fetch('https://serpapi.com/search.json?' + params.toString());
  const data = await res.json();
  const topFlight = data.best_flights?.[0] || data.other_flights?.[0];
  
  if (topFlight?.departure_token) {
    const retParams = new URLSearchParams({
      engine: 'google_flights',
      departure_id: 'TPE',
      arrival_id: 'KIX',
      outbound_date: '2026-06-01',
      return_date: '2026-06-05',
      type: '1',
      departure_token: topFlight.departure_token,
      api_key: apiKey,
      currency: 'TWD',
      hl: 'zh-TW'
    });
    const retRes = await fetch('https://serpapi.com/search.json?' + retParams.toString());
    const retData = await retRes.json();
    console.log(retData.error ? 'Error: ' + retData.error : 'Success! Found return flights: ' + (retData.best_flights || retData.other_flights)?.length);
  }
}
run();
