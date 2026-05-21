export interface PopularDestination {
  code: string        // IATA 機場代碼
  cityZh: string      // 繁體中文城市名
  nameZh: string      // 繁體中文機場名
  cityEn: string
  countryZh: string
  emoji: string       // 視覺輔助
  tags?: string[]     // 篩選用標籤
}

export const POPULAR_DESTINATIONS: PopularDestination[] = [
  // ── 🇯🇵 日本（台灣最熱門出遊國，虎航直飛點最多）──
  { code: 'NRT', cityZh: '東京', nameZh: '成田機場',       cityEn: 'Tokyo Narita',   countryZh: '日本', emoji: '🗼', tags: ['日本','熱門'] },
  { code: 'HND', cityZh: '東京', nameZh: '羽田機場',       cityEn: 'Tokyo Haneda',   countryZh: '日本', emoji: '🗼', tags: ['日本','熱門'] },
  { code: 'KIX', cityZh: '大阪', nameZh: '關西機場',       cityEn: 'Osaka',           countryZh: '日本', emoji: '🏯', tags: ['日本','熱門'] },
  { code: 'FUK', cityZh: '福岡', nameZh: '福岡機場',       cityEn: 'Fukuoka',         countryZh: '日本', emoji: '🍜', tags: ['日本'] },
  { code: 'OKA', cityZh: '沖繩', nameZh: '那霸機場',       cityEn: 'Okinawa',         countryZh: '日本', emoji: '🌊', tags: ['日本'] },
  { code: 'CTS', cityZh: '札幌', nameZh: '新千歲機場',     cityEn: 'Sapporo',         countryZh: '日本', emoji: '❄️', tags: ['日本'] },
  { code: 'NGO', cityZh: '名古屋', nameZh: '中部機場',     cityEn: 'Nagoya',          countryZh: '日本', emoji: '🏟️', tags: ['日本'] },
  { code: 'KMJ', cityZh: '熊本', nameZh: '熊本機場',       cityEn: 'Kumamoto',        countryZh: '日本', emoji: '🐻', tags: ['日本'] },
  { code: 'HKD', cityZh: '函館', nameZh: '函館機場',       cityEn: 'Hakodate',        countryZh: '日本', emoji: '🦑', tags: ['日本'] },

  // ── 🇰🇷 韓國 ──
  { code: 'ICN', cityZh: '首爾', nameZh: '仁川機場',       cityEn: 'Seoul Incheon',   countryZh: '韓國', emoji: '🇰🇷', tags: ['韓國','熱門'] },
  { code: 'GMP', cityZh: '首爾', nameZh: '金浦機場',       cityEn: 'Seoul Gimpo',     countryZh: '韓國', emoji: '🇰🇷', tags: ['韓國'] },
  { code: 'PUS', cityZh: '釜山', nameZh: '金海機場',       cityEn: 'Busan',           countryZh: '韓國', emoji: '🐟', tags: ['韓國'] },

  // ── 🇭🇰 香港（全球第一繁忙航線）──
  { code: 'HKG', cityZh: '香港', nameZh: '香港機場',       cityEn: 'Hong Kong',       countryZh: '香港', emoji: '🌆', tags: ['東北亞','熱門'] },

  // ── 🌏 東南亞 ──
  { code: 'BKK', cityZh: '曼谷', nameZh: '素萬那普機場',   cityEn: 'Bangkok Suvarnabhumi', countryZh: '泰國',   emoji: '🐘', tags: ['東南亞','熱門'] },
  { code: 'DMK', cityZh: '曼谷', nameZh: '廊曼機場',       cityEn: 'Bangkok Don Mueang',  countryZh: '泰國',   emoji: '🐘', tags: ['東南亞'] },
  { code: 'SGN', cityZh: '胡志明市', nameZh: '新山一機場', cityEn: 'Ho Chi Minh City',    countryZh: '越南',   emoji: '🍜', tags: ['東南亞'] },
  { code: 'HAN', cityZh: '河內', nameZh: '內排機場',       cityEn: 'Hanoi',               countryZh: '越南',   emoji: '🏮', tags: ['東南亞'] },
  { code: 'DAD', cityZh: '峴港', nameZh: '峴港機場',       cityEn: 'Da Nang',             countryZh: '越南',   emoji: '🏖️', tags: ['東南亞'] },
  { code: 'KUL', cityZh: '吉隆坡', nameZh: '吉隆坡機場',  cityEn: 'Kuala Lumpur',        countryZh: '馬來西亞', emoji: '🏙️', tags: ['東南亞'] },
  { code: 'SIN', cityZh: '新加坡', nameZh: '樟宜機場',     cityEn: 'Singapore',           countryZh: '新加坡', emoji: '🦁', tags: ['東南亞','熱門'] },
  { code: 'MNL', cityZh: '馬尼拉', nameZh: '艾奎諾機場',   cityEn: 'Manila',              countryZh: '菲律賓', emoji: '🏝️', tags: ['東南亞'] },
  { code: 'CEB', cityZh: '宿霧', nameZh: '麥克坦機場',     cityEn: 'Cebu',                countryZh: '菲律賓', emoji: '🤿', tags: ['東南亞'] },
  { code: 'DPS', cityZh: '峇里島', nameZh: '乌拉萊機場',   cityEn: 'Bali',                countryZh: '印尼',   emoji: '🌴', tags: ['東南亞','熱門'] },
  { code: 'CGK', cityZh: '雅加達', nameZh: '蘇加諾機場',   cityEn: 'Jakarta',             countryZh: '印尼',   emoji: '🏙️', tags: ['東南亞'] },
]

// 前端「熱門」標籤篩選用
export const HOT_PICKS = POPULAR_DESTINATIONS.filter(d => d.tags?.includes('熱門'))
