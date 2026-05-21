import type { Airport } from './types';

// ============================================================
// 手動輸入搜尋的國家 → 機場對應表 (包含出發地與目的地)
// ============================================================
export const AIRPORTS: Airport[] = [
  // ════ 台灣 (主要作為出發地) ════
  { code: 'TPE', nameZh: '桃園國際機場', cityZh: '台北', countryZh: '台灣',
    keywords: ['台灣','台北','桃園','taipei','taiwan','tpe','taoyuan'] },
  { code: 'TSA', nameZh: '松山機場', cityZh: '台北', countryZh: '台灣',
    keywords: ['台灣','台北','松山','songshan','tsa'] },
  { code: 'KHH', nameZh: '高雄國際機場', cityZh: '高雄', countryZh: '台灣',
    keywords: ['台灣','高雄','小港','kaohsiung','khh'] },
  { code: 'RMQ', nameZh: '台中清泉崗機場', cityZh: '台中', countryZh: '台灣',
    keywords: ['台灣','台中','清泉崗','taichung','rmq'] },

  // ════ 日本 ════
  { code: 'NRT', nameZh: '成田國際機場',   cityZh: '東京', countryZh: '日本',
    keywords: ['日本','東京','成田','tokyo','japan','nrt'] },
  { code: 'HND', nameZh: '羽田機場',       cityZh: '東京', countryZh: '日本',
    keywords: ['日本','東京','羽田','haneda','tokyo','hnd'] },
  { code: 'KIX', nameZh: '關西國際機場',   cityZh: '大阪', countryZh: '日本',
    keywords: ['日本','大阪','關西','osaka','japan','kix'] },
  { code: 'FUK', nameZh: '福岡機場',       cityZh: '福岡', countryZh: '日本',
    keywords: ['日本','福岡','fukuoka','fuk'] },
  { code: 'OKA', nameZh: '那霸機場',       cityZh: '沖繩', countryZh: '日本',
    keywords: ['日本','沖繩','那霸','okinawa','oka'] },
  { code: 'CTS', nameZh: '新千歲機場',     cityZh: '札幌', countryZh: '日本',
    keywords: ['日本','札幌','北海道','sapporo','hokkaido','cts'] },
  { code: 'NGO', nameZh: '中部國際機場',   cityZh: '名古屋', countryZh: '日本',
    keywords: ['日本','名古屋','中部','nagoya','ngo'] },
  { code: 'SDJ', nameZh: '仙台機場',       cityZh: '仙台', countryZh: '日本',
    keywords: ['日本','仙台','sendai','sdj'] },
  { code: 'KMJ', nameZh: '熊本機場',       cityZh: '熊本', countryZh: '日本',
    keywords: ['日本','熊本','kumamoto','kmj'] },
  { code: 'HKD', nameZh: '函館機場',       cityZh: '函館', countryZh: '日本',
    keywords: ['日本','函館','hakodate','hkd'] },

  // ════ 韓國 ════
  { code: 'ICN', nameZh: '仁川國際機場',   cityZh: '首爾', countryZh: '韓國',
    keywords: ['韓國','首爾','仁川','seoul','korea','icn'] },
  { code: 'GMP', nameZh: '金浦國際機場',   cityZh: '首爾', countryZh: '韓國',
    keywords: ['韓國','首爾','金浦','gimpo','gmp'] },
  { code: 'PUS', nameZh: '金海國際機場',   cityZh: '釜山', countryZh: '韓國',
    keywords: ['韓國','釜山','busan','pus'] },

  // ════ 香港 ════
  { code: 'HKG', nameZh: '香港國際機場',   cityZh: '香港', countryZh: '香港',
    keywords: ['香港','hong kong','hkg'] },

  // ════ 泰國 ════
  { code: 'BKK', nameZh: '素萬那普機場',   cityZh: '曼谷', countryZh: '泰國',
    keywords: ['泰國','曼谷','素萬那普','bangkok','thailand','bkk'] },
  { code: 'DMK', nameZh: '廊曼機場',       cityZh: '曼谷', countryZh: '泰國',
    keywords: ['泰國','曼谷','廊曼','don mueang','dmk'] },
  { code: 'CNX', nameZh: '清邁國際機場',   cityZh: '清邁', countryZh: '泰國',
    keywords: ['泰國','清邁','chiang mai','cnx'] },
  { code: 'HKT', nameZh: '普吉島機場',     cityZh: '普吉', countryZh: '泰國',
    keywords: ['泰國','普吉','phuket','hkt'] },

  // ════ 越南 ════
  { code: 'SGN', nameZh: '新山一國際機場', cityZh: '胡志明市', countryZh: '越南',
    keywords: ['越南','胡志明','ho chi minh','saigon','sgn'] },
  { code: 'HAN', nameZh: '內排國際機場',   cityZh: '河內',     countryZh: '越南',
    keywords: ['越南','河內','hanoi','han'] },
  { code: 'DAD', nameZh: '峴港國際機場',   cityZh: '峴港',     countryZh: '越南',
    keywords: ['越南','峴港','da nang','dad'] },

  // ════ 馬來西亞 ════
  { code: 'KUL', nameZh: '吉隆坡國際機場', cityZh: '吉隆坡', countryZh: '馬來西亞',
    keywords: ['馬來西亞','吉隆坡','kuala lumpur','malaysia','kul'] },

  // ════ 新加坡 ════
  { code: 'SIN', nameZh: '樟宜機場',       cityZh: '新加坡', countryZh: '新加坡',
    keywords: ['新加坡','singapore','sin'] },

  // ════ 菲律賓 ════
  { code: 'MNL', nameZh: '馬尼拉機場',     cityZh: '馬尼拉', countryZh: '菲律賓',
    keywords: ['菲律賓','馬尼拉','manila','mnl'] },
  { code: 'CEB', nameZh: '宿霧機場',       cityZh: '宿霧',   countryZh: '菲律賓',
    keywords: ['菲律賓','宿霧','cebu','ceb'] },

  // ════ 印尼 ════
  { code: 'DPS', nameZh: '峇里島機場',     cityZh: '峇里島', countryZh: '印尼',
    keywords: ['印尼','峇里','巴里','bali','dps'] },
  { code: 'CGK', nameZh: '蘇加諾哈達機場', cityZh: '雅加達', countryZh: '印尼',
    keywords: ['印尼','雅加達','jakarta','cgk'] },
]
