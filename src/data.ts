import riceImg from "./assets/images/rice_crop_closeup_1780980473992.png";
import potatoImg from "./assets/images/potato_crop_closeup_1780980489282.png";
import maizeImg from "./assets/images/maize_crop_closeup_1780980503676.png";
import mustardImg from "./assets/images/mustard_crop_closeup_1780980517498.png";
import tomatoImg from "./assets/images/tomato_crop_closeup_1780980532500.png";

export interface FertilizerShop {
  id: string;
  name: string;
  banglaName: string;
  owner: string;
  phone: string;
  address: string;
  banglaAddress: string;
  areas: string[];
}

export interface CropFertilizerAdvice {
  crop: string;
  cropBangla: string;
  image: string;
  fertilizers: {
    name: string;
    nameBangla: string;
    purpose: string;
    purposeBangla: string;
    applicationTime: string;
    applicationTimeBangla: string;
    dosage: string;
  }[];
  generalTips: string;
  generalTipsBangla: string;
}

export const AREAS_LIST = [
  { id: "savar", name: "Savar (সাভার)", labelBangla: "সাভার, ঢাকা" },
  { id: "narsingdi", name: "Narsingdi (নরসিংদী)", labelBangla: "নরসিংদী" },
  { id: "bogra", name: "Bogra (বগুড়া)", labelBangla: "বগুড়া" },
  { id: "rajshahi", name: "Rajshahi (রাজশাহী)", labelBangla: "রাজশাহী" },
  { id: "jessore", name: "Jessore (যশোর)", labelBangla: "যশোর" },
  { id: "mymensingh", name: "Mymensingh (ময়মনসিংহ)", labelBangla: "ময়মনসিংহ" },
  { id: "sylhet", name: "Sylhet (সিলেট)", labelBangla: "সিলেট" },
  { id: "rangpur", name: "Rangpur (রংপুর)", labelBangla: "রংপুর" },
  { id: "chuadanga", name: "Chuadanga (চুয়াডাঙ্গা)", labelBangla: "চুয়াডাঙ্গা" }
];

