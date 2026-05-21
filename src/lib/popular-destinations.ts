export interface PopularDestination {
  code: string        // IATA 機場代碼
  cityZh: string      // 繁體中文城市名
  cityEn: string
  countryZh: string
  emoji: string       // 視覺輔助
  tags?: string[]     // 篩選用標籤
}

export const POPULAR_DESTINATIONS: PopularDestination[] = [
  // ── 🇯🇵 日本（台灣最熱門出遊國，虎航直飛點最多）──
  { code: 'NRT', cityZh: '東京（成田）', cityEn: 'Tokyo Narita',   countryZh: '日本', emoji: '🗼', tags: ['日本','熱門'] },
  { code: 'HND', cityZh: '東京（羽田）', cityEn: 'Tokyo Haneda',   countryZh: '日本', emoji: '🗼', tags: ['日本','熱門'] },
  { code: 'KIX', cityZh: '大阪',         cityEn: 'Osaka',           countryZh: '日本', emoji: '🏯', tags: ['日本','熱門'] },
  { code: 'FUK', cityZh: '福岡',         cityEn: 'Fukuoka',         countryZh: '日本', emoji: '🍜', tags: ['日本'] },
  { code: 'OKA', cityZh: '沖繩',         cityEn: 'Okinawa',         countryZh: '日本', emoji: '🌊', tags: ['日本'] },
  { code: 'CTS', cityZh: '札幌',         cityEn: 'Sapporo',         countryZh: '日本', emoji: '❄️', tags: ['日本'] },
  { code: 'NGO', cityZh: '名古屋',       cityEn: 'Nagoya',          countryZh: '日本', emoji: '🏟️', tags: ['日本'] },

  // ── 🇰🇷 韓國 ──
  { code: 'ICN', cityZh: '首爾（仁川）', cityEn: 'Seoul Incheon',   countryZh: '韓國', emoji: '🇰🇷', tags: ['韓國','熱門'] },
  { code: 'GMP', cityZh: '首爾（金浦）', cityEn: 'Seoul Gimpo',     countryZh: '韓國', emoji: '🇰🇷', tags: ['韓國'] },
  { code: 'PUS', cityZh: '釜山',         cityEn: 'Busan',           countryZh: '韓國', emoji: '🐟', tags: ['韓國'] },

  // ── 🇭🇰 香港（全球第一繁忙航線）──
  { code: 'HKG', cityZh: '香港',         cityEn: 'Hong Kong',       countryZh: '香港', emoji: '🌆', tags: ['東北亞','熱門'] },

  // ── 🌏 東南亞 ──
  { code: 'BKK', cityZh: '曼谷（素萬那普）', cityEn: 'Bangkok Suvarnabhumi', countryZh: '泰國',   emoji: '🐘', tags: ['東南亞','熱門'] },
  { code: 'DMK', cityZh: '曼谷（廊曼）',     cityEn: 'Bangkok Don Mueang',  countryZh: '泰國',   emoji: '🐘', tags: ['東南亞'] },
  { code: 'SGN', cityZh: '胡志明市',         cityEn: 'Ho Chi Minh City',    countryZh: '越南',   emoji: '🍜', tags: ['東南亞'] },
  { code: 'HAN', cityZh: '河內',             cityEn: 'Hanoi',               countryZh: '越南',   emoji: '🏮', tags: ['東南亞'] },
  { code: 'DAD', cityZh: '峴港',             cityEn: 'Da Nang',             countryZh: '越南',   emoji: '🏖️', tags: ['東南亞'] },
  { code: 'KUL', cityZh: '吉隆坡',           cityEn: 'Kuala Lumpur',        countryZh: '馬來西亞', emoji: '🏙️', tags: ['東南亞'] },
  { code: 'SIN', cityZh: '新加坡',           cityEn: 'Singapore',           countryZh: '新加坡', emoji: '🦁', tags: ['東南亞','熱門'] },
  { code: 'MNL', cityZh: '馬尼拉',           cityEn: 'Manila',              countryZh: '菲律賓', emoji: '🏝️', tags: ['東南亞'] },
  { code: 'CEB', cityZh: '宿霧',             cityEn: 'Cebu',                countryZh: '菲律賓', emoji: '🤿', tags: ['東南亞'] },
  { code: 'DPS', cityZh: '峇里島',           cityEn: 'Bali',                countryZh: '印尼',   emoji: '🌴', tags: ['東南亞','熱門'] },
  { code: 'CGK', cityZh: '雅加達',           cityEn: 'Jakarta',             countryZh: '印尼',   emoji: '🏙️', tags: ['東南亞'] },
]

// 前端「熱門」標籤篩選用
export const HOT_PICKS = POPULAR_DESTINATIONS.filter(d => d.tags?.includes('熱門'))
