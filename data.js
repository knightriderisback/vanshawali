// ============================================================
// VANSHAWALI — Enhanced Family Data (Sharma Parivar Sample)
// ============================================================

// localStorage key for persisted data
const STORAGE_KEY = 'vanshawali-data-v2';

const DEFAULT_DATA = {
  meta: {
    familyName: 'शर्मा परिवार',
    origin: 'जयपुर, राजस्थान',
    since: '1920',
  },
  members: [
    // ── GENERATION 0 ──
    {
      id: 'g0_pita', name: 'राम लाल शर्मा', gender: 'male',
      relation: 'परदादा', generation: 0,
      birth: '12 मार्च 1920', death: '5 जून 1994',
      birthPlace: 'सीकर, राजस्थान', place: 'जयपुर, राजस्थान',
      occupation: 'किसान', education: 'प्राथमिक शिक्षा',
      religion: 'हिंदू, ब्राह्मण', blood: 'B+',
      marriageDate: '1940', marriagePlace: 'सीकर',
      emoji: '👴', bio: 'एक सरल और ईमानदार किसान, जिन्होंने अपने परिवार को संस्कारों की नींव दी। उनकी वीणा वादन की कला पूरे गाँव में प्रसिद्ध थी। 35 बीघा जमीन के मालिक और पूरे गाँव में सम्मानित व्यक्ति।',
      hobbies: ['वीणा वादन', 'खेती', 'भजन-कीर्तन'],
      achievements: 'गाँव की पंचायत के मुखिया। सन् 1962 के भारत-चीन युद्ध में राशन सहायता अभियान में योगदान।',
      spouseId: 'g0_mata', childIds: ['g1_dada', 'g1_kaka'],
      parentIds: [],
      color: 0xffd60a, isAlive: false,
    },
    {
      id: 'g0_mata', name: 'सावित्री देवी', gender: 'female',
      relation: 'परदादी', generation: 0,
      birth: '8 सितंबर 1924', death: '14 फरवरी 2001',
      birthPlace: 'अजमेर, राजस्थान', place: 'जयपुर, राजस्थान',
      occupation: 'गृहिणी', education: 'अनपढ़',
      religion: 'हिंदू, ब्राह्मण', blood: 'O+',
      marriageDate: '1940', marriagePlace: 'सीकर',
      emoji: '👵', bio: 'ममता की मूरत। उन्होंने कभी स्कूल नहीं देखा, फिर भी उनकी जीवन-शिक्षा अनमोल थी। उनके हाथ की दाल-बाटी की सुगंध आज भी यादों में बसी है। 77 वर्ष की आयु में स्वर्गवासी हुईं।',
      hobbies: ['रसोई', 'भजन', 'बुनाई'],
      achievements: 'पूरे परिवार को संस्कारित किया। गाँव की महिला मंडल की अध्यक्ष रहीं।',
      spouseId: 'g0_pita', childIds: ['g1_dada', 'g1_kaka'],
      parentIds: [],
      color: 0xffd60a, isAlive: false,
    },
    // ── GENERATION 1 ──
    {
      id: 'g1_dada', name: 'महेश शर्मा', gender: 'male',
      relation: 'दादा', generation: 1,
      birth: '3 जुलाई 1948', death: '22 दिसंबर 2018',
      birthPlace: 'जयपुर, राजस्थान', place: 'जयपुर, राजस्थान',
      occupation: 'सरकारी विद्यालय में वरिष्ठ अध्यापक', education: 'B.Ed, राजस्थान विश्वविद्यालय',
      religion: 'हिंदू, ब्राह्मण', blood: 'B+',
      marriageDate: '15 मई 1970', marriagePlace: 'जयपुर',
      emoji: '👴', bio: 'सरकारी स्कूल में 35 वर्षों तक गणित और विज्ञान पढ़ाया। सैकड़ों विद्यार्थियों की जिंदगी बदली। उन्हें शतरंज और कबीर के दोहे बहुत पसंद थे। 2005 में सर्वश्रेष्ठ शिक्षक पुरस्कार मिला।',
      hobbies: ['शतरंज', 'कबीर दोहे', 'बागबानी', 'क्रिकेट देखना'],
      achievements: 'राज्य सर्वश्रेष्ठ शिक्षक पुरस्कार 2005। 500+ विद्यार्थियों को निःशुल्क कोचिंग।',
      spouseId: 'g1_dadi', parentIds: ['g0_pita', 'g0_mata'], childIds: ['g2_papa', 'g2_chacha'],
      color: 0x00d4ff, isAlive: false,
    },
    {
      id: 'g1_dadi', name: 'कमला देवी शर्मा', gender: 'female',
      relation: 'दादी', generation: 1,
      birth: '19 जनवरी 1950', death: null,
      birthPlace: 'जोधपुर, राजस्थान', place: 'जयपुर, राजस्थान',
      occupation: 'गृहिणी एवं समाजसेविका', education: 'हाई स्कूल',
      religion: 'हिंदू, ब्राह्मण', blood: 'A+',
      marriageDate: '15 मई 1970', marriagePlace: 'जयपुर',
      emoji: '👵', bio: '74 वर्ष की आयु में भी बिल्कुल चुस्त! रोज़ सुबह 5 बजे उठती हैं, पूजा-पाठ और बागबानी में मन रमता है। पूरे मोहल्ले में "दादी माँ" के नाम से जानी जाती हैं। परिवार की सबसे बड़ी शक्ति।',
      hobbies: ['पूजा-पाठ', 'बागबानी', 'सिलाई-कढ़ाई', 'रामायण पाठ'],
      achievements: 'महिला सेवा समिति की 20 वर्षों तक अध्यक्ष। 50+ गरीब लड़कियों की शादी में सहयोग किया।',
      spouseId: 'g1_dada', parentIds: [], childIds: ['g2_papa', 'g2_chacha'],
      color: 0x00d4ff, isAlive: true,
    },
    {
      id: 'g1_kaka', name: 'सुरेश शर्मा', gender: 'male',
      relation: 'परदादा के छोटे पुत्र', generation: 1,
      birth: '11 नवंबर 1952', death: '8 अगस्त 2010',
      birthPlace: 'जयपुर, राजस्थान', place: 'जोधपुर, राजस्थान',
      occupation: 'कपड़ा व्यापारी', education: 'B.Com',
      religion: 'हिंदू, ब्राह्मण', blood: 'AB+',
      marriageDate: null, marriagePlace: null,
      emoji: '🧔', bio: 'जोधपुर में कपड़े का बड़ा व्यापार स्थापित किया। अविवाहित रहे। परिवार के सबसे उदार और हँसमुख सदस्य। उनकी अचानक मृत्यु से परिवार को गहरा आघात लगा।',
      hobbies: ['व्यापार', 'यात्रा', 'संगीत'],
      achievements: 'जोधपुर व्यापार मंडल के उपाध्यक्ष। 100+ कारीगरों को रोजगार दिया।',
      spouseId: null, parentIds: ['g0_pita', 'g0_mata'], childIds: [],
      color: 0x00d4ff, isAlive: false,
    },
    // ── GENERATION 2 ──
    {
      id: 'g2_papa', name: 'विजय कुमार शर्मा', gender: 'male',
      relation: 'पिता', generation: 2,
      birth: '5 अगस्त 1972', death: null,
      birthPlace: 'जयपुर, राजस्थान', place: 'जयपुर, राजस्थान',
      occupation: 'वरिष्ठ सॉफ्टवेयर इंजीनियर, Infosys', education: 'B.Tech (CS), IIT दिल्ली 1994',
      religion: 'हिंदू, ब्राह्मण', blood: 'B+',
      marriageDate: '12 फरवरी 1994', marriagePlace: 'जयपुर',
      emoji: '👨', bio: 'परिवार के पहले IITian! 28 साल का सॉफ्टवेयर करियर। Infosys में Senior Architect हैं। क्रिकेट के दीवाने — 1988 में राजस्थान Under-19 टीम में खेले। एक अद्भुत पिता और प्रेरणादायक इंसान।',
      hobbies: ['क्रिकेट', 'प्रोग्रामिंग', 'किताबें पढ़ना', 'यात्रा'],
      achievements: 'IIT दिल्ली Gold Medalist 1994। Infosys में 5 बड़े प्रोजेक्ट्स लीड किए। परिवार में पहले इंजीनियर।',
      spouseId: 'g2_mama', parentIds: ['g1_dada', 'g1_dadi'], childIds: ['g3_main', 'g3_bhai', 'g3_didi'],
      color: 0xbf5af2, isAlive: true,
    },
    {
      id: 'g2_mama', name: 'डॉ. प्रिया शर्मा', gender: 'female',
      relation: 'माता', generation: 2,
      birth: '28 मार्च 1975', death: null,
      birthPlace: 'उदयपुर, राजस्थान', place: 'जयपुर, राजस्थान',
      occupation: 'वरिष्ठ चिकित्सक (MD Medicine), SMS अस्पताल जयपुर', education: 'MBBS, MD — SMS Medical College',
      religion: 'हिंदू, ब्राह्मण', blood: 'A+',
      marriageDate: '12 फरवरी 1994', marriagePlace: 'जयपुर',
      emoji: '👩⚕️', bio: 'डॉक्टर होने के साथ-साथ एक बेहतरीन माँ। 20 साल से सरकारी अस्पताल में मरीजों की सेवा कर रही हैं। COVID-19 के दौरान frontline warrior रहीं। सितार बजाती हैं — संगीत में गहरी रुचि।',
      hobbies: ['सितार', 'योगा', 'पेंटिंग', 'कुकिंग'],
      achievements: 'State Best Doctor Award 2020। COVID Warriors Medal। 50,000+ मरीजों का इलाज।',
      spouseId: 'g2_papa', parentIds: [], childIds: ['g3_main', 'g3_bhai', 'g3_didi'],
      color: 0xbf5af2, isAlive: true,
    },
    {
      id: 'g2_chacha', name: 'राजेश शर्मा', gender: 'male',
      relation: 'चाचा', generation: 2,
      birth: '17 जून 1975', death: null,
      birthPlace: 'जयपुर, राजस्थान', place: 'मुंबई, महाराष्ट्र',
      occupation: 'फिल्म प्रोडक्शन डिज़ाइनर', education: 'NID, अहमदाबाद से डिज़ाइन',
      religion: 'हिंदू, ब्राह्मण', blood: 'O+',
      marriageDate: '20 नवंबर 2003', marriagePlace: 'मुंबई',
      emoji: '👨🎬', bio: 'Bollywood में 20 साल का अनुभव। 30+ फिल्मों में प्रोडक्शन डिज़ाइन किया। परिवार के सबसे रचनात्मक और मज़ेदार सदस्य। हर दीवाली पर पूरे परिवार को मुंबई बुलाते हैं।',
      hobbies: ['फिल्में', 'फोटोग्राफी', 'ट्रेकिंग', 'खाना बनाना'],
      achievements: 'Filmfare Award Nomination (Best Art Direction) 2018। 30+ Bollywood films।',
      spouseId: 'g2_chachi', parentIds: ['g1_dada', 'g1_dadi'], childIds: ['g3_cousin'],
      color: 0xbf5af2, isAlive: true,
    },
    {
      id: 'g2_chachi', name: 'अनीता शर्मा', gender: 'female',
      relation: 'चाची', generation: 2,
      birth: '9 अप्रैल 1978', death: null,
      birthPlace: 'पुणे, महाराष्ट्र', place: 'मुंबई, महाराष्ट्र',
      occupation: 'ग्राफिक डिज़ाइनर एवं चित्रकार', education: 'BFA, Sir J.J. School of Art',
      religion: 'हिंदू', blood: 'B-',
      marriageDate: '20 नवंबर 2003', marriagePlace: 'मुंबई',
      emoji: '👩🎨', bio: 'एक प्रतिभाशाली कलाकार जिनकी पेंटिंग्स मुंबई, दिल्ली और न्यूयॉर्क की गैलरियों में प्रदर्शित हो चुकी हैं। घर पर Art Studio है जहाँ बच्चों को मुफ्त कला सिखाती हैं।',
      hobbies: ['पेंटिंग', 'स्कल्पचर', 'यात्रा', 'किताबें'],
      achievements: 'National Art Exhibition 2019 में Gold Medal। NYC Gallery में Solo Exhibition।',
      spouseId: 'g2_chacha', parentIds: [], childIds: ['g3_cousin'],
      color: 0xbf5af2, isAlive: true,
    },
    // ── GENERATION 3 ──
    {
      id: 'g3_main', name: 'आर्यन शर्मा', gender: 'male',
      relation: 'स्वयं (वंशावली निर्माता)', generation: 3,
      birth: '15 अगस्त 1998', death: null,
      birthPlace: 'जयपुर, राजस्थान', place: 'बेंगलुरु, कर्नाटक',
      occupation: 'AI/ML Engineer, Tech Startup', education: 'B.Tech (CS), BITS Pilani 2020',
      religion: 'हिंदू, ब्राह्मण', blood: 'B+',
      marriageDate: null, marriagePlace: null,
      emoji: '🧑💻', bio: 'Computer Science में B.Tech के बाद Bengaluru में एक AI Startup में काम करते हैं। 3D Technology और Machine Learning में गहरी रुचि है। इस वंशावली के निर्माता! 🚀 स्वतंत्रता दिवस को जन्म लेना इनका गर्व है।',
      hobbies: ['AI/ML', '3D Graphics', 'गिटार', 'ट्रेकिंग', 'फोटोग्राफी'],
      achievements: 'BITS Pilani में Best Project Award। 2 Open Source Projects जिनके 1000+ GitHub Stars हैं।',
      spouseId: null, parentIds: ['g2_papa', 'g2_mama'], childIds: [],
      color: 0x30d158, isAlive: true, isRoot: true,
    },
    {
      id: 'g3_bhai', name: 'आकाश शर्मा', gender: 'male',
      relation: 'छोटे भाई', generation: 3,
      birth: '7 मार्च 2001', death: null,
      birthPlace: 'जयपुर, राजस्थान', place: 'जयपुर, राजस्थान',
      occupation: 'CA (Chartered Accountant) की तैयारी', education: 'B.Com, University of Rajasthan',
      religion: 'हिंदू, ब्राह्मण', blood: 'A+',
      marriageDate: null, marriagePlace: null,
      emoji: '🧑', bio: 'B.Com के बाद CA की तैयारी कर रहे हैं। फुटबॉल टीम के कैप्टन रहे हैं। गिटार बजाते हैं और मोहल्ले के बच्चों को फ्री फुटबॉल कोचिंग देते हैं। बहुत मिलनसार स्वभाव।',
      hobbies: ['फुटबॉल', 'गिटार', 'Finance', 'खाना बनाना'],
      achievements: 'Rajasthan State Football Championship 2019 में Silver Medal।',
      spouseId: null, parentIds: ['g2_papa', 'g2_mama'], childIds: [],
      color: 0x30d158, isAlive: true,
    },
    {
      id: 'g3_didi', name: 'अनन्या वर्मा', gender: 'female',
      relation: 'बड़ी बहन', generation: 3,
      birth: '22 अप्रैल 1995', death: null,
      birthPlace: 'जयपुर, राजस्थान', place: 'नई दिल्ली',
      occupation: 'IAS अधिकारी, संयुक्त सचिव स्तर', education: 'History (Hons), DU; UPSC AIR 23 (2018)',
      religion: 'हिंदू, ब्राह्मण', blood: 'O+',
      marriageDate: '14 फरवरी 2021', marriagePlace: 'जयपुर',
      emoji: '👩⚖️', bio: 'परिवार की सबसे बड़ी उपलब्धि। UPSC 2018 में AIR 23 से IAS बनीं। दिल्ली में तैनात हैं। महिला अधिकार और बाल शिक्षा पर जोर देती हैं। परिवार में सबकी रोल मॉडल। 💪',
      hobbies: ['किताबें पढ़ना', 'ट्रेकिंग', 'क्लासिकल डांस', 'मेडिटेशन'],
      achievements: 'UPSC AIR 23 (2018)। National Youth Icon Award 2019। TEDx Speaker।',
      spouseId: 'g3_jija', parentIds: ['g2_papa', 'g2_mama'], childIds: ['g4_bhanja'],
      color: 0x30d158, isAlive: true,
    },
    {
      id: 'g3_jija', name: 'अमित वर्मा', gender: 'male',
      relation: 'जीजाजी', generation: 3,
      birth: '3 जनवरी 1993', death: null,
      birthPlace: 'आगरा, उत्तर प्रदेश', place: 'नई दिल्ली',
      occupation: 'वरिष्ठ अधिवक्ता, सर्वोच्च न्यायालय', education: 'LLB, NLU दिल्ली; LLM, Cambridge University UK',
      religion: 'हिंदू, कायस्थ', blood: 'A-',
      marriageDate: '14 फरवरी 2021', marriagePlace: 'जयपुर',
      emoji: '👨⚖️', bio: 'सर्वोच्च न्यायालय में वरिष्ठ अधिवक्ता। Cambridge से LLM किया। मानवाधिकार मामलों में विशेषज्ञता। किताबें पढ़ना और ट्रेकिंग का शौक। परिवार में सबसे शांत और बुद्धिमान।',
      hobbies: ['किताबें', 'ट्रेकिंग', 'शतरंज', 'क्रिकेट'],
      achievements: 'Cambridge University में India Scholar। 500+ Cases जीते। Human Rights Advocate of Year 2022।',
      spouseId: 'g3_didi', parentIds: [], childIds: ['g4_bhanja'],
      color: 0x30d158, isAlive: true,
    },
    {
      id: 'g3_cousin', name: 'इशान शर्मा', gender: 'male',
      relation: 'चचेरे भाई', generation: 3,
      birth: '29 सितंबर 2000', death: null,
      birthPlace: 'मुंबई, महाराष्ट्र', place: 'मुंबई, महाराष्ट्र',
      occupation: 'Film Direction की पढ़ाई, FTII पुणे', education: 'Film & Television Institute of India, Pune',
      religion: 'हिंदू, ब्राह्मण', blood: 'B+',
      marriageDate: null, marriagePlace: null,
      emoji: '🎬', bio: 'FTII Pune से Film Direction पढ़ रहे हैं। 3 Short Films बना चुके हैं जो National Film Festival में प्रदर्शित हुई हैं। Bollywood और World Cinema दोनों के बड़े fan। पिताजी की तरह ही Creative हैं।',
      hobbies: ['फिल्म निर्माण', 'स्क्रीनराइटिंग', 'फोटोग्राफी', 'गिटार'],
      achievements: 'National Film Festival 2023 में Best Short Film (Student Category)।',
      spouseId: null, parentIds: ['g2_chacha', 'g2_chachi'], childIds: [],
      color: 0x30d158, isAlive: true,
    },
    // ── GENERATION 4 ──
    {
      id: 'g4_bhanja', name: 'देव वर्मा', gender: 'male',
      relation: 'भांजा', generation: 4,
      birth: '2 अक्टूबर 2022', death: null,
      birthPlace: 'नई दिल्ली', place: 'नई दिल्ली',
      occupation: 'नन्हा बच्चा 👶', education: 'अभी नहीं शुरू',
      religion: 'हिंदू', blood: 'O+',
      marriageDate: null, marriagePlace: null,
      emoji: '👶', bio: 'परिवार का सबसे छोटा और सबसे प्यारा सदस्य! अभी केवल 2 वर्ष का है। हर कमरे में अपनी किलकारियों से खुशियाँ भर देता है। पूरे परिवार की जान। नाम "देव" रखा गया क्योंकि Gandhi Jayanti को जन्मा। ✨',
      hobbies: ['खेलना', 'खाना', 'सोना', 'रोना 😄'],
      achievements: 'परिवार को पूर्ण खुशी दी। अगली पीढ़ी की नींव।',
      spouseId: null, parentIds: ['g3_didi', 'g3_jija'], childIds: [],
      color: 0xff6b35, isAlive: true,
    },
  ]
};