export const FERTILIZER_SHOPS: FertilizerShop[] = [
  // Savar
  {
    id: "shop-1",
    name: "Savar Krishi Seba Center",
    banglaName: "সাভার কৃষি সেবা কেন্দ্র",
    owner: "Al-Haj Md. Rafiqul Islam",
    phone: "01712-345678",
    address: "Bus Stand, Savar, Dhaka",
    banglaAddress: "সাভার বাস স্ট্যান্ড, সাভার, ঢাকা",
    areas: ["savar"]
  },
  {
    id: "shop-2",
    name: "Bhai Bhai Enterprise",
    banglaName: "ভাই ভাই এন্টারপ্রাইজ",
    owner: "Md. Jamil Hossain",
    phone: "01819-234567",
    address: "Nabinagar Bazar, Savar, Dhaka",
    banglaAddress: "নবীনগর বাজার, সাভার, ঢাকা",
    areas: ["savar"]
  },
  // Narsingdi
  {
    id: "shop-3",
    name: "Narsingdi Krishi Bitan",
    banglaName: "নরসিংদী কৃষি বিতান",
    owner: "Pranab Kumar Das",
    phone: "01911-987654",
    address: "Station Road, Narsingdi",
    banglaAddress: "স্টেশন রোড, নরসিংদী",
    areas: ["narsingdi"]
  },
  {
    id: "shop-4",
    name: "Al-Amin Fertilizer Store",
    banglaName: "আল-আমিন সার ঘর",
    owner: "Md. Al-Amin Sheikh",
    phone: "01552-654321",
    address: "Velanagar Bazar, Narsingdi",
    banglaAddress: "ভেলানগর বাজার, নরসিংদী",
    areas: ["narsingdi"]
  },
  // Bogra
  {
    id: "shop-5",
    name: "Bogra Krishi Bhandar",
    banglaName: "বগুড়া কৃষি ভান্ডার",
    owner: "Md. Aminul Islam",
    phone: "01733-445566",
    address: "Charmatha, Bogra",
    banglaAddress: "চারমাথা, বগুড়া বড় বাজার, বগুড়া",
    areas: ["bogra"]
  },
  {
    id: "shop-6",
    name: "Sarkar Organic Fertilizer House",
    banglaName: "সরকার জৈব সার ঘর",
    owner: "Shyamal Sarkar",
    phone: "01715-112233",
    address: "Sherpur Bazar, Bogra",
    banglaAddress: "শেরপুর বাজার, বগুড়া",
    areas: ["bogra"]
  },
  // Rajshahi
  {
    id: "shop-7",
    name: "Barendra Fertilizer & Pesticides",
    banglaName: "বারিন্দ সার ও কীটনাশক",
    owner: "Md. Kamruzzaman",
    phone: "01711-447788",
    address: "Shaheb Bazar, Rajshahi",
    banglaAddress: "সাহেব বাজার, রাজশাহী",
    areas: ["rajshahi"]
  },
  {
    id: "shop-8",
    name: "Shahin Seed & Fertilizer Trading",
    banglaName: "শাহীন বীজ ও সার ট্রেডার্স",
    owner: "Md. Shahinur Rahman",
    phone: "01815-998811",
    address: "Katakhali Bazar, Rajshahi",
    banglaAddress: "কাটাখালি বাজার, রাজশাহী",
    areas: ["rajshahi"]
  },
  // Jessore
  {
    id: "shop-9",
    name: "jessore Agro Depot",
    banglaName: "যশোর এগ্রো ডিপো",
    owner: "Md. Asaduzzaman",
    phone: "01720-336699",
    address: "Monihar Bus Stand, Jessore",
    banglaAddress: "মনিহার মোড়, যশোর উডেন মার্কেট, যশোর",
    areas: ["jessore"]
  },
  // Mymensingh
  {
    id: "shop-10",
    name: "Mymensingh Farmers Friend Store",
    banglaName: "ময়মনসিংহ কৃষক বন্ধু স্টোর",
    owner: "Haji Abdul Wahab",
    phone: "01925-554433",
    address: "Ganginarpar Bazar, Mymensingh",
    banglaAddress: "গাঙ্গিনারপাড় বাজার, ময়মনসিংহ",
    areas: ["mymensingh"]
  },
  // Sylhet
  {
    id: "shop-11",
    name: "Surma River Fertilizer Agency",
    banglaName: "সুরমা রিভার ফার্টিলাইজার এজেন্সি",
    owner: "Md. Gias Uddin",
    phone: "01718-223344",
    address: "Subhanighat, Sylhet",
    banglaAddress: "সুভানিঘাট বাজার, সিলেট",
    areas: ["sylhet"]
  },
  // Rangpur
  {
    id: "shop-12",
    name: "Rangpur Krishi Ghor",
    banglaName: "রংপুর কৃষি ঘর",
    owner: "Md. Mostafizur Rahman",
    phone: "01714-885522",
    address: "Shapla Chattar, Rangpur",
    banglaAddress: "শাপলা চত্বর, রংপুর",
    areas: ["rangpur"]
  },
  // Chuadanga
  {
    id: "shop-13",
    name: "Chuadanga Border Seed & Fertilizer",
    banglaName: "চুয়াডাঙ্গা সীমান্ত বীজ ও সার",
    owner: "Md. Tariqul Islam",
    phone: "01712-881199",
    address: "Station Road, Chuadanga",
    banglaAddress: "স্টেশন রোড, চুয়াডাঙ্গা সদর, চুয়াডাঙ্গা",
    areas: ["chuadanga"]
  }
];

