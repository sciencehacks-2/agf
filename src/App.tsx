import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sprout, 
  Leaf, 
  MessageSquare, 
  Inbox, 
  Search, 
  UserCheck, 
  Mic, 
  MicOff, 
  Send, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  User, 
  Check, 
  Loader2, 
  CloudRain, 
  Database, 
  Upload, 
  X, 
  RefreshCw, 
  FileSpreadsheet, 
  ChevronRight, 
  Info, 
  Calendar,
  AlertCircle,
  Lock,
  Shield,
  Key,
  Award,
  DollarSign,
  TrendingUp,
  Tag,
  ShoppingBag
} from "lucide-react";
import { 
  AREAS_LIST, 
  FERTILIZER_SHOPS, 
  CROP_FERTILIZER_DATA, 
  INBOX_NOTIFICATIONS,
  FertilizerShop,
  CropFertilizerAdvice
} from "./data";

interface FarmerDetails {
  name: string;
  phone: string;
  address: string;
  land: string;
  crops: string;
  photo: string;
  timestamp?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  isCustomError?: boolean;
  image?: {
    mimeType: string;
    data: string;
  };
}

export default function App() {
  // Navigation active tab State (Added developer_info tab option)
  type ActiveTab = "ai_mode" | "registration" | "inbox" | "search" | "developer_info";
  const [activeTab, setActiveTab] = useState<ActiveTab>("ai_mode");

  // User Authentication Mode & State
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Crop image analysis state
  const [cropImage, setCropImage] = useState<{ mimeType: string; data: string } | null>(null);
  const cropImageInputRef = useRef<HTMLInputElement>(null);

  // Onboarding States with Password for Authentication
  const [farmerDetails, setFarmerDetails] = useState<FarmerDetails | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    land: "",
    crops: "ধান (Rice)",
    photoType: "avatar" as "upload" | "avatar",
    photoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop", // Crop specialist path
    customFile: "" as string,
    password: "",
  });

  // Photo Avatar Options
  const AVATAR_OPTIONS = [
    { id: "paddy", label: "ধান চাষী (Paddy Expert)", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop" },
    { id: "veggie", label: "সবজি চাষী (Vegetable Expert)", url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" },
    { id: "modern", label: "ডিজিটাল কৃষক (Agro-Tech Pioneer)", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" },
    { id: "veteran", label: "অভিজ্ঞ চাষী (Veteran Advisor)", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" }
  ];

  // Dynamic Google Sheets Synchronization Profiles loaded dynamically from database
  const [gridData, setGridData] = useState<FarmerDetails[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState("");
  const [syncFlashIndex, setSyncFlashIndex] = useState<number | null>(null);

  // AI Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "আসসালামু আলাইকুম! আমি আপনার কৃত্রিম বুদ্ধিমত্তা সম্পন্ন কৃষি সহকারী। চাষাবাদ, ফসলের রোগবালাই নিরাময়, সঠিক সারের ব্যবহার বা যেকোনো কৃষি সমস্যায় আমি আপনাকে সাহায্য করতে প্রস্তুত। আপনার প্রশ্নটি আমাকে নিচে লিখে বা মাইক আইকন ট্যাপ করে মুখে বলুন! অথবা আপনার ফসলের ক্ষত বা পাতার ছবি আপলোড করতে 'ফসল ছবি দিন' বোতাম ব্যবহার করুন।"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Search Screen States
  const [selectedArea, setSelectedArea] = useState<string>("savar");
  const [shopSearchQuery, setShopSearchQuery] = useState<string>("");
  const [selectedCropDetail, setSelectedCropDetail] = useState<CropFertilizerAdvice | null>(CROP_FERTILIZER_DATA[0]);

  // Developer & Honest Price States
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [profitCrop, setProfitCrop] = useState<string>("rice");
  const [profitCost, setProfitCost] = useState<number>(6500); // Estimated production cost per bigha (BDT)
  const [profitYield, setProfitYield] = useState<number>(15);  // Yield in Maund (মন / ৪০ কেজি) per bigha

  // Dynamic calculations for the agricultural profit calculator
  const currentCropPriceDetails = useMemo(() => {
    switch (profitCrop) {
      case "rice": 
        return { name: "ধান (Paddy)", pricePerMaund: 1300, govPricePerKg: 32 };
      case "potato": 
        return { name: "আলু (Potato)", pricePerMaund: 1150, govPricePerKg: 25 };
      case "mustard": 
        return { name: "সরিষা (Mustard)", pricePerMaund: 3600, govPricePerKg: 80 };
      case "maize": 
        return { name: "ভুট্টা (Maize)", pricePerMaund: 1000, govPricePerKg: 24 };
      default: 
        return { name: "অন্যান্য (Other)", pricePerMaund: 1100, govPricePerKg: 25 };
    }
  }, [profitCrop]);

  const profitCalculation = useMemo(() => {
    const totalRevenue = profitYield * currentCropPriceDetails.pricePerMaund;
    const netProfit = totalRevenue - profitCost;
    const roi = profitCost > 0 ? ((netProfit / profitCost) * 100).toFixed(1) : "0.0";
    return {
      revenue: totalRevenue,
      netProfit,
      roi,
      isLoss: netProfit < 0
    };
  }, [profitYield, currentCropPriceDetails, profitCost]);

  // Load user profiles list from actual backend endpoints
  const fetchUsersList = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setGridData(data);
      }
    } catch (e) {
      console.error("Failed to load user credentials from server database:", e);
    }
  };

  // Load registered user and initial server database list on mount
  useEffect(() => {
    // Fetch live users from the real server database
    fetchUsersList().catch(err => console.error("Initial fetch users failed", err));

    try {
      const cached = localStorage.getItem("krishi_seba_farmer");
      if (cached) {
        const parsed = JSON.parse(cached);
        setFarmerDetails(parsed);
      }
    } catch (e) {
      console.error("Local storage fetching failed", e);
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "bn-BD"; // Sourced for Bengali speech recognition

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setChatInput(prev => prev + " " + transcript);
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Scroll active chat view to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  // Real Database Onboarding/Registration request
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password || !formData.address || !formData.land) {
      alert("দয়া করে নাম, মোবাইল নম্বর, পাসওয়ার্ড এবং জমির বিবরণ সহ সব আবশ্যক ক্ষেত্রগুলো পূরণ করুন।");
      return;
    }

    const userPhoto = formData.photoType === "upload" && formData.customFile ? formData.customFile : formData.photoUrl;

    setIsSyncing(true);
    setSyncStep("নিবন্ধন ডাটা যাচাই ও গুগল ফর্ম হ্যান্ডলিং প্রসেস করা হচ্ছে...");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
          land: formData.land,
          crops: formData.crops,
          photo: userPhoto
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "নিবন্ধন সম্পন্ন করা যায়নি।");
      }

      setSyncStep("নিবন্ধন সফল! গুগল স্প্রেডশিটে নতুন রো প্রস্তুত ও সেল অ্যাড্রেস ম্যাচিং করা হচ্ছে...");

      setTimeout(() => {
        const registeredUser = resData.user;
        localStorage.setItem("krishi_seba_farmer", JSON.stringify(registeredUser));
        setFarmerDetails(registeredUser);
        
        fetchUsersList(); // Update live spreadsheet visualizer
        setIsSyncing(false);
        setSyncFlashIndex(0);
        setTimeout(() => setSyncFlashIndex(null), 3000);
        
        // Switch automatically to AI Mode with personalized state
        setActiveTab("ai_mode");
        // Insert custom helper message
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `মাশাআল্লাহ হ্যাল্লো **${registeredUser.name}** ভাই! আপনি কৃষি সেবা পোর্টালে সফলভাবে পাসওয়ার্ড অ্যাকাউন্টের মাধ্যমে নিবন্ধিত হয়েছেন। আপনার চাষের প্রধান ফসল **${registeredUser.crops}** অনুযায়ী ড্যাশবোর্ড আপডেট করা হয়েছে। যেকোনো খামার সমস্যা জিজ্ঞাসা করুন!`
          }
        ]);

        // Reset password input
        setFormData(prev => ({ ...prev, password: "" }));
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setIsSyncing(false);
      alert("⚠️ ত্রুটি: " + err.message);
    }
  };

  // Farmer Authentication: Login Request
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || !loginPassword) {
      alert("মোবাইল নম্বর এবং পাসওয়ার্ড প্রদান করা আবশ্যক।");
      return;
    }

    setIsSyncing(true);
    setSyncStep("লগইন ক্রেডেনশিয়াল যাচাই করা হচ্ছে...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: loginPhone,
          password: loginPassword
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "লগইন সম্পন্ন করা যায়নি।");
      }

      setSyncStep("খামারি ড্যাশবোর্ড প্রোফাইল এবং নোটিফিকেশন লোড করা হচ্ছে...");

      setTimeout(() => {
        const loggedInUser = resData.user;
        localStorage.setItem("krishi_seba_farmer", JSON.stringify(loggedInUser));
        setFarmerDetails(loggedInUser);
        
        fetchUsersList(); // Reload to highlight user inside spreadsheet table
        setIsSyncing(false);
        setLoginPhone("");
        setLoginPassword("");

        setActiveTab("ai_mode");
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `আসসালামু আলাইকুম **${loggedInUser.name}** ভাই! পুনরায় আপনাকে সিস্টেমে স্বাগতম। আপনার প্রোফাইল বিবরণ লোড হয়েছে। কোনো নতুন ফসলের রোগ বা বালাই দমনে কোনো প্রশ্ন থাকলে নিখুঁত সাহায্য পেতে নির্দ্বিধায় জিজ্ঞাসা করুন!`
          }
        ]);
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setIsSyncing(false);
      alert("⚠️ লগইন ব্যর্থ: " + err.message);
    }
  };

  const handleLogout = () => {
    if (confirm("আপনি কি খামারি অ্যাকাউন্ট থেকে লগআউট করতে চান?")) {
      localStorage.removeItem("krishi_seba_farmer");
      setFarmerDetails(null);
      // Reset form setup
      setFormData({
        name: "",
        phone: "",
        address: "",
        land: "",
        crops: "ধান (Rice)",
        photoType: "avatar",
        photoUrl: AVATAR_OPTIONS[0].url,
        customFile: "",
        password: ""
      });
      setAuthMode("login");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          customFile: reader.result as string,
          photoType: "upload"
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Crop diagnostic picture helper (for AI tab)
  const handleCropImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage({
          mimeType: file.type,
          data: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle or start voice recognition
  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert("দুঃখিত, আপনার ব্রাউজারটি বাংলা ভয়েস ইনপুট সমর্থন করে না। গুগল ক্রোম ব্রাউজার ব্যবহারের চেষ্টা করুন।");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Speech Recognition starting failed: ", err);
      }
    }
  };

  // Chat message sending (Supports optional crop multi-modal picture attachments)
  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || chatInput).trim();
    if (!query && !cropImage) return;

    if (!customPrompt) {
      setChatInput("");
    }

    const attachedImage = cropImage;
    setCropImage(null); // Clear image attachment once processed to send

    // append user message
    const updatedMessages = [...messages, { 
      role: "user" as const, 
      content: query || "ফসলের রোগ বা পোকা নির্ণয় করুন।",
      image: attachedImage ? attachedImage : undefined
    }];
    setMessages(updatedMessages);
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userDetails: farmerDetails,
          image: attachedImage ? attachedImage : undefined
        })
      });

      const data = await response.json();

      if (response.ok && data.content) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      } else {
        throw new Error(data.error || "কনট্রোলারের সাথে সংযোগ বিঘ্নিত হয়েছে।");
      }
    } catch (err: any) {
      console.error(err);
      // Beautiful fallback explanation if system is in draft state or API key is absent
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: `⚠️ **টেকনিক্যাল ত্রুটি:** ${err.message || "সার্ভার রেসপন্স করছে না।"}\n\nআপনার সিস্টেমে এখনো সম্ভবত **GEMINI_API_KEY** ভ্যারিয়েবল সেট করা হয়নি অথবা আপনি অফলাইনে আছেন।\n\n**তাৎক্ষণিক সমাধান (Offline Guide):**\n১. উইন্ডোর ডানদিকের উপরের **Settings > Secrets** প্যানেলে গিয়ে \`GEMINI_API_KEY\` সেট করুন।\n২. অথবা অফলাইন কৃষি সহকারির ডেমো পরামর্শ হিসেবে বলতে পারি: ধানের পোকা দমনের জন্য আলকাথ্রার ফাঁদ অথবা আলোক ফাঁদ ব্যবহার করুন। জৈব কায়দায় রোগ দমনের জন্য ১ লিটার পানিতে ৫ মিলি নিমের তেল মিশিয়ে স্প্রে করুন।`,
          isCustomError: true
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Fertilizer location filtering
  const filteredShops = useMemo(() => {
    return FERTILIZER_SHOPS.filter(shop => {
      const isInArea = shop.areas.includes(selectedArea);
      const matchesSearch = shopSearchQuery.trim() === "" || 
        shop.banglaName.toLowerCase().includes(shopSearchQuery.toLowerCase()) ||
        shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase()) ||
        shop.owner.toLowerCase().includes(shopSearchQuery.toLowerCase()) ||
        shop.banglaAddress.toLowerCase().includes(shopSearchQuery.toLowerCase());
      return isInArea && matchesSearch;
    });
  }, [selectedArea, shopSearchQuery]);

  // Interactive advice parser to simulate format (lists, bold words, icons)
  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Bold highlights parser
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        const textBefore = line.substring(lastIndex, match.index);
        parts.push(textBefore);
        parts.push(<strong key={match.index} className="text-neon-cyan font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));

      // Check if it looks like a list item
      const isListItem = line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\d+\./.test(line.trim());
      
      return (
        <p key={idx} className={`leading-relaxed mb-1 ${isListItem ? "pl-4 text-gray-200 border-l-2 border-neon-cyan/30 my-2" : "text-gray-300"}`}>
          {parts.length > 0 ? parts : formattedLine}
        </p>
      );
    });
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#020408] text-[#E2E8F0] font-sans relative overflow-x-hidden flex flex-col selection:bg-[#00D2FF] selection:text-black">
      
      {/* 🔮 Cosmic Ambient Glow Orbs */}
      <div className="bg-glow top-[-100px] left-[-100px] bg-[#3B82F6] pointer-events-none"></div>
      <div className="bg-glow bottom-[-100px] right-[-100px] bg-[#00D2FF] pointer-events-none"></div>

      {/* 🌾 Glassmorphic Top Header */}
      <header id="main-header" className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 shadow-lg backdrop-blur-md">
        <div id="header-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div id="logo-block" className="flex items-center gap-3">
            <div id="logo-icon-wrap" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.4)]">
              <Sprout className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 id="brand-title" className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                কৃষি সেবা <span className="text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Agro-AI Portal</span>
              </h1>
              <p id="brand-subtitle" className="text-[10px] md:text-xs text-gray-400 block heading-mono">Digital Care Platform for Farmers</p>
            </div>
          </div>

          {/* User Status Badge */}
          <div id="user-status-card" className="flex items-center gap-2">
            {farmerDetails ? (
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full pl-2.5 pr-4 py-1.5 shadow-inner">
                <img 
                  id="header-user-avatar"
                  src={farmerDetails.photo} 
                  alt={farmerDetails.name} 
                  className="w-7 h-7 rounded-full object-cover border border-cyan-400/40"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left hidden sm:block">
                  <p id="header-user-name" className="text-xs font-semibold text-gray-200 line-clamp-1">{farmerDetails.name}</p>
                  <p id="header-user-details" className="text-[9px] text-cyan-400 font-mono tracking-tight">{farmerDetails.crops} • {farmerDetails.land}</p>
                </div>
                <button 
                  id="btn-profile-logout"
                  onClick={handleLogout} 
                  title="প্রোফাইল বন্ধ করুন"
                  className="text-gray-400 hover:text-red-400 transition-colors ml-1 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 text-xs text-yellow-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                অনিবন্ধিত কৃষক
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🌍 Dashboard Info Bar (Weather, Date & Crop Quick View) */}
      <section id="system-status-bar" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 z-10 relative">
        <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 py-3.5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono tracking-wide">আজকের তারিখ (Current Date)</p>
              <p className="text-sm font-semibold text-white">৮ জুন, ২০২৬ • সোমবার</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/5 md:border-t-0 md:border-l md:border-white/10 pt-3 md:pt-0 md:pl-6">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <CloudRain className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono tracking-wide">আবহাওয়া পূর্বাভাস (Savar Weather)</p>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                ২৯° সেলসিয়াস <span className="text-xs text-cyan-300 font-extralight bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/20">বৃষ্টির সম্ভাবনা ৮০% (Rainy)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/5 md:border-t-0 md:border-l md:border-white/10 pt-3 md:pt-0 md:pl-6">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono tracking-wide">ডাটাবেজ সিঙ্ক অবস্থান (Sheet Connection)</p>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Google Sheets synced (সচল)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Main Layout (Two-Column Sidebar/Content Area) */}
      <main id="main-content-layout" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        
        {/* 📱 Left Navigation & Onboarding QuickView Widget (3 columns) */}
        <div id="sidebar-layout-column" className="lg:col-span-3 flex flex-col gap-6 md:grid md:grid-cols-2 lg:flex lg:flex-col">
          
          {/* Glass Navigation Menus */}
          <nav id="navigation-sidebar" className="glass-panel rounded-3xl p-4 flex flex-col gap-1.5 w-full shadow-lg">
            <p className="text-[10px] font-bold text-[#00D2FF] tracking-wider uppercase mb-2 px-3 heading-mono">মেনু অপশনসমূহ / Tabs</p>
            
            <button
              id="nav-tab-ai"
              onClick={() => setActiveTab("ai_mode")}
              className={`w-full text-left py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
                activeTab === "ai_mode"
                  ? "nav-active text-[#00D2FF] font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className={`w-5 h-5 ${activeTab === "ai_mode" ? "text-[#00D2FF]" : "text-gray-400"}`} />
                <span>AI Mode (কৃষি AI)</span>
              </div>
              <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === "ai_mode" ? "text-[#00D2FF]" : ""}`} />
            </button>

            <button
              id="nav-tab-registration"
              onClick={() => setActiveTab("registration")}
              className={`w-full text-left py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
                activeTab === "registration"
                  ? "nav-active text-[#00D2FF] font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className={`w-5 h-5 ${activeTab === "registration" ? "text-[#00D2FF]" : "text-gray-400"}`} />
                <span>নিবন্ধন (Registration)</span>
              </div>
              {farmerDetails && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
              )}
              <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === "registration" ? "text-[#00D2FF]" : ""}`} />
            </button>

            <button
              id="nav-tab-inbox"
              onClick={() => setActiveTab("inbox")}
              className={`w-full text-left py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
                activeTab === "inbox"
                  ? "nav-active text-[#00D2FF] font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className={`w-5 h-5 ${activeTab === "inbox" ? "text-[#00D2FF]" : "text-gray-400"}`} />
                <span className="flex items-center gap-2">
                  ইনবক্স (Inbox)
                  {farmerDetails ? (
                    <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold">৩টি</span>
                  ) : (
                    <Lock className="w-3 h-3 text-yellow-400/80" />
                  )}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === "inbox" ? "text-[#00D2FF]" : ""}`} />
            </button>

            <button
              id="nav-tab-search"
              onClick={() => setActiveTab("search")}
              className={`w-full text-left py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
                activeTab === "search"
                  ? "nav-active text-[#00D2FF] font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Search className={`w-5 h-5 ${activeTab === "search" ? "text-[#00D2FF]" : "text-gray-400"}`} />
                <span>সার ডিলার লোকেটর</span>
              </div>
              <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === "search" ? "text-[#00D2FF]" : ""}`} />
            </button>

            <button
              id="nav-tab-dev"
              onClick={() => setActiveTab("developer_info")}
              className={`w-full text-left py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
                activeTab === "developer_info"
                  ? "nav-active text-[#00D2FF] font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Info className={`w-5 h-5 ${activeTab === "developer_info" ? "text-[#00D2FF]" : "text-gray-400"}`} />
                <span>ডেভেলপার তথ্য</span>
              </div>
              <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === "developer_info" ? "text-[#00D2FF]" : ""}`} />
            </button>
          </nav>

          {/* Quick Farmer Info / Advisory Summary widget */}
          <div id="quick-advisory-widget" className="glass-panel rounded-3xl p-5 shadow-lg flex flex-col gap-4">
            <p className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase mb-1 heading-mono">আপনার চাষ প্রোফাইল / Insights</p>
            
            {farmerDetails ? (
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-white/10 border border-white/10 shrink-0">
                    <img 
                      id="sidebar-user-avatar"
                      src={farmerDetails.photo} 
                      alt={farmerDetails.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 id="sidebar-user-name" className="text-sm font-bold text-white leading-tight">{farmerDetails.name}</h4>
                    <p id="sidebar-user-land" className="text-xs text-gray-400">{farmerDetails.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                    <span className="text-gray-400 block text-[10px] mb-0.5">জমির পরিমাণ</span>
                    <strong id="sidebar-info-land" className="text-cyan-400 font-semibold">{farmerDetails.land}</strong>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                    <span className="text-gray-400 block text-[10px] mb-0.5">সবচেয়ে বেশি চাষ</span>
                    <strong id="sidebar-info-crops" className="text-cyan-400 font-semibold truncate block" title={farmerDetails.crops}>{farmerDetails.crops}</strong>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 text-xs text-gray-300">
                  <h5 className="font-semibold text-gray-200 mb-1.5 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-cyan-400" />
                    আজকের বিশেষ কৃষি টিপ:
                  </h5>
                  <p id="sidebar-dynamic-tip" className="text-[11px] leading-relaxed italic text-gray-400">
                    {farmerDetails.crops.includes("আলু") 
                      ? "আলু রোপণের ৩০-৩৫ দিন পার হলে মাটি তোলার সময় পটাশ সার ব্যবহার করুন। এতে কুঁচি বৃদ্ধি পাবে।"
                      : farmerDetails.crops.includes("সরিষা")
                      ? "সরিষার ফুল ফেটে যাওয়া রোধে শেষ চাষের সময় বোরন সার প্রয়োগ সঠিক মাত্রায় সম্পন্ন করুন।"
                      : "ধান জমিতে কুশি বৃদ্ধির সময় ২-৩ ইঞ্চি পানি রাখুন। অধিক মাত্রায় নাইট্রোজেন একসাথে ছিটাবেন না।"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-4 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/15">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-300">নিবন্ধিত কৃষক প্রোফাইল নেই</p>
                  <p className="text-[10px] text-gray-500 mt-1">কৃষি AI যেন আপনাকে নাম ধরে সঠিক নোটিফিকেশন পাঠাতে পারে, তাই প্রথমে নিবন্ধন সম্পন্ন করুন!</p>
                </div>
                <button
                  id="btn-goto-onboarding"
                  onClick={() => setActiveTab("registration")}
                  className="mt-1.5 px-4 py-2 rounded-xl text-xs btn-neon font-semibold cursor-pointer"
                >
                  নিবন্ধন করুন
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🖥️ Right Content Module Container (9 columns) */}
        <div id="main-content-column" className="lg:col-span-9 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* ==================== TAB A: AI CHAT ASSISTANT PANEL ==================== */}
            {activeTab === "ai_mode" && (
              <motion.div
                key="ai_mode_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                id="panel-ai-mode"
                className="glass-panel rounded-3xl p-4 md:p-6 shadow-xl flex flex-col h-[72vh] min-h-[500px]"
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center animate-pulse">
                      <MessageSquare className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        কৃষি AI সহকারী <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-extralight py-0.5 px-2 rounded-full border border-cyan-800">স্মার্ট কৃষি</span>
                      </h2>
                      <p className="text-xs text-gray-400">খাদ্য নিরাপত্তা নিশ্চিতকরণ ও আধুনিক পদ্ধতিতে সমাধানকারী এগ্রো-বট</p>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-800/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Gemini 3.5 Active
                  </span>
                </div>

                {/* Question Helper Badges / Quick Query Triggers */}
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">সহজ টাইপ / দ্রুত জিজ্ঞাসা করুন:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { l: "ধানের পাতার লালচে দাগ দমনের উপায় কি?", q: "ধানের পাতায় লম্বালম্বি লালচে খয়েরি দাগ হলে কি করব?" },
                      { l: "আলুর লেট ব্লাইট (নাবি ধসা) রোগ দমন", q: "আলুর লেট ব্লাইট রোগ দমনের উপায় কি?" },
                      { l: "ভুট্টার ভালো মোচা আসার সার মাত্রা", q: "ভুট্টার মোচা পরিপূর্ণ আকারে বড় করতে জমিতে কি সার দিতে হবে?" },
                      { l: "টমেটোর ফুল ঝরা কমানোর সঠিক টিপস", q: "টমেটোর ফুল ঝরা বন্ধ করতে কোন সার উপযুক্ত?" }
                    ].map((badge, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(badge.q)}
                        className="text-xs bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:border-cyan-500/40 hover:bg-cyan-555/10 px-3 py-1.5 rounded-xl transition-all duration-200 text-left cursor-pointer active:scale-95"
                      >
                        💡 {badge.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Chat Display Section */}
                <div className="flex-1 overflow-y-auto mb-4 p-3 bg-black/15 rounded-2xl border border-white/5 flex flex-col gap-4">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse text-right" : "self-start"}`}
                    >
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center border font-mono text-xs ${
                        msg.role === "user" 
                          ? "bg-gradient-to-tr from-cyan-500 to-blue-500 text-black border-cyan-400" 
                          : msg.isCustomError 
                          ? "bg-red-500/20 text-red-400 border-red-500/30" 
                          : "bg-white/5 text-cyan-400 border-white/10"
                      }`}>
                        {msg.role === "user" ? (
                          farmerDetails ? <img src={farmerDetails.photo} alt="User" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" /> : "F"
                        ) : "AI"}
                      </div>

                      {/* Content Card */}
                      <div className={`p-3.5 rounded-2xl text-left border ${
                        msg.role === "user" 
                          ? "bg-gradient-to-br from-cyan-950/40 to-blue-950/20 border-cyan-500/25 rounded-tr-none text-gray-100" 
                          : msg.isCustomError 
                          ? "bg-red-950/20 border-red-500/20 rounded-tl-none text-red-200 font-mono text-xs" 
                          : "bg-white/[0.03] border-white/5 rounded-tl-none text-gray-200"
                      }`}>
                        {msg.role === "user" ? (
                          <div className="flex flex-col gap-2">
                            {msg.image && (
                              <div className="max-w-[200px] mb-1.5 rounded-xl overflow-hidden border border-cyan-400/55 shadow-md">
                                <img 
                                  src={msg.image.data} 
                                  alt="Diagnosed crop leaf" 
                                  className="w-full h-auto object-cover max-h-48"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <p className="text-sm font-semibold">{msg.content}</p>
                          </div>
                        ) : msg.role === "assistant" ? (
                          <div className="prose prose-invert max-w-none text-sm space-y-2">
                            {renderMessageContent(msg.content)}
                          </div>
                        ) : (
                          <p className="text-sm font-semibold">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isAiLoading && (
                    <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
                      <div className="w-9 h-9 rounded-lg bg-white/5 text-cyan-400 border border-white/10 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/40 animate-bounce"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/70 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                        <span className="text-xs text-cyan-400/80 font-semibold ml-1.5 animate-pulse">কৃষি AI ভাবছে...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Audio Recording Equalizer Simulation overlay when listening */}
                {isListening && (
                  <div className="mb-3 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between animate-voice-pulse">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <p className="text-xs text-cyan-300 font-semibold tracking-wide">ভয়েস ইনপুট শুনছি (Speech Recognition Active...)</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 3, 2, 4, 1, 2, 3].map((height, idx) => (
                        <div 
                          key={idx} 
                          className="w-0.5 bg-cyan-400 rounded-full animate-bounce"
                          style={{ 
                            height: `${height * 4}px`, 
                            animationDuration: `${0.4 + idx * 0.08}s` 
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Crop Diagnosis Selected Picture Preview */}
                {cropImage && (
                  <div className="mb-2.5 p-2 bg-white/5 border border-cyan-500/20 rounded-2xl flex items-center justify-between w-max gap-3.5 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <img 
                        src={cropImage.data} 
                        alt="Crop diagnostics preview" 
                        className="w-12 h-12 rounded-xl object-cover border border-[#00D2FF]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <span className="text-[10px] text-[#00D2FF] font-semibold block">ফসলের ছবি যুক্ত হয়েছে (Ready)</span>
                        <span className="text-[9px] text-gray-400 font-mono">রোগ ও বালাই পরীক্ষা প্রস্তুত</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setCropImage(null)}
                      className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg bg-white/5 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Audio Recording Equalizer Simulation overlay when listening */}
                {isListening && (
                  <div className="mb-3 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between animate-voice-pulse">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <p className="text-xs text-cyan-300 font-semibold tracking-wide">ভয়েস ইনপুট শুনছি (Speech Recognition Active...)</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 3, 2, 4, 1, 2, 3].map((height, idx) => (
                        <div 
                          key={idx} 
                          className="w-0.5 bg-cyan-400 rounded-full animate-bounce"
                          style={{ 
                            height: `${height * 4}px`, 
                            animationDuration: `${0.4 + idx * 0.08}s` 
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Bar Section */}
                <div className="flex items-center gap-2.5 pt-1.5">
                  
                  {/* Microphone Icon button with pulsing */}
                  <button
                    id="btn-voice-input"
                    type="button"
                    onClick={toggleListening}
                    title={isListening ? "ভয়েস রেকর্ডি বন্ধ করুন" : "ভয়েস ইনপুট দিন"}
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 cursor-pointer ${
                      isListening 
                        ? "bg-red-500 text-white border-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-400/30 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.05)]"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>

                  <input
                    id="chat-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="পোকামাকড় দমন, সারের হিসাব বা মাটি পরীক্ষা সম্পর্কে প্রশ্ন করুন (বাংলায়)..."
                    className="flex-1 h-12 px-4 rounded-xl glass-input text-sm text-gray-100 placeholder:text-gray-500 shadow-inner"
                  />

                  {/* Send button */}
                  <button
                    id="btn-send-message"
                    onClick={() => handleSendMessage()}
                    disabled={!chatInput.trim() || isAiLoading}
                    className="h-12 px-5 rounded-xl btn-neon font-bold text-black border border-cyan-400/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="hidden sm:inline text-xs tracking-wider uppercase">পাঠান</span>
                    <Send className="w-4 h-4 text-black" />
                  </button>
                </div>
              </motion.div>
            )}


            {/* ==================== TAB B: FARMER ONBOARDING REGISTRATION ==================== */}
            {activeTab === "registration" && (
              <motion.div
                key="registration_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                id="panel-registration"
                className="flex flex-col gap-6"
              >
                
                {/* Onboarding Glass Card wrapper */}
                <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  
                  {/* Glowing line indicators */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        🌾 কৃষক অনবোর্ডিং নিবন্ধন পোর্টাল (Farmer Registration)
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">কৃষি সেবা নেটওয়ার্কে যুক্ত হতে আপনার সঠিক খামার ও ব্যক্তিগত বিবরণ সম্বলিত ডাটা প্রদান করুন।</p>
                    </div>
                    {farmerDetails && (
                      <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs py-1 px-3.5 rounded-full border border-emerald-800/30">
                        <Check className="w-3.5 h-3.5" />
                        নিবন্ধিত আছেন
                      </span>
                    )}
                  </div>

                  {farmerDetails ? (
                    // Show Current Profile card & option to re-enter details
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      <div className="md:col-span-4 flex flex-col items-center p-5 bg-white/5 border border-white/5 rounded-2xl text-center">
                        <img 
                          id="onboarding-profile-pic"
                          src={farmerDetails.photo} 
                          alt={farmerDetails.name} 
                          className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400 shadow-md mb-3"
                          referrerPolicy="no-referrer"
                        />
                        <h3 id="onboarding-profile-name" className="text-base font-bold text-white">{farmerDetails.name}</h3>
                        <p id="onboarding-profile-phone" className="text-xs text-cyan-400 font-mono tracking-wider mt-1">{farmerDetails.phone}</p>
                        
                        <div className="w-full border-t border-white/5 mt-4 pt-4 flex flex-col gap-2">
                          <button
                            id="btn-re-register"
                            onClick={() => {
                              // Populate form with current values
                              setFormData({
                                name: farmerDetails.name,
                                phone: farmerDetails.phone,
                                address: farmerDetails.address,
                                land: farmerDetails.land,
                                crops: farmerDetails.crops,
                                photoType: "avatar",
                                photoUrl: farmerDetails.photo,
                                customFile: ""
                              });
                              // Clear details to show registration form
                              setFarmerDetails(null);
                            }}
                            className="w-full py-2.5 rounded-xl text-xs bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-400/30 font-semibold transition-all duration-200 cursor-pointer"
                          >
                            তথ্য সংশোধন / পুনরায় নিবন্ধন
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-8 flex flex-col gap-4">
                        <h4 className="text-sm font-semibold text-gray-300">সংরক্ষিত কৃষক তথ্য বিবরণ (Active Profile Details)</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                            <span className="text-[10px] text-gray-400 block mb-0.5">১. কৃষকের নাম:</span>
                            <span id="registered-detail-name" className="text-sm font-semibold text-white">{farmerDetails.name}</span>
                          </div>
                          
                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                            <span className="text-[10px] text-gray-400 block mb-0.5">২. মোবাইল নাম্বার:</span>
                            <span id="registered-detail-phone" className="text-sm font-mono font-semibold text-white">{farmerDetails.phone}</span>
                          </div>

                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                            <span className="text-[10px] text-gray-400 block mb-0.5">৩. বসবাসের ঠিকানা:</span>
                            <span id="registered-detail-address" className="text-sm font-semibold text-white">{farmerDetails.address}</span>
                          </div>

                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                            <span className="text-[10px] text-gray-400 block mb-0.5">৪. জমির মোট পরিমাণ:</span>
                            <span id="registered-detail-land" className="text-sm font-semibold text-white">{farmerDetails.land}</span>
                          </div>

                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl sm:col-span-2">
                            <span className="text-[10px] text-gray-400 block mb-0.5">৫. সবচেয়ে বেশি চাষকৃত ফসল:</span>
                            <span id="registered-detail-crops" className="text-sm font-semibold text-cyan-400 flex items-center gap-1.5 font-sans">
                              <Sprout className="w-4 h-4" />
                              {farmerDetails.crops}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-3 items-start mt-2">
                          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-gray-400 leading-relaxed">
                            <p className="text-emerald-300 font-semibold">গুগল শিট সার্ভার সিঙ্ক্রোনাইজড!</p>
                            <p className="text-[11px] mt-0.5">আপনার এই খামার ডাটা সিকিউরড লোকাল স্টোরেজে এবং সিমুলেটেড গুগল ফর্ম সাবমিশনের মাধ্যমে ক্লাউড স্প্রেডশিটে সংযুক্ত করা হয়েছে। নতুন তথ্য জমা দিলে লাইভ গুগল শিট ট্র্যাকার টেবিলটি রো অ্যাড্রেস সহ আপডেট হবে।</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    // Show actual Registration Form
                    <form id="onboarding-form" onSubmit={handleOnboardingSubmit} className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Field 1: Farmer Name */}
                        <div className="flex flex-col gap-1.5">
                          <label id="lbl-farmer-name" className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                            কৃষকের নাম (Farmer's full name) <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="field-farmer-name"
                            type="text"
                            required
                            placeholder="যেমন: মোঃ আবুল হাশেম"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="h-11 px-4 rounded-xl glass-input text-xs"
                          />
                        </div>

                        {/* Field 2: Farmer Phone */}
                        <div className="flex flex-col gap-1.5">
                          <label id="lbl-farmer-phone" className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                            কৃষকের মোবাইল নাম্বার (Mobile No.) <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="field-farmer-phone"
                            type="tel"
                            required
                            placeholder="যেমন: 01712-XXXXXX"
                            pattern="[0-9০-৯\-\s]+"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="h-11 px-4 rounded-xl glass-input text-xs"
                          />
                        </div>

                        {/* Field 3: Address */}
                        <div className="flex flex-col gap-1.5">
                          <label id="lbl-farmer-address" className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                            কৃষকের ঠিকানা (Village, Thana, District) <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="field-farmer-address"
                            type="text"
                            required
                            placeholder="যেমন: রডপাড়া, সাভার, ঢাকা"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            className="h-11 px-4 rounded-xl glass-input text-xs"
                          />
                        </div>

                        {/* Field 4: Amount of Land */}
                        <div className="flex flex-col gap-1.5">
                          <label id="lbl-farmer-land" className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                            কৃষকের জমির পরিমাণ (Land Area) <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="field-farmer-land"
                            type="text"
                            required
                            placeholder="যেমন: ৫ বিঘা / ১৩০ শতাংশ"
                            value={formData.land}
                            onChange={(e) => setFormData(prev => ({ ...prev, land: e.target.value }))}
                            className="h-11 px-4 rounded-xl glass-input text-xs"
                          />
                        </div>

                        {/* Field 5: Crops Cultivated Most */}
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label id="lbl-cultivated-crops" className="text-xs text-gray-300 font-semibold">
                            কৃষক জমিতে কোন ধরনের ফসল বেশী চাষ করেন? (Preferred Cultivation) <span className="text-red-400">*</span>
                          </label>
                          <select
                            id="field-cultivated-crops"
                            value={formData.crops}
                            onChange={(e) => setFormData(prev => ({ ...prev, crops: e.target.value }))}
                            className="h-11 px-3 rounded-xl bg-[#090D1A] border border-white/15 focus:border-cyan-400 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          >
                            <option value="ধান (Rice)">ধান (Rice)</option>
                            <option value="আলু (Potato)">আলু (Potato)</option>
                            <option value="ভুট্টা (Maize)">ভুট্টা (Maize)</option>
                            <option value="সরিষা (Mustard)">সরিষা (Mustard)</option>
                            <option value="টমেটো (Tomato)">টমেটো (Tomato)</option>
                            <option value="অন্যান্য সবজি ও ফসল">অন্যান্য সবজি ও ফসল</option>
                          </select>
                        </div>

                        {/* Field 6: Profile Photo (Optional Upload or preset avatar select) */}
                        <div className="flex flex-col gap-3 md:col-span-2 border-t border-white/5 pt-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-300 font-semibold">
                              প্রোফাইল ছবি নির্ধারণ (Profile Photo - Optional/ঐচ্ছিক)
                            </label>
                            
                            {/* Toggle selection mode */}
                            <div className="flex bg-white/5 p-1 rounded-lg text-xs gap-1">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, photoType: "avatar" }))}
                                className={`px-2 py-0.5 rounded ${formData.photoType === "avatar" ? "bg-cyan-500 text-black font-semibold" : "text-gray-400"}`}
                              >
                                এগ্রো এভারটার চয়ন
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, photoType: "upload" }))}
                                className={`px-2 py-0.5 rounded ${formData.photoType === "upload" ? "bg-cyan-500 text-black font-semibold" : "text-gray-400"}`}
                              >
                                ফাইল আপলোড
                              </button>
                            </div>
                          </div>

                          {formData.photoType === "avatar" ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {AVATAR_OPTIONS.map((avatar) => (
                                <button
                                  key={avatar.id}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, photoUrl: avatar.url }))}
                                  className={`p-2.5 rounded-2xl bg-white/[0.02] border transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                                    formData.photoUrl === avatar.url 
                                      ? "border-cyan-400 bg-cyan-500/10" 
                                      : "border-white/10 hover:bg-white/5"
                                  }`}
                                >
                                  <img 
                                    src={avatar.url} 
                                    alt={avatar.label} 
                                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="text-[10px] text-gray-300 text-center font-bold">{avatar.label}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-white/10 hover:border-cyan-400/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-white/[0.01] hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <input 
                                ref={fileInputRef} 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                className="hidden" 
                              />
                              {formData.customFile ? (
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={formData.customFile} 
                                    alt="Uploaded preview" 
                                    className="w-12 h-12 rounded-lg object-cover border border-cyan-400"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="text-left">
                                    <p className="text-xs font-semibold text-emerald-400">ছবি আপলোড সফল হয়েছে!</p>
                                    <p className="text-[10px] text-gray-500">পরিবর্তন করতে পুনরায় ক্লিক করুন</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-cyan-400" />
                                  <p className="text-xs text-gray-300">চাষীর প্রোফাইল ছবি ড্র্যাগ করুন অথবা এখানে ক্লিক করে সিলেক্ট করুন</p>
                                  <p className="text-[10px] text-gray-500">অনুমোদিত ফরম্যাট: JPG, PNG, WEBP (সর্বোচ্চ ২ মেগাবাইট)</p>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Onboarding synchronization submit */}
                      <div className="border-t border-white/10 pt-5 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            // Reset form to clear values
                            setFormData({
                              name: "",
                              phone: "",
                              address: "",
                              land: "",
                              crops: "ধান (Rice)",
                              photoType: "avatar",
                              photoUrl: AVATAR_OPTIONS[0].url,
                              customFile: ""
                            });
                          }}
                          className="px-5 py-3 rounded-xl border border-white/15 text-xs font-bold text-gray-300 hover:bg-white/5 transition-all text-center cursor-pointer"
                        >
                          ফর্ম মুছুন
                        </button>
                        
                        <button
                          id="btn-submit-registration"
                          type="submit"
                          className="px-6 py-3 rounded-xl btn-neon font-bold text-black border border-cyan-400/20 cursor-pointer text-xs tracking-wider flex items-center gap-2 active:scale-95"
                        >
                          নিবন্ধন সম্পন্ন করুন (Submit Setup)
                        </button>
                      </div>

                    </form>
                  )}

                  {/* Sync spinner loader overlay */}
                  {isSyncing && (
                    <div className="absolute inset-0 bg-[#020408]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <Loader2 className="w-14 h-14 animate-spin text-cyan-400" />
                        <Database className="w-6 h-6 text-white absolute inset-0 m-auto animate-bounce" />
                      </div>
                      <div className="text-center space-y-1">
                        <h4 className="text-sm font-bold text-white tracking-wide">গুগল স্প্রেডশিট ডাটাবেজের সাথে সিঙ্ক হচ্ছে...</h4>
                        <p className="text-[11px] text-cyan-400 font-mono tracking-tight animate-pulse">{syncStep}</p>
                      </div>
                    </div>
                  )}

                </div>

                {/* ==================== LIVE SPEADSHEET VISUALIZER (Google Sheet Database Simulation) ==================== */}
                <div className="glass-panel rounded-3xl p-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-sm font-bold text-white">লাইভ গুগল ফর্ম - ডাটাবেজ স্প্রেডশিট ট্র্যাকার</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">গুগল ফর্ম প্রেরিত রেসপন্স নিম্নোক্ত লাইভ স্প্রেডশিট ফাইলে (Google Sheet Table) সরাসরি যুক্ত হয়:</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        // Flash refreshing
                        setIsSyncing(true);
                        setSyncStep("ডাটাবেজ রিফ্রেশ এবং রো চেক করা হচ্ছে...");
                        setTimeout(() => setIsSyncing(false), 1000);
                      }}
                      className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 rounded-xl px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      টেবিল রিফ্রেশ (Refresh DB)
                    </button>
                  </div>

                  {/* Micro Google Sheets UI representation */}
                  <div className="overflow-x-auto rounded-xl border border-emerald-500/10 bg-black/30">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-emerald-950/40 text-emerald-400 border-b border-emerald-500/25">
                          <th className="py-2.5 px-3 border-r border-emerald-500/20 font-bold font-mono">Row</th>
                          <th className="py-2.5 px-3 border-r border-emerald-500/20 font-bold">Timestamp (তারিখ)</th>
                          <th className="py-2.5 px-3 border-r border-emerald-500/20 font-bold">Farmer Name (নাম)</th>
                          <th className="py-2.5 px-3 border-r border-emerald-500/20 font-bold">Mobile (মোবাইল)</th>
                          <th className="py-2.5 px-3 border-r border-emerald-500/20 font-bold">Address (ঠিকানা)</th>
                          <th className="py-2.5 px-3 border-r border-emerald-500/20 font-bold text-center">Land (জমি)</th>
                          <th className="py-2.5 px-3 border-r border-emerald-500/20 font-bold">Cultivation Crops (চাষকৃত ফসল)</th>
                          <th className="py-2.5 px-3 font-bold text-center">Photo Cell</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gridData.map((row, idx) => (
                          <tr 
                            key={idx} 
                            className={`border-b border-emerald-500/10 transition-all duration-700 ${
                              syncFlashIndex === idx 
                                ? "bg-emerald-500/20 animate-pulse text-white scale-[1.01]" 
                                : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <td className="py-2 px-3 border-r border-emerald-500/10 font-mono font-bold text-emerald-500/70">{idx + 2}</td>
                            <td className="py-2 px-3 border-r border-emerald-500/10 font-mono text-gray-400 whitespace-nowrap">{row.timestamp || "2026-06-08 11:15:30"}</td>
                            <td className="py-2 px-3 border-r border-emerald-500/10 font-semibold text-white">{row.name}</td>
                            <td className="py-2 px-3 border-r border-emerald-500/10 font-mono text-gray-300">{row.phone}</td>
                            <td className="py-2 px-3 border-r border-emerald-500/10 text-gray-300">{row.address}</td>
                            <td className="py-2 px-3 border-r border-emerald-500/10 text-gray-300 text-center font-bold">{row.land}</td>
                            <td className="py-2 px-3 border-r border-emerald-500/10 text-cyan-300 font-semibold">{row.crops}</td>
                            <td className="py-2 px-2 text-center flex justify-center">
                              <img 
                                src={row.photo} 
                                alt="Row photo" 
                                className="w-5 h-5 rounded-full object-cover border border-emerald-500/20"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 px-1">
                    <p className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      * Google Sheet ID: 1Ag7a9Wb2KrIsEbA_kH_fArMeRsDb93_2026
                    </p>
                    <p>শীট কলাম সংখ্যা: ৭টি ডেডিকেটেড ফিল্ড</p>
                  </div>

                </div>

              </motion.div>
            )}


            {/* ==================== TAB C: DYNAMIC NOTIFICATION INBOX ==================== */}
            {activeTab === "inbox" && (
              <motion.div
                key="inbox_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                id="panel-inbox"
                className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col gap-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      📨 আলার্ট ড্যাশবোর্ড ও ইনবক্স (Farmer Notifications)
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">আপনার চাষের ফসল, আবহাওয়া পরিস্থিতি এবং মৌসুমি খামারি পরামর্শ অনুযায়ী স্বয়ংক্রিয় এগ্রো-ফিড।</p>
                  </div>
                  <span className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl px-3.5 py-1 text-xs text-cyan-300 font-bold block">
                    ৩টি সক্রিয় নোটিফিকেশন
                  </span>
                </div>

                {/* Recommendations Banner if registered */}
                {farmerDetails ? (
                  <div className="bg-gradient-to-r from-cyan-950/30 to-blue-950/20 rounded-2xl p-4 border border-cyan-500/20 flex gap-3.5 items-start">
                    <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 shrink-0">
                      <Leaf className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">ব্যক্তিগত ফসল ফিল্টার সক্রিয়!</h4>
                      <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                        আপনি প্রধানত **{farmerDetails.crops}** চাষ করেন বিধায় আপনার খেতের ফসল রোগ এবং বালাই দমনে জেনারেট হওয়া পরামর্শগুলো নিচে অগ্রাধিকার দিয়ে পিন (Pin) করা হয়েছে।
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-500/5 rounded-2xl p-4 border border-yellow-500/10 flex gap-3.5 items-start">
                    <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-yellow-400">ব্যক্তিগত নির্দেশক নিষ্ক্রিয়</h4>
                      <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                        আপনার এখনো কোনো কৃষক নিবন্ধন নেই। নিবন্ধিত হলে আপনার এলাকার মাটি ও পছন্দের ফসল অনুযায়ী কাস্টমাইজড আবহাওয়া এলার্ট ইনবক্সে পাবেন।
                      </p>
                    </div>
                  </div>
                )}

                {/* Alert message lists */}
                <div className="flex flex-col gap-4">
                  {INBOX_NOTIFICATIONS.map((notif) => {
                    // Dynamic highlight check
                    const isRelevantToFarmer = farmerDetails && (
                      (farmerDetails.crops.includes("আলু") && notif.id === "notif-3") || 
                      (farmerDetails.crops.includes("ধান") && notif.id === "notif-1")
                    );

                    return (
                      <div 
                        key={notif.id}
                        className={`p-5 rounded-2xl border transition-all duration-300 flex gap-4 ${
                          notif.isUrgent 
                            ? "bg-red-500/[0.03] border-red-500/20 shadow-[0_4px_20px_rgba(239,68,68,0.05)]" 
                            : isRelevantToFarmer
                            ? "bg-cyan-500/[0.03] border-cyan-400/30 shadow-[0_4px_20px_rgba(0,210,255,0.05)] ring-1 ring-cyan-400/10" 
                            : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                        }`}
                      >
                        
                        {/* Icon Block */}
                        <div className={`p-3 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center ${
                          notif.isUrgent 
                            ? "bg-red-500/10 text-red-400" 
                            : notif.type === "season" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {notif.isUrgent ? (
                            <AlertTriangle className="w-6 h-6 animate-bounce" />
                          ) : (
                            <Leaf className="w-5 h-5" />
                          )}
                        </div>

                        {/* Content text */}
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              {notif.titleBangla}
                              {notif.isUrgent && (
                                <span className="bg-red-500 text-black text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">জরুরি</span>
                              )}
                              {isRelevantToFarmer && (
                                <span className="bg-cyan-500 text-black text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">আপনার চাষের ফসল</span>
                              )}
                            </h3>
                            <span className="text-[10px] text-gray-500 font-mono tracking-wide">{notif.timestamp}</span>
                          </div>

                          <p className="text-xs text-gray-300 leading-relaxed">{notif.descriptionBangla}</p>
                          <p className="text-[10px] text-gray-500 italic mt-1 leading-normal">System translation: {notif.description}</p>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Footnote */}
                <span className="text-[10px] text-gray-500 flex items-center gap-1.5 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                  <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  * কৃষি তথ্য ও আবহাওয়া সর্তকবার্তা অটোমেটিক উপগ্রহ ইমেজ এবং বাংলাদেশ আবহাওয়া অধিদপ্তরের (BMD) এপিআই সাবমিশনের সাথে ম্যাপিং সম্পন্ন করা হয়।
                </span>

              </motion.div>
            )}


            {/* ==================== TAB D: SEARCH & FERTILIZER SHOP LOCATOR ==================== */}
            {activeTab === "search" && (
              <motion.div
                key="search_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                id="panel-search"
                className="flex flex-col gap-6"
              >
                
                {/* Main Shop Locator search card */}
                <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      🗺️ অনুসন্ধান ও সার দোকান লোকেটর (Fertilizer Locator)
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">আপনার কাছাকাছি থানা বা নির্দিষ্ট এলাকায় লাইসেন্সপ্রাপ্ত ডিলার ও সারের দোকানের সন্ধান ও যোগাযোগ করুন।</p>
                  </div>

                  {/* Areas Selector and Shop search bar */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Area Dropdown selector */}
                    <div className="md:col-span-5 flex flex-col gap-1.5">
                      <label id="lbl-select-area" className="text-xs text-gray-400 font-semibold mb-0.5">নির্দিষ্ট এলাকা নির্বাচন করুন (Select Area):</label>
                      <select
                        id="select-area"
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="h-11 px-3 rounded-xl bg-[#090D1A] border border-white/15 focus:border-cyan-400 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                      >
                        {AREAS_LIST.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.labelBangla} — {area.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* text Search input filter */}
                    <div className="md:col-span-7 flex flex-col gap-1.5">
                      <label id="lbl-shop-search" className="text-xs text-gray-400 font-semibold mb-0.5 font-sans">দোকানদার বা ডিলারের নাম দিয়ে খুঁজুন (Keyword Search):</label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                        <input
                          id="field-shop-search"
                          type="text"
                          value={shopSearchQuery}
                          onChange={(e) => setShopSearchQuery(e.target.value)}
                          placeholder="যেমন: ভাই ভাই এন্টারপ্রাইজ, রফিক..."
                          className="w-full h-11 pl-9 pr-4 rounded-xl glass-input text-xs text-gray-100 placeholder:text-gray-500"
                        />
                        {shopSearchQuery && (
                          <button 
                            id="btn-clear-shop-search"
                            onClick={() => setShopSearchQuery("")} 
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Render Shops Directory List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {filteredShops.length > 0 ? (
                      filteredShops.map((shop) => (
                        <div 
                          key={shop.id}
                          className="p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-200"
                        >
                          <div className="space-y-1.5 text-left">
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">সরকারি অনুমোদিত ডিলার</span>
                            <h4 className="text-sm font-bold text-white mt-1 ">{shop.banglaName}</h4>
                            <p className="text-[11px] text-gray-400 italic font-mono">{shop.name}</p>
                            
                            <div className="flex items-center gap-1.5 text-xs text-gray-300 pt-2 font-sans">
                              <User className="w-3.5 h-3.5 text-cyan-400" />
                              <span>স্বত্বাধিকারী: <strong className="text-gray-200 font-medium">{shop.owner}</strong></span>
                            </div>
                            
                            <div className="flex items-start gap-1.5 text-xs text-gray-300">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                              <span>ঠিকানা: <strong className="text-gray-300 font-medium">{shop.banglaAddress}</strong></span>
                            </div>
                          </div>

                          {/* Contact quick actions */}
                          <div className="border-t border-white/5 pt-3.5 flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 tracking-wider">মোবাইল: {shop.phone}</span>
                            <a 
                              href={`tel:${shop.phone}`}
                              className="btn-neon px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              কল করুন (Call Dealer)
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
                        <MapPin className="w-8 h-8 text-gray-600 animate-bounce" />
                        <p className="font-semibold text-gray-400">এই এলাকায় কোনো সার বা বীজ দোকানদার খুঁজে পাওয়া যায়নি</p>
                        <p className="text-[10px]">অনুগ্রহ করে অন্য কোনো এরিয়া নির্বাচন করুন বা কি-ওয়ার্ড সংশোধন করুন।</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* ==================== CROP FERTILIZER COMPATIBILITY SYSTEM ==================== */}
                <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      🌱 ফসলভিত্তিক সার প্রয়োগ উপযোগিতা তালিকা (Crop-Fertilizer Compatibility)
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">কোন চাষের ফসলে কোন সার কতটুকু পরিমাণে ও কখন দিতে হবে তার বিজ্ঞানসম্মত ডাটা তালিকা নিচে দেখুন।</p>
                  </div>

                  {/* Horizontal visual crop tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-1">
                    {CROP_FERTILIZER_DATA.map((item) => (
                      <button
                        key={item.crop}
                        type="button"
                        onClick={() => setSelectedCropDetail(item)}
                        className={`h-11 rounded-xl transition-all font-semibold font-sans text-xs tracking-wide flex items-center justify-center gap-1.5 border cursor-pointer ${
                          selectedCropDetail?.crop === item.crop 
                            ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/10 border-cyan-400 text-white shadow-inner" 
                            : "bg-white/[0.01] hover:bg-white/5 border-white/10 text-gray-400 hover:text-gray-250"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        {item.cropBangla} ({item.crop})
                      </button>
                    ))}
                  </div>

                  {/* Dynamic render chosen crop details */}
                  {selectedCropDetail && (
                    <div className="bg-black/20 border border-white/5 p-4 md:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-5 items-start mt-2">
                      
                      {/* Crop Banner image */}
                      <div className="md:col-span-4 space-y-4">
                        <div className="w-full h-44 rounded-xl overflow-hidden relative border border-white/10">
                          <img 
                            src={selectedCropDetail.image} 
                            alt={selectedCropDetail.cropBangla} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#060913] to-transparent"></div>
                          <span className="absolute bottom-3 left-3 bg-cyan-500/90 text-black text-xs font-bold px-3 py-1 rounded-lg">
                            ফসল: {selectedCropDetail.cropBangla}
                          </span>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <h4 className="text-xs font-bold text-gray-200 mb-1 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-cyan-400" />
                            গুরুত্বপূর্ণ পরিচর্যা ও প্রো-টিপ:
                          </h4>
                          <p className="text-xs text-gray-300 leading-relaxed leading-normal">{selectedCropDetail.generalTipsBangla}</p>
                          <p className="text-[10px] text-gray-500 italic mt-1 font-sans">{selectedCropDetail.generalTips}</p>
                        </div>
                      </div>

                      {/* Fertilsers grid info */}
                      <div className="md:col-span-8 flex flex-col gap-4">
                        <h4 className="text-sm font-bold text-cyan-400">ব্যবহারোপযোগী সারের তালিকা (Ideal Fertilizer Matrix)</h4>
                        
                        <div className="flex flex-col gap-3">
                          {selectedCropDetail.fertilizers.map((fertilizer, idx) => (
                            <div 
                              key={idx}
                              className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2.5 text-left"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-1.5">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                  {fertilizer.nameBangla}
                                </span>
                                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono tracking-wide font-bold">
                                  প্রয়োজনীয় মাত্রা: {fertilizer.dosage}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <span className="text-[9px] text-gray-550 block mb-0.5 uppercase tracking-wide">১. প্রয়োগের উদ্দেশ্য:</span>
                                  <p className="text-gray-350 leading-relaxed">{fertilizer.purposeBangla}</p>
                                  <p className="text-[9px] text-gray-500 italic font-sans leading-normal">{fertilizer.purpose}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] text-gray-550 block mb-0.5 uppercase tracking-wide">২. সঠিক সময় সূচি:</span>
                                  <p className="text-gray-350 leading-relaxed font-sans font-light">{fertilizer.applicationTimeBangla}</p>
                                  <p className="text-[9px] text-gray-500 italic font-sans leading-normal">{fertilizer.applicationTime}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </motion.div>
            )}


            {/* ==================== TAB E: DEVELOPER INFO & BRAND PRICES ==================== */}
            {activeTab === "developer_info" && (
              <motion.div
                key="developer_info_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                id="panel-developer-info"
                className="flex flex-col gap-6"
              >
                
                {/* 🌟 Designed Showcase - Central Glowing Developer Card */}
                <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center border border-cyan-400/20 bg-gradient-to-br from-[#09152b] via-[#040914] to-[#0d1c38]">
                  
                  {/* Beautiful glowing neon background spots */}
                  <div className="absolute top-[-50px] left-[50%] -translate-x-[50%] w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none"></div>
                  <div className="absolute bottom-[-30px] right-5 w-44 h-44 rounded-full bg-blue-500/5 blur-[60px] pointer-events-none"></div>
                  
                  {/* Top glowing ambient line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                  
                  {/* Badge */}
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/40 mb-4 animate-bounce">
                    <Award className="w-8 h-8" />
                  </div>

                  {/* HIGH-CONTRAST GLOWING PANEL */}
                  <div className="py-5 px-6 bg-black/40 rounded-2xl border border-cyan-400/10 inline-block max-w-xl mx-auto shadow-inner relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-15"></div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-bold font-mono">SYSTEM AUTHORITY CREDIT</span>
                    
                    <h1 className="text-xl md:text-3xl font-extrabold tracking-widest text-[#00D2FF] mt-2 mb-1.5 drop-shadow-[0_0_12px_rgba(0,210,255,0.4)] uppercase">
                      DEVELOPED BY IFTEKHAR AHMAD
                    </h1>
                    
                    <p className="text-[11px] md:text-xs text-gray-300 font-medium">
                      Lead System & AI Solutions Architect • Agro-Technology Specialist
                    </p>
                  </div>

                  <p className="max-w-2xl mx-auto text-xs text-gray-400 leading-relaxed mt-5">
                    কৃষকদের টেকসই উন্নয়ন এবং তথ্য প্রযুক্তির সর্বোচ্চ সুবিধা প্রান্তিক খামারিদের দোরগোড়ায় পৌঁছে দিতে এই আধুনিক এগ্রিকালচারাল প্ল্যাটফর্মটি সুচারুরূপে ডিজাইন ও ডেভেলপ করা হয়েছে। জেমিনি এআই এগ্রো модель রেসপন্স, গুগল ফর্ম এবং স্প্রেডশিট ক্লাউড সিঙ্ক ফিচার প্ল্যাটফর্মটিকে করেছে সাশ্রয়ী ও আন্তর্জাতিক মানের।
                  </p>

                  {/* Tiny meta info */}
                  <div className="flex flex-wrap justify-center items-center gap-4 text-[10px] text-gray-500 font-mono pt-5 border-t border-white/5 mt-5">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-505" />
                      SECURE INTEGRATION CERTIFIED
                    </span>
                    <span>•</span>
                    <span>BUILD: VER. 2.6.8 PRO</span>
                    <span>•</span>
                    <span className="text-cyan-400">STATUS: LIVE CLOUD RUN</span>
                  </div>
                </div>

                {/* 🌾 BRAND FERTILIZER HONEST PRICE SECTION */}
                <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col gap-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-cyan-400" />
                        ব্র্যান্ডভিত্তিক সারের বাজার দর (Brand Fertilizer Honest Price Guide)
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        বাংলাদেশের শীর্ষ সার উৎপাদনকারী ও বিতরণকারী ব্র্যান্ডসমূহের সরকারি অনুমোদিত সর্বোচ্চ খুচরা মূল্য ও ন্যায্য দর।
                      </p>
                    </div>

                    {/* Brand Selector filter */}
                    <div className="flex bg-white/5 p-1 rounded-xl text-[11px] gap-1 border border-white/5 shrink-0 overflow-x-auto max-w-full">
                      {[
                        { id: "all", label: "সব ব্র্যান্ড" },
                        { id: "aci", label: "ACI" },
                        { id: "ispahani", label: "Ispahani" },
                        { id: "northern", label: "Northern" },
                        { id: "haychem", label: "Haychem" },
                        { id: "syngenta", label: "Syngenta" }
                      ].map((brand) => (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() => setSelectedBrandFilter(brand.id)}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer font-semibold ${
                            selectedBrandFilter === brand.id 
                              ? "bg-cyan-500 text-black shadow-md font-bold" 
                              : "text-gray-405 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {brand.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Fertilizer Price List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: "item-1", brand: "aci", brandName: "ACI Fertilizer", product: "এসিআই বাম্পার দস্তা (Zinc)", size: "১ কেজি প্যাকেট", govMaxPrice: 130, honestPrice: 120, rating: "সিগনেচার গ্রেড", note: "ফসলের কুশি বৃদ্ধি ও মাটি গঠনে সহায়তাকারী।" },
                      { id: "item-2", brand: "aci", brandName: "ACI Fertilizer", product: "এসিআই জিপসাম (Gypsum)", size: "২৫ কেজি ব্যাগ", govMaxPrice: 280, honestPrice: 260, rating: "উচ্চ মানসম্পন্ন", note: "শিকড় বৃদ্ধি ও সালফার পুষ্টির সেরা উৎস।" },
                      { id: "item-3", brand: "aci", brandName: "ACI Fertilizer", product: "এসিআই বাম্পার বোরন (Boron)", size: "৫০০ গ্রাম", govMaxPrice: 160, honestPrice: 150, rating: "মাটির আর্দ্রতা রক্ষক", note: "ফুল ও ফল ঝরে পড়া রোধ করে।" },
                      { id: "item-4", brand: "aci", brandName: "ACI Fertilizer", product: "এসিআই জৈব কম্পোস্ট (Organic)", size: "৪০ কেজি ব্যাগ", govMaxPrice: 580, honestPrice: 540, rating: "১০০% অর্গানিক সার", note: "মাটির উর্বরতা ও পানি ধারণক্ষমতা বাড়ায়।" },

                      { id: "item-5", brand: "ispahani", brandName: "Ispahani Agro Limited", product: "ইস্পাহানী ট্রাইকো-কম্পোস্ট (Trichoderma)", size: "৫০ কেজি ব্যাগ", govMaxPrice: 750, honestPrice: 700, rating: "ব্যাকটেরিয়া রোধক", note: "মাটির রোগ সৃষ্টিকারী ছত্রাককে দমন করে।" },
                      { id: "item-6", brand: "ispahani", brandName: "Ispahani Agro Limited", product: "ইস্পাহানী জিংক সালফেট (Heptahydrate)", size: "১ কেজি প্যাকেট", govMaxPrice: 140, honestPrice: 130, rating: "পুষ্টি যোগানদাতা", note: "পাতার হলদে ভাব এবং বাড়ন্ত ধানের জন্য কার্যকর।" },
                      { id: "item-7", brand: "ispahani", brandName: "Ispahani Agro Limited", product: "ইস্পাহানী জৈব গুটি সার", size: "১০ কেজি ব্যাগ", govMaxPrice: 220, honestPrice: 200, rating: "দীর্ঘমেয়াদী নাইট্রোজেন", note: "সবজি চাষের জন্য দীর্ঘস্থায়ী পুষ্টির যোগান দেয়।" },

                      { id: "item-8", brand: "northern", brandName: "Northern Agro Services Ltd", product: "নর্দার্ন গোল্ডেন অর্গানিক ফার্টিলাইজার", size: "৪০ কেজি ব্যাগ", govMaxPrice: 600, honestPrice: 550, rating: "উচ্চ জৈব উপদান", note: "পরিবেশবান্ধব উপাদানে মাটির পিএইচ (pH) নিয়ন্ত্রণ করে।" },
                      { id: "item-9", brand: "northern", brandName: "Northern Agro Services Ltd", product: "নর্দার্ন কেলপ-ম্যাক্স অ্যাক্টিভেটর", size: "১ লিটার বোতল", govMaxPrice: 480, honestPrice: 450, rating: "শিকড় উদ্দীপক হরমোন", note: "অতিরিক্ত শক্তিশালী সামুদ্রিক শৈবালের রসযুক্ত।" },

                      { id: "item-10", brand: "haychem", brandName: "Haychem (Bangladesh) Limited", product: "হেচেম সলুবল ক্রপ বায়ো-স্টিমুল্যান্ট", size: "১০০ গ্রাম প্যাকেট", govMaxPrice: 180, honestPrice: 165, rating: "অতিরিক্ত শক্তিশালী এনজাইম", note: "ক্লান্তি কাটিয়ে ফসলের দ্রুত বাড় নিশ্চিত করে।" },
                      { id: "item-11", brand: "haychem", brandName: "Haychem (Bangladesh) Limited", product: "হেচেম চিলেটেড দস্তা (EDTA Zinc 12%)", size: "২৫০ গ্রাম প্যাকেট", govMaxPrice: 210, honestPrice: 195, rating: "সহজ শোষণযোগ্য জিংক", note: "সবজিতে তামাটে ছোপ দাগ পড়তে বাধা দেয়।" },

                      { id: "item-12", brand: "syngenta", brandName: "Syngenta Bangladesh Limited", product: "সিনজেনটা গ্রো-মোর নিউট্রিশন বুস্টার", size: "৫০০ গ্রাম প্যাকেট", govMaxPrice: 350, honestPrice: 320, rating: "রোগ প্রতিরোধ ক্ষমতা বর্ধক", note: "ফলনের আকার ও উজ্জ্বলতা বহুগুণ বাড়ায়।" },
                      { id: "item-13", brand: "syngenta", brandName: "Syngenta Bangladesh Limited", product: "সিনজেনটা ইউরিয়া নাইট্রো-ম্যাক্স", size: "৫০ কেজি ব্যাগ", govMaxPrice: 1300, honestPrice: 1250, rating: "ধীরগতির রিলিজ নাইট্রোজেন", note: "বৃষ্টির পানিতে ধুয়ে সারের অপচয় হ্রাস করে।" },
                      { id: "item-14", brand: "syngenta", brandName: "Syngenta Bangladesh Limited", product: "সিনজেনটা থিওভিট ছত্রাকনাশক ও সার", size: "১ কেজি প্যাকেট", govMaxPrice: 290, honestPrice: 270, rating: "দ্বিমুখী অ্যাকশন", note: "একইসাথে সালফার সার এবং মাকড়নাশক হিসেবে কাজ করে।" }
                    ]
                      .filter((item) => selectedBrandFilter === "all" || item.brand === selectedBrandFilter)
                      .map((item) => (
                        <div 
                          key={item.id}
                          className="p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-200 relative group"
                        >
                          <div className="space-y-2 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                {item.brandName}
                              </span>
                              <span className="text-[9px] text-[#00D2FF] font-semibold flex items-center gap-1 bg-[#00D2FF]/10 px-1.5 py-0.5 rounded">
                                <Award className="w-2.5 h-2.5" />
                                {item.rating}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white font-sans mt-1.5 group-hover:text-[#00D2FF] transition-colors">{item.product}</h4>
                            <p className="text-xs text-gray-400 font-medium">প্যাকিং সাইজ: {item.size}</p>
                            <p className="text-[11px] text-gray-500 leading-normal italic">{item.note}</p>
                          </div>

                          <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs mt-2">
                            <div>
                              <span className="text-[9px] text-gray-500 block">নির্ধারিত খুচরা মূল্য (MRP):</span>
                              <span className="text-gray-400 line-through font-semibold font-mono">৳{item.govMaxPrice}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-emerald-400 block font-semibold flex items-center gap-0.5 justify-end">
                                <Tag className="w-2.5 h-2.5" />
                                ন্যায্য বাজার দর:
                              </span>
                              <span className="text-base font-extrabold text-emerald-400 font-mono">৳{item.honestPrice}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 🌾 HONEST PRICE OF HARVEST SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left segment - Market Rates (7 columns) */}
                  <div className="lg:col-span-7 glass-panel rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        ফসলের ন্যায্য পাইকারি বাজার মূল্য (Harvest Market Honest Price)
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        পাইকারি আড়তদার ও ফড়িয়াদের হাত থেকে বাঁচতে এবং ফসলের ন্যায্য দাম নিশ্চিত করতে কৃষি সম্প্রসারণ অধিদপ্তর অনুমোদিত বাজার দর দরপত্র।
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-white/5 text-gray-300 border-b border-white/10">
                            <th className="py-3 px-4 font-bold">চাষকৃত ফসল</th>
                            <th className="py-3 px-4 font-bold">সরকারি ক্রয় মূল্য (কেজি)</th>
                            <th className="py-3 px-4 font-bold text-right">ন্যায্য বাজার দর (মন)</th>
                            <th className="py-3 px-4 font-bold text-center">বাজারের ট্রেন্ড</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: "ধান (Boro Paddy)", govPrice: "৳৩২ / কেজি", honestPrice: "৳১২৮০ - ৳১৩২০", trend: "উর্ধমুখী ↑", isUp: true, buyback: "সরাসরি খাদ্যগুদাম" },
                            { name: "আলু (Diamond Potato)", govPrice: "৳২৫ / কেজি", honestPrice: "৳১১২ো - ৳১২০০", trend: "উর্ধমুখী ↑", isUp: true, buyback: "কোল্ড স্টোরেজ সমবায়" },
                            { name: "সরিষা বীজ (Mustard)", govPrice: "৳৮০ / কেজি", honestPrice: "৳৩৫০০ - ৳৩৭০০", trend: "স্থিতিশীল →", isUp: false, buyback: "তেল নিষ্কাশন কোল্ড" },
                            { name: "ভুট্টা (Feed Maize)", govPrice: "৳২৪ / কেজি", honestPrice: "৳৯৬০ - ৳১০৪০", trend: "উর্ধমুখী ↑", isUp: true, buyback: "ফিড মিল অ্যাসোসিয়েশন" },
                            { name: "টমেটো (Tomato)", govPrice: "৳৩০ / কেজি", honestPrice: "৳১৪০০ - ৳১৬০০", trend: "স্থিতিশীল →", isUp: false, buyback: "সবজি আড়ৎ উইং" },
                            { name: "গম (Wheat - Grade A)", govPrice: "৳৩৬ / কেজি", honestPrice: "৳১৪৪০ - ৳১৫০০", trend: "উর্ধমুখী ↑", isUp: true, buyback: "খাদ্য অধিদপ্তর" }
                          ].map((crop, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {crop.name}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-medium text-cyan-400">{crop.govPrice}</td>
                              <td className="py-3.5 px-4 text-right font-bold text-emerald-400 font-mono">{crop.honestPrice}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  crop.isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                                }`}>
                                  {crop.trend}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-2.5 items-start">
                      <Info className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        <strong className="text-emerald-300">প্রো-টিপস: </strong> সরকারি ন্যায্য মূল্যে আপনার ধান বা গম সরাসরি খাদ্য গুদামে বিক্রি করতে ‘কৃষক অ্যাপ’ বা আপনার ইউনিয়ন ডিজিটাল সেন্টারে যোগাযোগ করুন। এছাড়া সারের মূল্য তদারকি করতে সরকারি হটলাইন <strong className="text-white font-mono">১৬১২৩</strong> নাম্বারে বিনামূল্যে কল করতে পারেন। 
                      </p>
                    </div>
                  </div>

                  {/* Right segment - Interactive Profit Calculator (5 columns) */}
                  <div className="lg:col-span-5 glass-panel rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                        চাষী লাভ হিসাবকারী ক্যালকুলেটর (Profit Predictor)
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        আপনার চাষকৃত জমির মোট খরচ এবং ফলন অনুযায়ী আনুমানিক লাভ বা লোকসানের অনুপাত ন্যায্য বাজার দরে হিসাব করুন।
                      </p>
                    </div>

                    {/* Inputs form wrapper */}
                    <div className="space-y-4">
                      
                      {/* Step 1: Crop Select */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-300 font-semibold">১. চাষকৃত ফসলের ধরন:</label>
                        <select
                          value={profitCrop}
                          onChange={(e) => setProfitCrop(e.target.value)}
                          className="h-10 px-3 rounded-xl bg-[#030611] border border-white/10 text-xs text-gray-205 focus:border-cyan-400 focus:outline-none"
                        >
                          <option value="rice">ধান (Boro Paddy) — ৳১৩০০ / মন</option>
                          <option value="potato">আলু (Potato) — ৳১১৫০ / মন</option>
                          <option value="mustard">সরিষা (Mustard Seed) — ৳৩৬০০ / মন</option>
                          <option value="maize">ভুট্টা (Feed Maize) — ৳১০০০ / মন</option>
                        </select>
                      </div>

                      {/* Step 2: Production Cost */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-300 font-semibold">২. অনুমিত উৎপাদন খরচ (টাকা/বিঘা):</label>
                          <span className="text-xs font-mono font-bold text-cyan-400">৳{profitCost}</span>
                        </div>
                        <input
                          type="range"
                          min="2000"
                          max="25000"
                          step="500"
                          value={profitCost}
                          onChange={(e) => setProfitCost(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex items-center justify-between text-[9px] text-gray-500 leading-normal">
                          <span>কমলা খরচ (৳২,০০০)</span>
                          <span>মাঝারি গ্রাফ</span>
                          <span>উচ্চ প্রযুক্তি (৳২৫,০০০)</span>
                        </div>
                      </div>

                      {/* Step 3: Yield in Maund */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-300 font-semibold">৩. মোট প্রত্যাশিত ফলন (মন/বিঘা):</label>
                          <span className="text-xs font-mono font-bold text-cyan-400">{profitYield} মন (৪০ কেজি/মন)</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="45"
                          step="1"
                          value={profitYield}
                          onChange={(e) => setProfitYield(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex items-center justify-between text-[9px] text-gray-500 leading-normal">
                          <span>কম (২ মন)</span>
                          <span>গড় জোন (১৫ মন)</span>
                          <span>বাম্পার ফলন (৪৫ মন)</span>
                        </div>
                      </div>

                    </div>

                    {/* Results panel cards */}
                    <div className="bg-[#030611] rounded-2xl p-4 border border-white/5 space-y-3 mt-1.5 text-left">
                      
                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/5 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-500 block">মোট संभावित বিক্রি:</span>
                          <span className="text-sm font-bold text-white font-mono">৳{profitCalculation.revenue}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block">মোট ব্যয়:</span>
                          <span className="text-sm font-bold text-gray-400 font-mono">৳{profitCost}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between font-sans">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-semibold font-sans">নিট আনুমানিক লাভ (Net Profit):</span>
                          <strong className={`text-base font-extrabold font-mono ${
                            profitCalculation.isLoss ? "text-red-400" : "text-emerald-400"
                          }`}>
                            {profitCalculation.isLoss ? "লোকসান: " : "লাভ: "} ৳{Math.abs(profitCalculation.netProfit)}
                          </strong>
                        </div>
                        
                        <div className={`py-1.5 px-3 rounded-xl border text-center shrink-0 ${
                          profitCalculation.isLoss 
                            ? "bg-red-500/10 border-red-500/20 text-red-400" 
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        }`}>
                          <span className="text-[9px] text-gray-400 block uppercase font-mono font-medium">লাভের হার (ROI):</span>
                          <strong className="text-xs font-extrabold font-mono">{profitCalculation.roi}%</strong>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* 🌾 Glassmorphic Footer */}
      <footer id="main-footer" className="w-full mt-auto py-6 glass-panel border-t border-white/10 text-center text-xs text-gray-500 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3">
          <p className="text-gray-400 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-cyan-400" />
            কৃষি সেবা — টেকসই চাষাবাদ নিশ্চিত করতে আপনার ডিজিটাল সাথি। কপিরাইট © ২০২৬ সকল স্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-4 text-[11px] text-gray-500 font-mono">
            <span className="hover:text-cyan-400 transition-colors">গুগল ফর্ম এপিআই ইন্টিগ্রেশন</span>
            <span>•</span>
            <span className="hover:text-cyan-400 transition-colors">জেমিনি এগ্রিকালচারাল এলএলএম</span>
            <span>•</span>
            <span className="hover:text-cyan-400 transition-colors">কৃষি সম্প্রসারণ অধিদপ্তর রেফারেন্স</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