// ── Data Manager ──────────────────────────────────────────
const FAMILY_DATA = {
  ...loadData(),
  byId: {},
};
rebuildIndex();

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      meta: FAMILY_DATA.meta,
      members: FAMILY_DATA.members,
    }));
  } catch(e) { console.warn('Save failed:', e); }
}

function rebuildIndex() {
  FAMILY_DATA.byId = {};
  FAMILY_DATA.members.forEach(m => { FAMILY_DATA.byId[m.id] = m; });
}

function generateId() {
  return 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2,5);
}

function addMember(data) {
  const member = {
    id: generateId(),
    name: data.name || 'नया सदस्य',
    gender: data.gender || 'male',
    relation: data.relation || '',
    generation: parseInt(data.generation) || 3,
    birth: data.birth || '',
    death: data.death || null,
    birthPlace: data.birthPlace || '',
    place: data.place || '',
    occupation: data.occupation || '',
    education: data.education || '',
    religion: data.religion || '',
    blood: data.blood || '',
    marriageDate: data.marriageDate || null,
    marriagePlace: data.marriagePlace || null,
    emoji: data.emoji || '👤',
    bio: data.bio || '',
    hobbies: data.hobbies || [],
    achievements: data.achievements || '',
    spouseId: data.spouseId || null,
    parentIds: data.parentIds || [],
    childIds: [],
    color: data.color || 0x00d4ff,
    isAlive: !data.death,
  };
  FAMILY_DATA.members.push(member);
  // Wire up parent→child links
  (member.parentIds || []).forEach(pid => {
    const parent = FAMILY_DATA.byId[pid];
    if (parent && !parent.childIds.includes(member.id)) {
      parent.childIds.push(member.id);
    }
  });
  // Wire up spouse links
  if (member.spouseId) {
    const sp = FAMILY_DATA.byId[member.spouseId];
    if (sp) sp.spouseId = member.id;
  }
  rebuildIndex();
  saveData();
  return member;
}