export const CROP_FERTILIZER_DATA: CropFertilizerAdvice[] = [
  {
    crop: "Rice",
    cropBangla: "ধান",
    image: riceImg,
    fertilizers: [
      {
        name: "Urea",
        nameBangla: "ইউরিয়া (Urea)",
        purpose: "Provides Nitrogen for healthy vegetative growth and leaf development.",
        purposeBangla: "নাইট্রোজেন সরবরাহ করে, কুশি গজানো, সবুজ পাতার বৃদ্ধি ও ফসলের দ্রুত বাড় বাড়ন্ত নিশ্চিত করে।",
        applicationTime: "Apply in 3 splits: 15 days after planting, 30 days, and 45 days (at panicle initiation).",
        applicationTimeBangla: "চারা রোপণের ১৫ দিন পর, ৩০ দিন পর এবং ৪৫ দিন পর (কাইচ থোড় আসার পূর্বে) ৩ কিস্তিতে সমভাবে প্রয়োগ করুন।",
        dosage: "১৫-২০ কেজি প্রতি বিঘা"
      },
      {
        name: "TSP",
        nameBangla: "টিএসপি / ডিএপি (TSP / DAP)",
        purpose: "Provides Phosphorus for strong root systems and faster grain formation.",
        purposeBangla: "ফসফরাস সরবরাহ করে যা শিকড় মজবুত করে, গাছ শক্ত করে এবং ধানের শিষ সুস্থভাবে বের হতে সাহায্য করে।",
        applicationTime: "Apply the full amount as a basal dose during final land preparation.",
        applicationTimeBangla: "শেষ চাষের সময় জমি তৈরির শেষ ধাপে সম্পূর্ণ সার জমিতে মিশিয়ে দিন।",
        dosage: "১০-১২ কেজি প্রতি বিঘা"
      },
      {
        name: "MOP",
        nameBangla: "মিউরেট অব পটাশ (MOP Potash)",
        purpose: "Provides Potassium, increases pest/disease resistance and improves grain filling.",
        purposeBangla: "পটাশিয়াম সরবরাহ করে। এটি ধানের রোগ প্রতিরোধ ক্ষমতা বাড়ায়, গাছ হেলে পড়া রোধ করে এবং ধান পুষ্ট করে।",
        applicationTime: "Half during final land preparation, half at late panicle stage.",
        applicationTimeBangla: "অর্ধেক জমি তৈরির সময় এবং বাকি অর্ধেক কাইচ থোড় আসার ৫-৭ দিন আগে প্রয়োগ করুন।",
        dosage: "১২-১৫ কেজি প্রতি বিঘা"
      }
    ],
    generalTips: "Keep standing water at 2-3 inches during tillering. Drain field 10 days before harvesting.",
    generalTipsBangla: "ধানের কুশি গজানোর সময় জমিতে ২-৩ ইঞ্চি পানি রাখুন। ধান কাটার ১০-১২ দিন আগে জমির সম্পূর্ণ পানি বের করে দিন।"
  },
  {
    crop: "Potato",
    cropBangla: "আলু",
    image: potatoImg,
    fertilizers: [
      {
        name: "MOP",
        nameBangla: "মিউরেট অব পটাশ (MOP)",
        purpose: "Essential for dry matter accumulation, size, and weight of potato tubers.",
        purposeBangla: "আলু আকারে বড়, মসৃণ ও পুষ্ট হতে পটাশ সার অত্যন্ত জরুরী। এটি আলুর গুণগত মান উন্নত করে।",
        applicationTime: "Apply half as basal and half during earth-up operation (30-35 days).",
        applicationTimeBangla: "অর্ধেক সার জমি তৈরির সময় ও বাকি অর্ধেক চারা গজানোর ৩০-৩৫ দিন পর গোড়ায় মাটি তুলে দেয়ার সময় দিন।",
        dosage: "১৫-১৮ কেজি প্রতি বিঘা"
      },
      {
        name: "Gypsum",
        nameBangla: "জিপসাম (Gypsum)",
        purpose: "Provides Calcium and Sulfur, improving potato skin thickness and storage life.",
        purposeBangla: "ক্যালসিয়াম ও সালফার সরবরাহ করে যা আলুর খোসা মসৃণ রাখে এবং আলুর পচন রোধ করে গুদামজাতকরণে সাহায্য করে।",
        applicationTime: "Entire dosage during final land preparation.",
        applicationTimeBangla: "জমি চাষের শেষ চাষের সময় মাটির নিচে পুতে দিন।",
        dosage: "৮-১০ কেজি প্রতি বিঘা"
      }
    ],
    generalTips: "Provide earthing up regularly. Prevent Late Blight disease by applying copper oxychloride if mist occurs.",
    generalTipsBangla: "নিয়মিত আলুর গোড়ায় মাটি তুলে দিতে হবে। ঘন কুয়াশা হলে লেট ব্লাইট (নাবি ধসা) রোগ প্রতিরোধের জন্য উপযুক্ত ছত্রাকনাশক অগ্রিম স্প্রে করুন।"
  },
  {
    crop: "Maize",
    cropBangla: "ভুট্টা",
    image: maizeImg,
    fertilizers: [
      {
        name: "Urea",
        nameBangla: "ইউরিয়া (Urea)",
        purpose: "Ensures lush green canopy and huge stalk development.",
        purposeBangla: "ভুট্টা গাছের দ্রুত বৃদ্ধি এবং মোচা বড় ও সুস্থ গঠনে প্রয়োজনীয় নাইট্রোজেন যোগান দেয়।",
        applicationTime: "Apply in three installments: 25, 50 and 75 days after germination.",
        applicationTimeBangla: "বীজ গজানোর ২৫ তম, ৫০ তম এবং ৭৫ তম দিনে মোট ৩টি কিস্তিতে প্রয়োগ করতে হবে।",
        dosage: "২০-২৫ কেজি প্রতি বিঘা"
      },
      {
        name: "Zinc Sulphate",
        nameBangla: "দস্তা সার (Zinc Monohydrate)",
        purpose: "Prevents white bud disease and promotes complete grain filling inside the cob.",
        purposeBangla: "ভুট্টার 'সাদা কুঁড়ি' রোগ প্রতিরোধ করে এবং মোচার ভেতরের প্রতিটি দানা পরিপূর্ণভাবে ভরা হতে সাহায্য করে।",
        applicationTime: "Full dose at final land preparation or top dress within 20 days if missed.",
        applicationTimeBangla: "শেষ চাষের সময় সম্পূর্ণ সার দিন। চাষের সময় না দিলে বীজ গজানোর ২০ দিনের মধ্যে প্রয়োগ করুন।",
        dosage: "১.৫ - ২ কেজি প্রতি বিঘা"
      }
    ],
    generalTips: "Ensure good drainage as maize cannot tolerate standing water. Keep the field weed-free.",
    generalTipsBangla: "ভুট্টা জমিতে জলাবদ্ধতা সহ্য করতে পারে না, তাই পানি নিষ্কাশনের সুব্যবস্থা রাখুন এবং নিড়ানি দিয়ে জমি সবসময় পরিষ্কার রাখুন।"
  },
  {
    crop: "Mustard",
    cropBangla: "সরিষা",
    image: mustardImg,
    fertilizers: [
      {
        name: "Gypsum",
        nameBangla: "জিপসাম / গন্ধক সার (Sulfur)",
        purpose: "Sulfur is key to oil synthesis and increasing pungency of mustard seeds.",
        purposeBangla: "সরিষা বীজে তেলের পরিমাণ বৃদ্ধি করতে সালফার (গন্ধক) অত্যন্ত প্রয়োজনীয়। জিপসাম এর মূল যোগান দেয়।",
        applicationTime: "Apply full amount during seed sowing land preparation.",
        applicationTimeBangla: "জমি শেষ চাষের সময় মাটির সাথে ভালো করে মিশিয়ে বপন করতে হবে।",
        dosage: "১৮-২২ কেজি প্রতি বিঘা"
      },
      {
        name: "Boric Acid",
        nameBangla: "বোরন সার (Boron)",
        purpose: "Ensures flower fertilization and prevents empty seed pod formation.",
        purposeBangla: "ফুল পরাগায়নে সাহায্য করে, পড (ফল) ফেটে যাওয়া রোধ করে এবং সরিষার ফল পুষ্ট করে দানা বড় করে।",
        applicationTime: "Apply as basal during land preparation or foliar spray before flowering.",
        applicationTimeBangla: "জমি চাষের শেষ চাষের সময় মাটিতে দিন অথবা গাছে ফুল আসার পূর্বে স্প্রে করুন।",
        dosage: "১.৫ কেজি প্রতি বিঘা"
      }
    ],
    generalTips: "Perform light irrigation. Aphid attack can sweep the field: spray organic neem oil as preventive.",
    generalTipsBangla: "অতিরিক্ত সেচ দেবেন না, হালকা সেচই সরিষার জন্য যথেষ্ট। জাব পোকা (Aphid) দমন করতে নিম তেলের দ্রবণ বিকেলের দিকে স্প্রে করুন।"
  },
  {
    crop: "Tomato",
    cropBangla: "টমেটো",
    image: tomatoImg,
    fertilizers: [
      {
        name: "TSP",
        nameBangla: "টিএসপি (TSP)",
        purpose: "Promotes early flowering and heavy fruit setting.",
        purposeBangla: "দ্রুত ফুল আসতে ত্বরান্বিত করে এবং টমেটোর ফুল ঝরে পড়া রোধ করে বেশি ফল ধরা নিশ্চিত করে।",
        applicationTime: "Incorporate into soil during bed preparation.",
        applicationTimeBangla: "মাদায় চারা রোপণের পূর্বে বেড তৈরির সময় মাটির সাথে ভালো করে মিশিয়ে দিন।",
        dosage: "৭-১০ কেজি প্রতি বিঘা"
      },
      {
        name: "Vermicompost",
        nameBangla: "কেঁচো কম্পোস্ট / জৈব সার (Organic Compost)",
        purpose: "Enhances soil microbial activity and organic carbon, giving juicy sweet tomatoes.",
        purposeBangla: "মাটির আর্দ্রতা ধরে রাখে, বায়ু চলাচল নিশ্চিত করে এবং জৈব পুষ্টি উপাদান সরবরাহ করে যার টমেটোর স্বাদ বাড়ায়।",
        applicationTime: "Mix in planting pits/furrows several days before transplantation.",
        applicationTimeBangla: "চারা রোপণের ৭ দিন পূর্বে রোপণের গর্ত বা মাদাতে ভালো করে মাটির সাথে মিশিয়ে দিন।",
        dosage: "২০০-৩০০ গ্রাম প্রতি মাদায়"
      }
    ],
    generalTips: "Provide bamboo stakes to tomato plants for support. Water near soil to prevent leaf mold.",
    generalTipsBangla: "টমেটো কাঠি বা বাঁশ দিয়ে মাচা (Staking) তৈরি করে দিন। পাতায় পানি না দিয়ে সরাসরি গোঁড়ায় সেচ দিলে রোগবালাই অনেকাংশে কমে যায়।"
  }
];

