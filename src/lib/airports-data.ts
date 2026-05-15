import type { Airport } from './types';

// ============================================================
// 熱門機場資料庫（30+ 個，涵蓋台灣出發的熱門目的地）
// ============================================================
export const AIRPORTS: Airport[] = [
  // === 台灣 ===
  { code: 'TPE', nameZh: '桃園國際機場', nameEn: 'Taoyuan International Airport', cityZh: '台北', cityEn: 'Taipei', countryZh: '台灣', countryEn: 'Taiwan' },
  { code: 'TSA', nameZh: '台北松山機場', nameEn: 'Taipei Songshan Airport', cityZh: '台北', cityEn: 'Taipei', countryZh: '台灣', countryEn: 'Taiwan' },
  { code: 'KHH', nameZh: '高雄國際機場', nameEn: 'Kaohsiung International Airport', cityZh: '高雄', cityEn: 'Kaohsiung', countryZh: '台灣', countryEn: 'Taiwan' },
  { code: 'RMQ', nameZh: '台中清泉崗機場', nameEn: 'Taichung Airport', cityZh: '台中', cityEn: 'Taichung', countryZh: '台灣', countryEn: 'Taiwan' },

  // === 日本 ===
  { code: 'NRT', nameZh: '成田國際機場', nameEn: 'Narita International Airport', cityZh: '東京', cityEn: 'Tokyo', countryZh: '日本', countryEn: 'Japan' },
  { code: 'HND', nameZh: '羽田機場', nameEn: 'Haneda Airport', cityZh: '東京', cityEn: 'Tokyo', countryZh: '日本', countryEn: 'Japan' },
  { code: 'KIX', nameZh: '關西國際機場', nameEn: 'Kansai International Airport', cityZh: '大阪', cityEn: 'Osaka', countryZh: '日本', countryEn: 'Japan' },
  { code: 'ITM', nameZh: '大阪伊丹機場', nameEn: 'Osaka Itami Airport', cityZh: '大阪', cityEn: 'Osaka', countryZh: '日本', countryEn: 'Japan' },
  { code: 'NGO', nameZh: '中部國際機場', nameEn: 'Chubu Centrair International Airport', cityZh: '名古屋', cityEn: 'Nagoya', countryZh: '日本', countryEn: 'Japan' },
  { code: 'FUK', nameZh: '福岡機場', nameEn: 'Fukuoka Airport', cityZh: '福岡', cityEn: 'Fukuoka', countryZh: '日本', countryEn: 'Japan' },
  { code: 'CTS', nameZh: '新千歲機場', nameEn: 'New Chitose Airport', cityZh: '札幌', cityEn: 'Sapporo', countryZh: '日本', countryEn: 'Japan' },
  { code: 'OKA', nameZh: '那霸機場', nameEn: 'Naha Airport', cityZh: '沖繩', cityEn: 'Okinawa', countryZh: '日本', countryEn: 'Japan' },

  // === 韓國 ===
  { code: 'ICN', nameZh: '仁川國際機場', nameEn: 'Incheon International Airport', cityZh: '首爾', cityEn: 'Seoul', countryZh: '韓國', countryEn: 'South Korea' },
  { code: 'GMP', nameZh: '金浦國際機場', nameEn: 'Gimpo International Airport', cityZh: '首爾', cityEn: 'Seoul', countryZh: '韓國', countryEn: 'South Korea' },
  { code: 'PUS', nameZh: '金海國際機場', nameEn: 'Gimhae International Airport', cityZh: '釜山', cityEn: 'Busan', countryZh: '韓國', countryEn: 'South Korea' },

  // === 東南亞 ===
  { code: 'BKK', nameZh: '蘇凡納布機場', nameEn: 'Suvarnabhumi Airport', cityZh: '曼谷', cityEn: 'Bangkok', countryZh: '泰國', countryEn: 'Thailand' },
  { code: 'DMK', nameZh: '廊曼機場', nameEn: 'Don Mueang International Airport', cityZh: '曼谷', cityEn: 'Bangkok', countryZh: '泰國', countryEn: 'Thailand' },
  { code: 'CNX', nameZh: '清邁機場', nameEn: 'Chiang Mai International Airport', cityZh: '清邁', cityEn: 'Chiang Mai', countryZh: '泰國', countryEn: 'Thailand' },
  { code: 'SIN', nameZh: '樟宜機場', nameEn: 'Changi Airport', cityZh: '新加坡', cityEn: 'Singapore', countryZh: '新加坡', countryEn: 'Singapore' },
  { code: 'KUL', nameZh: '吉隆坡國際機場', nameEn: 'Kuala Lumpur International Airport', cityZh: '吉隆坡', cityEn: 'Kuala Lumpur', countryZh: '馬來西亞', countryEn: 'Malaysia' },
  { code: 'MNL', nameZh: '馬尼拉國際機場', nameEn: 'Ninoy Aquino International Airport', cityZh: '馬尼拉', cityEn: 'Manila', countryZh: '菲律賓', countryEn: 'Philippines' },
  { code: 'CEB', nameZh: '宿霧國際機場', nameEn: 'Mactan-Cebu International Airport', cityZh: '宿霧', cityEn: 'Cebu', countryZh: '菲律賓', countryEn: 'Philippines' },
  { code: 'SGN', nameZh: '新山一國際機場', nameEn: 'Tan Son Nhat International Airport', cityZh: '胡志明市', cityEn: 'Ho Chi Minh City', countryZh: '越南', countryEn: 'Vietnam' },
  { code: 'HAN', nameZh: '內排國際機場', nameEn: 'Noi Bai International Airport', cityZh: '河內', cityEn: 'Hanoi', countryZh: '越南', countryEn: 'Vietnam' },
  { code: 'DAD', nameZh: '峴港國際機場', nameEn: 'Da Nang International Airport', cityZh: '峴港', cityEn: 'Da Nang', countryZh: '越南', countryEn: 'Vietnam' },
  { code: 'DPS', nameZh: '伍拉賴機場', nameEn: 'Ngurah Rai International Airport', cityZh: '峇里島', cityEn: 'Bali', countryZh: '印尼', countryEn: 'Indonesia' },
  { code: 'CGK', nameZh: '蘇加諾-哈達機場', nameEn: 'Soekarno-Hatta International Airport', cityZh: '雅加達', cityEn: 'Jakarta', countryZh: '印尼', countryEn: 'Indonesia' },
  { code: 'RGN', nameZh: '仰光國際機場', nameEn: 'Yangon International Airport', cityZh: '仰光', cityEn: 'Yangon', countryZh: '緬甸', countryEn: 'Myanmar' },
  { code: 'PNH', nameZh: '金邊國際機場', nameEn: 'Phnom Penh International Airport', cityZh: '金邊', cityEn: 'Phnom Penh', countryZh: '柬埔寨', countryEn: 'Cambodia' },
  { code: 'REP', nameZh: '暹粒國際機場', nameEn: 'Siem Reap International Airport', cityZh: '暹粒', cityEn: 'Siem Reap', countryZh: '柬埔寨', countryEn: 'Cambodia' },

  // === 港澳中國 ===
  { code: 'HKG', nameZh: '香港國際機場', nameEn: 'Hong Kong International Airport', cityZh: '香港', cityEn: 'Hong Kong', countryZh: '香港', countryEn: 'Hong Kong' },
  { code: 'MFM', nameZh: '澳門國際機場', nameEn: 'Macau International Airport', cityZh: '澳門', cityEn: 'Macau', countryZh: '澳門', countryEn: 'Macau' },
  { code: 'PVG', nameZh: '浦東國際機場', nameEn: 'Shanghai Pudong International Airport', cityZh: '上海', cityEn: 'Shanghai', countryZh: '中國', countryEn: 'China' },
  { code: 'SHA', nameZh: '虹橋國際機場', nameEn: 'Shanghai Hongqiao International Airport', cityZh: '上海', cityEn: 'Shanghai', countryZh: '中國', countryEn: 'China' },
  { code: 'PEK', nameZh: '首都國際機場', nameEn: 'Beijing Capital International Airport', cityZh: '北京', cityEn: 'Beijing', countryZh: '中國', countryEn: 'China' },
  { code: 'PKX', nameZh: '大興國際機場', nameEn: 'Beijing Daxing International Airport', cityZh: '北京', cityEn: 'Beijing', countryZh: '中國', countryEn: 'China' },

  // === 南亞 ===
  { code: 'DEL', nameZh: '英迪拉·甘地機場', nameEn: 'Indira Gandhi International Airport', cityZh: '新德里', cityEn: 'New Delhi', countryZh: '印度', countryEn: 'India' },
  { code: 'BOM', nameZh: '孟買機場', nameEn: 'Chhatrapati Shivaji International Airport', cityZh: '孟買', cityEn: 'Mumbai', countryZh: '印度', countryEn: 'India' },

  // === 大洋洲 ===
  { code: 'SYD', nameZh: '雪梨機場', nameEn: 'Sydney Airport', cityZh: '雪梨', cityEn: 'Sydney', countryZh: '澳洲', countryEn: 'Australia' },
  { code: 'MEL', nameZh: '墨爾本機場', nameEn: 'Melbourne Airport', cityZh: '墨爾本', cityEn: 'Melbourne', countryZh: '澳洲', countryEn: 'Australia' },
  { code: 'AKL', nameZh: '奧克蘭機場', nameEn: 'Auckland Airport', cityZh: '奧克蘭', cityEn: 'Auckland', countryZh: '紐西蘭', countryEn: 'New Zealand' },

  // === 北美 ===
  { code: 'LAX', nameZh: '洛杉磯機場', nameEn: 'Los Angeles International Airport', cityZh: '洛杉磯', cityEn: 'Los Angeles', countryZh: '美國', countryEn: 'USA' },
  { code: 'SFO', nameZh: '舊金山機場', nameEn: 'San Francisco International Airport', cityZh: '舊金山', cityEn: 'San Francisco', countryZh: '美國', countryEn: 'USA' },
  { code: 'JFK', nameZh: '甘迺迪機場', nameEn: 'John F. Kennedy International Airport', cityZh: '紐約', cityEn: 'New York', countryZh: '美國', countryEn: 'USA' },
  { code: 'SEA', nameZh: '西雅圖機場', nameEn: 'Seattle-Tacoma International Airport', cityZh: '西雅圖', cityEn: 'Seattle', countryZh: '美國', countryEn: 'USA' },
  { code: 'YVR', nameZh: '溫哥華機場', nameEn: 'Vancouver International Airport', cityZh: '溫哥華', cityEn: 'Vancouver', countryZh: '加拿大', countryEn: 'Canada' },

  // === 歐洲 ===
  { code: 'LHR', nameZh: '希斯洛機場', nameEn: 'Heathrow Airport', cityZh: '倫敦', cityEn: 'London', countryZh: '英國', countryEn: 'UK' },
  { code: 'CDG', nameZh: '戴高樂機場', nameEn: 'Charles de Gaulle Airport', cityZh: '巴黎', cityEn: 'Paris', countryZh: '法國', countryEn: 'France' },
  { code: 'FRA', nameZh: '法蘭克福機場', nameEn: 'Frankfurt Airport', cityZh: '法蘭克福', cityEn: 'Frankfurt', countryZh: '德國', countryEn: 'Germany' },
  { code: 'AMS', nameZh: '史基浦機場', nameEn: 'Amsterdam Airport Schiphol', cityZh: '阿姆斯特丹', cityEn: 'Amsterdam', countryZh: '荷蘭', countryEn: 'Netherlands' },
  { code: 'FCO', nameZh: '菲烏米奇諾機場', nameEn: 'Leonardo da Vinci International Airport', cityZh: '羅馬', cityEn: 'Rome', countryZh: '義大利', countryEn: 'Italy' },

  // === 中東 ===
  { code: 'DXB', nameZh: '杜拜國際機場', nameEn: 'Dubai International Airport', cityZh: '杜拜', cityEn: 'Dubai', countryZh: '阿聯酋', countryEn: 'UAE' },
  { code: 'DOH', nameZh: '哈馬德國際機場', nameEn: 'Hamad International Airport', cityZh: '杜哈', cityEn: 'Doha', countryZh: '卡達', countryEn: 'Qatar' },
  { code: 'IST', nameZh: '伊斯坦堡機場', nameEn: 'Istanbul Airport', cityZh: '伊斯坦堡', cityEn: 'Istanbul', countryZh: '土耳其', countryEn: 'Turkey' },
];