function updateMember(id, data) {
  const idx = FAMILY_DATA.members.findIndex(m => m.id === id);
  if (idx === -1) return;
  const old = FAMILY_DATA.members[idx];
  // Remove old parent→child links
  (old.parentIds || []).forEach(pid => {
    const parent = FAMILY_DATA.byId[pid];
    if (parent) parent.childIds = parent.childIds.filter(c => c !== id);
  });
  // Remove old spouse link
  if (old.spouseId && FAMILY_DATA.byId[old.spouseId]) {
    FAMILY_DATA.byId[old.spouseId].spouseId = null;
  }
  const updated = { ...old, ...data, id, isAlive: !data.death };
  FAMILY_DATA.members[idx] = updated;
  rebuildIndex();
  // Re-wire parent→child
  (updated.parentIds || []).forEach(pid => {
    const parent = FAMILY_DATA.byId[pid];
    if (parent && !parent.childIds.includes(id)) parent.childIds.push(id);
  });
  // Re-wire spouse
  if (updated.spouseId && FAMILY_DATA.byId[updated.spouseId]) {
    FAMILY_DATA.byId[updated.spouseId].spouseId = id;
  }
  saveData();
  return FAMILY_DATA.byId[id];
}

function deleteMember(id) {
  const member = FAMILY_DATA.byId[id];
  if (!member) return;
  // Remove all cross-references
  FAMILY_DATA.members.forEach(m => {
    if (m.spouseId === id) m.spouseId = null;
    m.childIds = (m.childIds || []).filter(c => c !== id);
    m.parentIds = (m.parentIds || []).filter(p => p !== id);
  });
  FAMILY_DATA.members = FAMILY_DATA.members.filter(m => m.id !== id);
  rebuildIndex();
  saveData();
}