export const INBOX_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "season",
    titleBangla: "খরিফ-১ মৌসুমের ধান চাষের নির্দেশনা",
    title: "Kharif-1 Season Rice Advice",
    descriptionBangla: "এই মৌসুমে ইউরিয়া সার অতিরিক্ত পরিমাণে একসাথে ব্যবহার না করে ৩টি কিস্তিতে ভাগ করে দেওয়ার পরামর্শ দেয়া হচ্ছে। আর্দ্র আবহাওয়ার কারণে পোকার আক্রমণ দেখা দিলে নিম পাতার পানি স্প্রে করতে পারেন। 🌾",
    description: "During this season, split Urea into 3 installments rather than single heavy application to avoid nitrogen leaching and insect infestations.",
    timestamp: "১৬ ঘণ্টা আগে",
    isUrgent: false
  },
  {
    id: "notif-2",
    type: "weather",
    titleBangla: "ভারী বৃষ্টির পূর্বাভাস ও সর্তকতা!",
    title: "Heavy Rainfall Forecast Warning!",
    descriptionBangla: "আগামী ৪৮ ঘণ্টার মধ্যে আপনার এলাকায় অতি ভারী বৃষ্টির সম্ভাবনা রয়েছে। টমেটো এবং আলুর বেড থেকে অতিরিক্ত পানি নিষ্কাশনের চ্যানেলগুলো দ্রুত খুলে দিন এবং নতুন বীজ রোপণ করা থাকলে সুরক্ষিত রাখুন। ⛈️",
    description: "Very heavy rainfall is expected in your subdistrict within 48 hours. Please keep your surface water drains clear for and postpone any major fertilizer sprays.",
    timestamp: "৩৮ মিনিট আগে",
    isUrgent: true
  },
  {
    id: "notif-3",
    type: "season",
    titleBangla: "আলুগাছে লেট ব্লাইট রোগ প্রতিরোধে সতর্ক বার্তা",
    title: "Late Blight Advisory for Potatoes",
    descriptionBangla: "ঘন কুয়াশা এবং মেঘাচ্ছন্ন আবহাওয়ার কারণে আলুগাছে নাবি ধসা (Late Blight) ছড়ানোর অনুকূল পরিবেশ তৈরি হয়েছে। প্রতিকার হিসেবে ম্যানকোজেব জাতীয় ছত্রাকনাশক অনুমোদিত মাত্রায় স্প্রে করুন। 🥔",
    description: "Overcast and humid conditions favor potato Late Blight. Apply protective fungicides early in foggy mornings to protect foliage.",
    timestamp: "২ দিন আগে",
    isUrgent: false
  }
];
