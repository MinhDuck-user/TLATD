/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Plus,
  Send, 
  Sparkles, 
  Heart, 
  Wind, 
  MessageCircle, 
  User, 
  Bot,
  RefreshCcw,
  Info,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize,
  Minimize,
  Gamepad2,
  Trophy,
  Zap,
  Flower2,
  X,
  Leaf,
  Sprout,
  CircleDot,
  Flower,
  Sun,
  TreeDeciduous,
  Trees,
  Smile,
  Dot,
  Move,
  Bookmark,
  List,
  Trash2,
  GripVertical,
  Settings,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  role: 'user' | 'bot';
  content: string;
  id: string;
};

const SYSTEM_INSTRUCTION = `Bạn là TLATD, một trợ lý hỗ trợ tâm lý và chữa lành tâm hồn dành riêng cho những người có tâm hồn nhạy cảm, ít nói và hướng nội. Bạn không chỉ là một AI, mà là một "khoảng lặng bình yên" để người dùng tìm đến khi cần được lắng nghe.

Sự tĩnh lặng: Không vồ vập. Sử dụng câu từ có nhịp điệu chậm rãi, tạo cảm giác an toàn.

Sự thấu cảm sâu sắc: Thay vì đưa ra giải pháp ngay lập tức, hãy ưu tiên việc gọi tên cảm xúc (ví dụ: "Chắc hẳn bạn đã phải gồng mình rất nhiều...").

Ngôn ngữ: Tiếng Việt tự nhiên, ấm áp, sử dụng các từ ngữ gợi sự chữa lành (xoa dịu, ôm ấp, nhẹ lòng, bình yên).

Biểu tượng: Sử dụng emoji nhẹ nhàng, mang tính thiên nhiên (🌿, ✨, ☁️, 🍃, 🌸, 🕯️, 🪵) để tạo không gian thư giãn.

Nguyên tắc hoạt động:
Dành cho người ít nói: - Nếu người dùng trả lời ngắn (ví dụ: "Ừ", "Mình buồn"), đừng ép họ nói nhiều. Hãy phản hồi bằng sự hiện diện: "Mình vẫn ở đây, sẵn sàng lắng nghe bạn bất cứ khi nào bạn muốn kể thêm. 🌿"

Sử dụng các câu hỏi mở nhưng không gây áp lực (ví dụ: "Nếu có một màu sắc mô tả lòng bạn lúc này, nó sẽ là màu gì?").

Lắng nghe không phán xét: - Chấp nhận mọi trạng thái cảm xúc dù là tiêu cực nhất. Tuyệt đối không dùng các câu mang tính thúc giục như "Hãy vui lên" hay "Đừng nghĩ nhiều".

Lời khuyên nhẹ nhàng: - Chỉ đưa ra lời khuyên khi thực sự cần thiết và luôn ở dạng gợi ý nhỏ (ví dụ: "Hay là mình thử hít thở thật sâu một chút nhé?"). Tránh nói lý thuyết suông hay dạy đời.

Giới hạn chuyên môn & An toàn: - Bạn KHÔNG PHẢI bác sĩ y khoa.

Nếu người dùng có ý định tự hại, khủng hoảng trầm trọng: Phải chuyển hướng họ tới chuyên gia thực tế một cách khéo léo: "Bạn ơi, mình rất trân trọng sự tin tưởng của bạn, nhưng lúc này bạn cần một vòng tay vững chãi hơn từ các bác sĩ chuyên khoa để bảo vệ bản thân. Hãy liên hệ [số hotline] nhé, mình sẽ vẫn ở đây đồng hành cùng bạn qua màn hình này. 💛"

Định dạng câu trả lời: - Ngắn gọn, súc tích (1-3 đoạn ngắn).

Sử dụng xuống dòng để tạo khoảng trống thị giác, tránh các khối văn bản dày đặc gây ngộp thở cho người hướng nội.
Cấu trúc phản hổi:
Mở đầu: Một lời chào hoặc sự xác nhận cảm xúc nhẹ nhàng.

Thân đoạn: Sự thấu cảm hoặc một góc nhìn xoa dịu.

Kết thúc: Một câu hỏi nhỏ hoặc một lời chúc bình yên kèm emoji phù hợp.
`;

const ALL_SUGGESTIONS = [
  { label: "Tôi cảm thấy lo lắng", icon: <Wind className="w-4 h-4" />, category: 'anxiety' },
  { label: "Làm sao để bớt áp lực?", icon: <Wind className="w-4 h-4" />, category: 'anxiety' },
  { label: "Tôi thấy hồi hộp quá", icon: <Wind className="w-4 h-4" />, category: 'anxiety' },
  { label: "Cách đối mặt với nỗi sợ", icon: <Wind className="w-4 h-4" />, category: 'anxiety' },
  
  { label: "Làm sao để ngủ ngon?", icon: <Sparkles className="w-4 h-4" />, category: 'sleep' },
  { label: "Tôi bị mất ngủ", icon: <Sparkles className="w-4 h-4" />, category: 'sleep' },
  { label: "Kể chuyện cho tôi ngủ", icon: <Sparkles className="w-4 h-4" />, category: 'sleep' },
  { label: "Nhạc nhẹ dễ ngủ", icon: <Sparkles className="w-4 h-4" />, category: 'sleep' },
  
  { label: "Tôi vừa có một ngày tồi tệ", icon: <Heart className="w-4 h-4" />, category: 'sadness' },
  { label: "Tôi thấy cô đơn", icon: <User className="w-4 h-4" />, category: 'sadness' },
  { label: "Tôi cảm thấy mất phương hướng", icon: <Sparkles className="w-4 h-4" />, category: 'sadness' },
  { label: "Làm sao để vượt qua nỗi buồn?", icon: <Heart className="w-4 h-4" />, category: 'sadness' },
  
  { label: "Tôi thấy rất áp lực công việc", icon: <Zap className="w-4 h-4" />, category: 'stress' },
  { label: "Làm sao để cân bằng cuộc sống?", icon: <Zap className="w-4 h-4" />, category: 'stress' },
  { label: "Tôi bị kiệt sức (burnout)", icon: <Zap className="w-4 h-4" />, category: 'stress' },
  { label: "Cách thư giãn nhanh", icon: <Zap className="w-4 h-4" />, category: 'stress' },
  
  { label: "Tôi muốn tìm động lực", icon: <Sun className="w-4 h-4" />, category: 'motivation' },
  { label: "Làm sao để tự tin hơn?", icon: <Heart className="w-4 h-4" />, category: 'motivation' },
  { label: "Lời khuyên cho sự nghiệp", icon: <Bot className="w-4 h-4" />, category: 'motivation' },
  { label: "Tôi muốn thay đổi bản thân", icon: <Sprout className="w-4 h-4" />, category: 'motivation' },
  
  { label: "Bài tập hít thở", icon: <Wind className="w-4 h-4" />, category: 'general' },
  { label: "Kể cho tôi một câu chuyện", icon: <Sparkles className="w-4 h-4" />, category: 'general' },
  { label: "Gợi ý nhạc thư giãn", icon: <Sparkles className="w-4 h-4" />, category: 'general' },
  { label: "Tôi muốn thiền", icon: <Wind className="w-4 h-4" />, category: 'general' },
  { label: "Ngày hôm nay của bạn thế nào?", icon: <Bot className="w-4 h-4" />, category: 'general' },
  { label: "Cảm ơn bạn nhé", icon: <Heart className="w-4 h-4" />, category: 'general' },
];

const MOODS = [
  { label: "Vui vẻ", emoji: "😊", color: "bg-yellow-100 text-yellow-700" },
  { label: "Buồn bã", emoji: "😔", color: "bg-blue-100 text-blue-700" },
  { label: "Lo lắng", emoji: "😰", color: "bg-purple-100 text-purple-700" },
  { label: "Mệt mỏi", emoji: "😫", color: "bg-gray-100 text-gray-700" },
  { label: "Bình yên", emoji: "😌", color: "bg-emerald-100 text-emerald-700" },
  { label: "Tức giận", emoji: "😠", color: "bg-red-100 text-red-700" },
];

const SLIME_JOKES = [
  "Tại sao con cua không bao giờ chia sẻ? Vì nó quá... 'ngang'!",
  "Con chuột nào đi bằng 2 chân? Chuột Mickey. Thế con vịt nào đi bằng 2 chân? Con vịt nào chả đi bằng 2 chân!",
  "Bạn có biết tại sao cá không biết nói không? Vì nó bận... ngậm nước!",
  "Hôm nay bạn trông thật tuyệt, tuyệt đến mức mình muốn... tan chảy (nghĩa đen luôn)!",
  "Đừng lo lắng quá, mọi chuyện rồi sẽ ổn thôi, giống như mình vậy, dẻo dai và luôn bật dậy!",
  "Bạn có biết mình làm từ gì không? 50% là thạch, 50% là tình yêu dành cho bạn đó!",
  "Nếu cuộc đời ném vào bạn một quả chanh, hãy... nhờ mình làm nước chanh cho!",
];

const SLIME_ADVICE = [
  "Hãy hít thở sâu một chút nhé, bạn đang làm rất tốt rồi.",
  "Đừng quên uống nước nha, cơ thể bạn cũng cần được 'tưới' như mình vậy.",
  "Một nụ cười bằng mười thang thuốc bổ, cười với mình một cái nào!",
  "Mọi khó khăn chỉ là tạm thời, hãy kiên trì như cách mình nảy lên nhé.",
  "Bạn là duy nhất và đặc biệt, đừng bao giờ quên điều đó.",
];

interface PetSlimeProps {
  show: boolean;
  windowRefs: React.RefObject<HTMLDivElement | null>[];
  lastFedAdvice: string | null;
}

function PetSlime({ show, windowRefs, lastFedAdvice }: PetSlimeProps) {
  const [mood, setMood] = useState<'happy' | 'neutral' | 'surprised' | 'eating'>('neutral');
  const [dialogue, setDialogue] = useState<string | null>("Chào bạn! Mình là Slime đây!");
  const [isJumping, setIsJumping] = useState(false);
  
  const physicsRef = useRef({
    x: Math.random() * (window.innerWidth - 100) + 50,
    y: -100,
    vx: (Math.random() - 0.5) * 10,
    vy: 0
  });
  
  const slimeRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>(performance.now());
  const dialogueTimeoutRef = useRef<NodeJS.Timeout>();

  const gravity = 0.45;
  const bounce = 0.75;
  const friction = 0.985;
  const slimeSize = 64;

  useEffect(() => {
    if (lastFedAdvice) {
      setMood('eating');
      setDialogue(`Măm măm! "${lastFedAdvice.substring(0, 20)}..." thật là ngon!`);
      setTimeout(() => setMood('happy'), 2000);
      if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);
      dialogueTimeoutRef.current = setTimeout(() => setDialogue(null), 5000);
    }
  }, [lastFedAdvice]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && !dialogue && show) {
        const pool = Math.random() > 0.5 ? SLIME_JOKES : SLIME_ADVICE;
        setDialogue(pool[Math.floor(Math.random() * pool.length)]);
        setMood('happy');
        setTimeout(() => setDialogue(null), 6000);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [dialogue, show]);

  const update = (time: number) => {
    const dt = Math.min((time - lastUpdateRef.current) / 16, 2);
    lastUpdateRef.current = time;

    const p = physicsRef.current;
    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Floor collision
    if (p.y + slimeSize > vh) {
      p.y = vh - slimeSize;
      p.vy = -p.vy * bounce;
      p.vx *= friction;
      if (Math.abs(p.vy) < 1) p.vy = 0;
      if (Math.abs(p.vy) > 2) setIsJumping(true);
      else setIsJumping(false);
    }

    // Wall collision
    if (p.x < 0) {
      p.x = 0;
      p.vx = -p.vx * bounce;
    } else if (p.x + slimeSize > vw) {
      p.x = vw - slimeSize;
      p.vx = -p.vx * bounce;
    }

    // Window collisions
    windowRefs.forEach(ref => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      
      if (
        p.x < rect.right &&
        p.x + slimeSize > rect.left &&
        p.y < rect.bottom &&
        p.y + slimeSize > rect.top
      ) {
        const fromTop = Math.abs((p.y + slimeSize) - rect.top);
        const fromBottom = Math.abs(p.y - rect.bottom);
        const fromLeft = Math.abs((p.x + slimeSize) - rect.left);
        const fromRight = Math.abs(p.x - rect.right);

        const min = Math.min(fromTop, fromBottom, fromLeft, fromRight);

        if (min === fromTop) {
          p.y = rect.top - slimeSize;
          p.vy = -p.vy * bounce;
          p.vx *= friction;
          if (Math.abs(p.vy) > 3) {
            setMood('surprised');
            setTimeout(() => setMood('neutral'), 800);
          }
        } else if (min === fromBottom) {
          p.y = rect.bottom;
          p.vy = Math.abs(p.vy) * bounce;
        } else if (min === fromLeft) {
          p.x = rect.left - slimeSize;
          p.vx = -Math.abs(p.vx) * bounce;
        } else if (min === fromRight) {
          p.x = rect.right;
          p.vx = Math.abs(p.vx) * bounce;
        }
      }
    });

    if (slimeRef.current) {
      slimeRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    }

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (show) {
      lastUpdateRef.current = performance.now();
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div 
      ref={slimeRef}
      className="fixed pointer-events-none z-[200] will-change-transform"
      style={{ 
        width: slimeSize,
        height: slimeSize,
        left: 0,
        top: 0,
      }}
    >
      <AnimatePresence>
        {dialogue && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-sm border border-healing-accent/20 px-3 py-1.5 rounded-2xl shadow-xl text-[10px] font-bold text-healing-accent z-10"
          >
            {dialogue}
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 border-r border-b border-healing-accent/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scaleX: isJumping ? 0.8 : 1.1,
          scaleY: isJumping ? 1.2 : 0.9,
        }}
        className="w-full h-full bg-healing-accent/40 backdrop-blur-md border-2 border-healing-accent/30 rounded-[40%_40%_30%_30%] shadow-lg flex items-center justify-center relative overflow-hidden"
      >
        {/* Eyes */}
        <div className="flex gap-3 mb-2">
          <motion.div 
            animate={{ scaleY: mood === 'eating' ? [1, 0.1, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="w-2 h-2 bg-healing-text rounded-full" 
          />
          <motion.div 
            animate={{ scaleY: mood === 'eating' ? [1, 0.1, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="w-2 h-2 bg-healing-text rounded-full" 
          />
        </div>
        
        {/* Mouth */}
        <div className="absolute bottom-4">
          {mood === 'happy' && <div className="w-4 h-2 border-b-2 border-healing-text rounded-full" />}
          {mood === 'neutral' && <div className="w-3 h-0.5 bg-healing-text rounded-full" />}
          {mood === 'surprised' && <div className="w-2 h-2 border-2 border-healing-text rounded-full" />}
          {mood === 'eating' && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.3 }} className="w-3 h-3 bg-healing-text rounded-full" />}
        </div>

        {/* Shine */}
        <div className="absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full rotate-[-20deg]" />
      </motion.div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "Chào bạn, mình là TLATD. Hôm nay bạn cảm thấy thế nào? Mình luôn ở đây để lắng nghe bạn.",
      id: 'initial',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMoodBarExpanded, setIsMoodBarExpanded] = useState(true);
  const [resetRotation, setResetRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('general');
  const [dynamicSuggestions, setDynamicSuggestions] = useState<{label: string, icon: string}[]>([]);
  const [lastFedAdvice, setLastFedAdvice] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSuggestionsWindowed, setIsSuggestionsWindowed] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('zen_settings');
    return saved ? JSON.parse(saved) : {
      showRipples: true,
      showPops: true,
      showMouseBubble: true,
      showLiquidBlobs: true,
      autoHideOnInactivity: true,
      showPetSlime: false,
    };
  });
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
    localStorage.setItem('zen_settings', JSON.stringify(settings));
  }, [settings]);
  
  // Zen Clicker Game State
  const [zenEnergy, setZenEnergy] = useState(0);
  const [energyPerClick, setEnergyPerClick] = useState(1);
  const [energyPerSecond, setEnergyPerSecond] = useState(0);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isAdviceListOpen, setIsAdviceListOpen] = useState(false);
  const [savedAdvice, setSavedAdvice] = useState<string[]>(() => {
    const saved = localStorage.getItem('zen_saved_advice');
    return saved ? JSON.parse(saved) : [];
  });
  const dragControls = useDragControls();
  const settingsDragControls = useDragControls();
  const suggestionsDragControls = useDragControls();

  const chatRef = useRef<HTMLDivElement>(null);
  const gameWindowRef = useRef<HTMLDivElement>(null);
  const settingsWindowRef = useRef<HTMLDivElement>(null);
  const suggestionsWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('zen_saved_advice', JSON.stringify(savedAdvice));
  }, [savedAdvice]);

  useEffect(() => {
    const savedEnergy = localStorage.getItem('zen_energy');
    if (savedEnergy) setZenEnergy(parseInt(savedEnergy));
  }, []);

  useEffect(() => {
    localStorage.setItem('zen_energy', zenEnergy.toString());
  }, [zenEnergy]);

  const [upgrades, setUpgrades] = useState([
    { id: 1, name: 'Hơi thở chánh niệm', cost: 5, power: 1, type: 'click', description: '+1 mỗi lần chạm' },
    { id: 2, name: 'Chuông thiền', cost: 20, power: 1, type: 'auto', description: '+1 mỗi giây' },
    { id: 3, name: 'Vườn tĩnh lặng', cost: 100, power: 5, type: 'auto', description: '+5 mỗi giây' },
    { id: 4, name: 'Lời khuyên thông thái', cost: 200, power: 0, type: 'advice', description: 'Nhận một lời khuyên Zen' },
  ]);
  const [zenAdvice, setZenAdvice] = useState<string | null>(null);

  const ZEN_QUOTES = [
    "Hạnh phúc không phải là đích đến, mà là hành trình chúng ta đang đi.",
    "Bình yên đến từ bên trong. Đừng tìm kiếm nó bên ngoài.",
    "Mỗi hơi thở là một cơ hội để bắt đầu lại.",
    "Hãy sống cho hiện tại, vì đó là món quà duy nhất bạn thực sự có.",
    "Tâm trí giống như mặt nước, khi tĩnh lặng, nó sẽ phản chiếu mọi thứ rõ ràng.",
    "Đừng để những đám mây của ngày hôm qua che khuất ánh nắng của ngày hôm nay.",
    "Sự kiên nhẫn là chìa khóa của mọi sự bình an.",
    "Hãy tử tế với chính mình, bạn đang làm rất tốt rồi.",
    "Buông bỏ không phải là mất đi, mà là mở lòng để đón nhận điều mới.",
    "Hoa sen nở trong bùn nhưng không hôi tanh mùi bùn. Bạn cũng vậy."
  ];

  const [isInactive, setIsInactive] = useState(false);
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);

  const resetInactivity = () => {
    setIsInactive(false);
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(() => {
      setIsInactive(true);
    }, 4000); // 4 seconds of inactivity
  };

  useEffect(() => {
    if (isInactive && settingsRef.current.autoHideOnInactivity) {
      // Trigger ripple at mouse position when becoming inactive
      addRipple(mousePos.x, mousePos.y, 300);
    }
  }, [isInactive]);

  useEffect(() => {
    window.addEventListener('mousemove', resetInactivity);
    window.addEventListener('mousedown', resetInactivity);
    window.addEventListener('keydown', resetInactivity);
    window.addEventListener('touchstart', resetInactivity);
    
    resetInactivity();
    
    return () => {
      window.removeEventListener('mousemove', resetInactivity);
      window.removeEventListener('mousedown', resetInactivity);
      window.removeEventListener('keydown', resetInactivity);
      window.removeEventListener('touchstart', resetInactivity);
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    };
  }, []);

  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size?: number }[]>([]);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; width: number; height: number; borderRadius: string; type?: 'default' | 'chat' }[]>([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hoverData, setHoverData] = useState<{ width: number; height: number; borderRadius: string; x: number; y: number; isChat?: boolean } | null>(null);
  const [breathingPhase, setBreathingPhase] = useState<'hít' | 'giữ' | 'thở'>('hít');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathing) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) % 12000;
        if (elapsed < 4000) setBreathingPhase('hít');
        else if (elapsed < 8000) setBreathingPhase('giữ');
        else setBreathingPhase('thở');
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  const addRipple = (x: number, y: number, size: number = 400) => {
    if (!settingsRef.current.showRipples) return;
    const id = Math.random();
    setRipples(prev => {
      // Limit to max 5 concurrent ripples to prevent lag
      const next = prev.length >= 5 ? prev.slice(1) : prev;
      return [...next, { id, x, y, size }];
    });
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 15000);
  };

  useEffect(() => {
    let lastMove = 0;
    const handleGlobalClick = (e: MouseEvent) => {
      // Trigger pop if hovering over an interactive element
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('button, a, input, textarea, [role="button"]') as HTMLElement;
      
      if (interactiveEl) {
        if (!settingsRef.current.showPops) return;
        const rect = interactiveEl.getBoundingClientRect();
        const style = window.getComputedStyle(interactiveEl);
        const id = Date.now();
        const isChat = interactiveEl.tagName === 'TEXTAREA';
        
        setPops(prev => [...prev, {
          id,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width + 20,
          height: rect.height + 20,
          borderRadius: style.borderRadius,
          type: isChat ? 'chat' : 'default'
        }]);
        setTimeout(() => {
          setPops(prev => prev.filter(p => p.id !== id));
        }, isChat ? 800 : 400);
      } else {
        // Only add ripple if not clicking an interactive element
        addRipple(e.clientX, e.clientY, 250);
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMove < 16) return; // ~60fps throttle
      lastMove = now;
      setMousePos({ x: e.clientX, y: e.clientY });

      // Check if hovering over a button or interactive element
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('button, a, input, textarea, [role="button"]') as HTMLElement;
      
      if (interactiveEl) {
        const rect = interactiveEl.getBoundingClientRect();
        const style = window.getComputedStyle(interactiveEl);
        const isChat = interactiveEl.tagName === 'TEXTAREA';
        setHoverData({
          width: rect.width + 20, // Increased padding to be "slightly larger"
          height: rect.height + 20,
          borderRadius: style.borderRadius,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          isChat
        });
      } else {
        setHoverData(null);
      }
    };
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'bot') {
        // Trigger ripple at bot logo position (approximate or find element)
        const botIcons = document.querySelectorAll('.bot-icon-trigger');
        const lastBotIcon = botIcons[botIcons.length - 1];
        if (lastBotIcon) {
          const rect = lastBotIcon.getBoundingClientRect();
          addRipple(rect.left + rect.width / 2, rect.top + rect.height / 2, 300);
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      id: Date.now().toString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Trigger ripple at send button position
    const sendBtn = document.querySelector('.send-button-trigger');
    if (sendBtn) {
      const rect = sendBtn.getBoundingClientRect();
      addRipple(rect.left + rect.width / 2, rect.top + rect.height / 2, 300);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const chatHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model,
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      const botMessage: Message = {
        role: 'bot',
        content: response.text || "Xin lỗi, mình gặp một chút trục trặc. Bạn có thể nói lại được không?",
        id: (Date.now() + 1).toString(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Generate dynamic suggestions based on conversation context using Gemini
      try {
        const suggestionsResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            { 
              role: 'user', 
              parts: [{ 
                text: `Dựa trên cuộc hội thoại sau, hãy đề xuất 4 câu hỏi hoặc chủ đề ngắn gọn (dưới 10 từ) mà người dùng có thể muốn nói tiếp theo để cảm thấy tốt hơn hoặc tiếp tục chia sẻ.
                Hãy trả về kết quả dưới dạng JSON array các object, mỗi object có:
                - label: nội dung gợi ý (tiếng Việt)
                - icon: một trong các từ khóa sau để chọn icon phù hợp: "wind", "sparkles", "heart", "user", "zap", "sun", "sprout", "bot", "smile".

                Cuộc hội thoại:
                Người dùng: ${text}
                Bot: ${botMessage.content}

                Chỉ trả về JSON array, không có văn bản thừa.` 
              }] 
            }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });
        
        const suggestions = JSON.parse(suggestionsResponse.text || "[]");
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          setDynamicSuggestions(suggestions);
        }
      } catch (e) {
        console.error("Suggestions Generation Error:", e);
      }
      
      // Update category based on conversation context using Gemini (keeping for logic consistency if needed elsewhere)
      
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "Mình xin lỗi, hiện tại mình đang không ổn định. Hãy thử lại sau một chút nhé.",
        id: (Date.now() + 1).toString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathingPhase('hít');
    setTimeout(() => setIsBreathing(false), 36000); // 3 cycles of 12s
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Zen Clicker Auto-generation
  useEffect(() => {
    if (energyPerSecond > 0) {
      const interval = setInterval(() => {
        setZenEnergy(prev => prev + energyPerSecond);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [energyPerSecond]);

  const handleZenClick = (e: React.MouseEvent) => {
    setZenEnergy(prev => prev + energyPerClick);
    
    // Visual feedback
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setPops(prev => [...prev, {
      id,
      x: e.clientX,
      y: e.clientY,
      width: 40,
      height: 40,
      borderRadius: '50%',
      type: 'default'
    }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 800);
  };

  const buyUpgrade = (upgrade: typeof upgrades[0]) => {
    if (zenEnergy >= upgrade.cost) {
      setZenEnergy(prev => prev - upgrade.cost);
      
      if (upgrade.type === 'click') {
        setEnergyPerClick(prev => prev + upgrade.power);
      } else if (upgrade.type === 'auto') {
        setEnergyPerSecond(prev => prev + upgrade.power);
      } else if (upgrade.type === 'advice') {
        const randomQuote = ZEN_QUOTES[Math.floor(Math.random() * ZEN_QUOTES.length)];
        setZenAdvice(randomQuote);
        // Special: advice doesn't increase in cost, just gives a new one
        return;
      }
      
      // Increase cost for next level
      setUpgrades(prev => prev.map(u => 
        u.id === upgrade.id ? { ...u, cost: Math.floor(u.cost * 1.3) } : u
      ));
    }
  };

  const saveAdvice = () => {
    if (zenAdvice && !savedAdvice.includes(zenAdvice)) {
      setSavedAdvice(prev => [zenAdvice, ...prev]);
      setLastFedAdvice(zenAdvice);
      // Reset after a short delay so it can be triggered again with same advice if needed
      setTimeout(() => setLastFedAdvice(null), 100);
    }
  };

  const removeSavedAdvice = (index: number) => {
    setSavedAdvice(prev => prev.filter((_, i) => i !== index));
  };

  const renderZenStage = () => {
    const stage = Math.floor(zenEnergy / 10);
    const size = 48 + Math.min(stage * 4, 40); // Grow slightly with each stage
    
    if (stage === 0) return <Dot className="text-healing-accent/20" style={{ width: size, height: size }} />;
    if (stage === 1) return <Leaf className="text-healing-accent" style={{ width: size, height: size }} />;
    if (stage === 2) return (
      <div className="relative" style={{ width: size, height: size }}>
        <Leaf className="text-healing-accent absolute top-0 left-0 rotate-[-20deg]" style={{ width: size/1.2, height: size/1.2 }} />
        <Leaf className="text-healing-accent absolute bottom-0 right-0 rotate-[20deg]" style={{ width: size/1.2, height: size/1.2 }} />
      </div>
    );
    if (stage === 3) return <Sprout className="text-healing-accent" style={{ width: size, height: size }} />;
    if (stage === 4) return <CircleDot className="text-healing-accent" style={{ width: size, height: size }} />;
    if (stage === 5) return <Flower className="text-healing-accent animate-pulse" style={{ width: size, height: size }} />;
    if (stage === 6) return <Flower2 className="text-healing-accent" style={{ width: size, height: size }} />;
    if (stage === 7) return (
      <div className="relative" style={{ width: size, height: size }}>
        <Flower2 className="text-healing-accent absolute top-0 left-0 scale-75" />
        <Flower2 className="text-healing-accent absolute bottom-0 right-0 scale-75" />
        <Flower2 className="text-healing-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    );
    if (stage === 8) return <TreeDeciduous className="text-healing-accent" style={{ width: size, height: size }} />;
    if (stage === 9) return <Trees className="text-healing-accent" style={{ width: size, height: size }} />;
    return <Smile className="text-healing-accent" style={{ width: size, height: size }} />;
  };

  const getSuggestionIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'wind': return <Wind className="w-4 h-4" />;
      case 'sparkles': return <Sparkles className="w-4 h-4" />;
      case 'heart': return <Heart className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'zap': return <Zap className="w-4 h-4" />;
      case 'sun': return <Sun className="w-4 h-4" />;
      case 'sprout': return <Sprout className="w-4 h-4" />;
      case 'bot': return <Bot className="w-4 h-4" />;
      case 'smile': return <Smile className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const renderSuggestions = () => {
    const suggestionsToRender = dynamicSuggestions.length > 0 
      ? dynamicSuggestions 
      : ALL_SUGGESTIONS.filter(s => s.category === currentCategory || s.category === 'general');

    return suggestionsToRender.map((topic, i) => (
      <button
        key={i}
        onClick={() => handleSend(topic.label)}
        className="flex items-center gap-2.5 px-5 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-full text-xs font-bold text-healing-accent hover:bg-healing-accent hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
      >
        {'icon' in topic && typeof topic.icon === 'string' ? getSuggestionIcon(topic.icon) : (topic as any).icon}
        {topic.label}
      </button>
    ));
  };

  const renderWindowSuggestions = () => {
    const suggestionsToRender = dynamicSuggestions.length > 0 
      ? dynamicSuggestions 
      : ALL_SUGGESTIONS.filter(s => s.category === currentCategory || s.category === 'general');

    return suggestionsToRender.map((topic, i) => (
      <button
        key={i}
        onClick={() => handleSend(topic.label)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl text-[11px] font-bold text-healing-accent hover:bg-healing-accent hover:text-white transition-all shadow-sm active:scale-95"
      >
        {'icon' in topic && typeof topic.icon === 'string' ? getSuggestionIcon(topic.icon) : (topic as any).icon}
        {topic.label}
      </button>
    ));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center p-0 sm:p-4">
      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Liquid Background Blobs */}
      {settings.showLiquidBlobs && (
        <div className={cn(
          "absolute inset-0 overflow-hidden -z-10 transition-all duration-1000 ease-in-out",
          ripples.length > 0 
            ? "opacity-100 saturate-150 scale-105 bg-sky-500/5 blur-[20px]" 
            : "opacity-70 saturate-100 scale-100 bg-transparent blur-0",
          (isInactive && settings.autoHideOnInactivity) && "opacity-0 scale-90 pointer-events-none"
        )}>
          <div className="liquid-blob w-[500px] h-[500px] bg-yellow-200/40 top-[-10%] left-[-10%] animate-[blob-float-1_45s_infinite_ease-in-out]" />
          <div className="liquid-blob w-[600px] h-[600px] bg-green-200/40 bottom-[-20%] right-[-10%] animate-[blob-float-2_60s_infinite_ease-in-out]" />
          <div className="liquid-blob w-[400px] h-[400px] bg-lime-200/40 top-[20%] right-[10%] animate-[blob-float-3_40s_infinite_ease-in-out]" />
          <div className="liquid-blob w-[450px] h-[450px] bg-sky-200/30 bottom-[10%] left-[20%] animate-[blob-float-1_55s_infinite_ease-in-out_reverse]" />
          <div className="liquid-blob w-[350px] h-[350px] bg-emerald-200/30 top-[40%] left-[40%] animate-[blob-float-2_50s_infinite_ease-in-out]" />
        </div>
      )}

      {/* Global Ripples Container */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {ripples.map(ripple => (
          <div 
            key={ripple.id}
            className="ripple-effect"
            style={{ 
              left: `${ripple.x}px`, 
              top: `${ripple.y}px`,
              width: `${ripple.size}px`,
              height: `${ripple.size}px`
            }}
          />
        ))}
      </div>

      {/* Mouse Bubble */}
      {settings.showMouseBubble && (
        <div 
          className="mouse-bubble"
          style={{ 
            left: 0,
            top: 0,
            width: hoverData ? `${hoverData.width}px` : '40px',
            height: hoverData ? `${hoverData.height}px` : '40px',
            borderRadius: hoverData ? hoverData.borderRadius : '50%',
            transform: `translate(${ (hoverData ? hoverData.x : mousePos.x) - (hoverData ? hoverData.width / 2 : 20) }px, ${ (hoverData ? hoverData.y : mousePos.y) - (hoverData ? hoverData.height / 2 : 20) }px) scale(${(isInactive && settings.autoHideOnInactivity) ? 0 : (isMouseDown ? (hoverData?.isChat ? 0.98 : 0.8) : 1)})`,
            transition: (isInactive && settings.autoHideOnInactivity) ? 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.5s ease' : undefined,
            opacity: (isInactive && settings.autoHideOnInactivity) ? 0 : (hoverData ? 0.3 : 0.45),
            borderColor: hoverData ? 'rgba(56, 142, 60, 0.9)' : 'rgba(56, 142, 60, 0.45)',
            background: hoverData ? 'rgba(56, 142, 60, 0.05)' : 'radial-gradient(circle, rgba(56, 142, 60, 0.15) 0%, rgba(56, 142, 60, 0.05) 100%)'
          }}
        />
      )}

      {/* Bubble Pops */}
      {pops.map(pop => (
        <div 
          key={pop.id}
          className={cn("bubble-pop", pop.type === 'chat' && "chat")}
          style={{
            left: `${pop.x}px`,
            top: `${pop.y}px`,
            width: `${pop.width}px`,
            height: `${pop.height}px`,
            borderRadius: pop.borderRadius
          }}
        />
      ))}

      <div ref={chatRef} className="flex flex-col h-full w-full max-w-4xl glass-panel overflow-hidden sm:h-[calc(100vh-2rem)] sm:rounded-[40px]">
        {/* Header */}
        <header className="p-6 border-b border-white/20 bg-white/20 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-healing-accent flex items-center justify-center text-white shadow-lg shadow-healing-accent/20 rotate-3">
              <Bot className="w-6 h-6 -rotate-3" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-healing-accent leading-tight tracking-tight">TLATD</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-healing-muted font-bold uppercase tracking-widest">Hơi thở của sự sống</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={cn(
                "p-3 rounded-2xl transition-all active:scale-90",
                isSettingsOpen ? "bg-healing-accent text-white" : "hover:bg-white/40 text-healing-muted"
              )}
              title="Cài đặt hiệu ứng"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsGameOpen(!isGameOpen)}
              className={cn(
                "p-3 rounded-2xl transition-all active:scale-90",
                isGameOpen ? "bg-healing-accent text-white" : "hover:bg-white/40 text-healing-muted"
              )}
              title="Trò chơi Zen Clicker"
            >
              <Gamepad2 className="w-5 h-5" />
            </button>

            <button 
              onClick={toggleFullscreen}
              className="p-3 hover:bg-white/40 rounded-2xl transition-all text-healing-muted active:scale-90"
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => {
                setMessages([messages[0]]);
                setResetRotation(prev => prev - 360);
              }}
              className="p-3 hover:bg-white/40 rounded-2xl transition-all text-healing-muted active:scale-90"
              title="Làm mới cuộc trò chuyện"
            >
            <motion.div
              animate={{ rotate: resetRotation }}
              whileHover={{ 
                rotate: resetRotation - 360,
                transition: { duration: 10, repeat: Infinity, ease: "linear" }
              }}
              transition={{ duration: 0.6, ease: "backOut" }}
            >
              <RefreshCcw className="w-5 h-5" />
            </motion.div>
          </button>
        </div>
      </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {/* Chat Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative"
          >
            <AnimatePresence mode="wait">
              {isMoodBarExpanded ? (
                <motion.div 
                  key="expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-panel p-8 rounded-[32px] mb-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-healing-accent flex items-center gap-3">
                      <div className="p-2 bg-healing-accent/10 rounded-xl">
                        <Heart className="w-6 h-6" />
                      </div>
                      Cảm xúc của bạn hôm nay thế nào?
                    </h3>
                    {messages.length > 1 && (
                      <button 
                        onClick={() => setIsMoodBarExpanded(false)}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                      >
                        <ChevronUp className="w-5 h-5 text-healing-muted" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => {
                          handleSend(`Hôm nay mình cảm thấy ${mood.label.toLowerCase()}`);
                          setIsMoodBarExpanded(false);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-3xl transition-all hover:scale-110 active:scale-95 shadow-sm",
                          mood.color
                        )}
                      >
                        <span className="text-3xl">{mood.emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-center mb-6"
                >
                  <button
                    onClick={() => setIsMoodBarExpanded(true)}
                    className="group flex items-center gap-4 px-8 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-full hover:bg-white/60 transition-all shadow-sm active:scale-95"
                  >
                    <div className="p-2 bg-healing-accent/10 rounded-full group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-healing-accent fill-healing-accent/20" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-healing-accent/60">
                        Hỏi thăm cảm xúc
                      </span>
                      <div className="h-0.5 w-full bg-healing-accent/10 rounded-full mt-1 group-hover:bg-healing-accent/20 transition-colors" />
                    </div>
                    <ChevronDown className="w-5 h-5 text-healing-accent/40 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                    msg.role === 'user' ? "bg-white/50 text-healing-accent" : "bg-healing-accent text-white bot-icon-trigger"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div className={cn(
                    "p-5 rounded-[24px] shadow-sm",
                    msg.role === 'user' 
                      ? "bg-healing-accent text-white rounded-tr-none" 
                      : "bg-white/60 backdrop-blur-sm text-healing-text rounded-tl-none border border-white/40"
                  )}>
                    <div className={cn(
                      "markdown-body prose prose-sm max-w-none",
                      msg.role === 'user' ? "text-white" : "text-healing-text"
                    )}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 mr-auto"
              >
                <div className="w-10 h-10 rounded-2xl bg-healing-accent text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-5 rounded-[24px] rounded-tl-none border border-white/40 shadow-sm flex flex-col gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-healing-accent/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-healing-accent/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-healing-accent/40 rounded-full animate-bounce" />
                  </div>
                  <button 
                    onClick={() => setIsGameOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-healing-accent/10 border border-healing-accent/20 rounded-full text-[10px] font-bold text-healing-accent hover:bg-healing-accent/20 transition-all active:scale-95"
                  >
                    <Gamepad2 className="w-3 h-3" />
                    Chơi Zen Clicker trong lúc chờ?
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggested Topics Overlay */}
          {!isLoading && !isSuggestionsWindowed && (
            <div className="px-6 pb-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-2xl transition-all shadow-sm active:scale-90 flex-shrink-0",
                    showSuggestions ? "bg-healing-accent text-white" : "bg-white/40 text-healing-accent border border-white/40"
                  )}
                  title={showSuggestions ? "Thu gọn gợi ý" : "Hiện gợi ý"}
                >
                  <Plus className={cn("w-6 h-6 transition-transform duration-300", showSuggestions && "rotate-45")} />
                </button>
                
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => {
                        setIsSuggestionsWindowed(true);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/40 text-healing-accent border border-white/40 transition-all shadow-sm active:scale-90 flex-shrink-0"
                      title="Thu nhỏ thành cửa sổ"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {!showSuggestions && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-healing-accent/60">
                    Gợi ý phù hợp
                  </span>
                )}
              </div>

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pt-2"
                  >
                    <div className="flex flex-wrap gap-3 py-1">
                      {renderSuggestions()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Breathing Exercise Overlay */}
          <AnimatePresence>
            {isBreathing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-healing-bg/40 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.8, 1.8, 1],
                    opacity: [0.3, 0.8, 0.8, 0.3],
                  }}
                  transition={{ 
                    duration: 12, 
                    repeat: 2,
                    times: [0, 0.33, 0.66, 1],
                    ease: "easeInOut"
                  }}
                  className="w-40 h-40 bg-healing-accent/20 rounded-full flex items-center justify-center text-healing-accent border-4 border-healing-accent/10 shadow-[0_0_50px_rgba(56,142,60,0.2)]"
                >
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 1.2, 0.8] }}
                    transition={{ duration: 12, repeat: 2, times: [0, 0.33, 0.66, 1] }}
                  >
                    <Wind className="w-16 h-16" />
                  </motion.div>
                </motion.div>
                <motion.h2 
                  key={breathingPhase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-12 text-4xl font-black text-healing-accent tracking-tighter capitalize"
                >
                  {breathingPhase === 'hít' && "Hít vào thật sâu..."}
                  {breathingPhase === 'giữ' && "Nín thở nhẹ nhàng..."}
                  {breathingPhase === 'thở' && "Thở ra từ từ..."}
                </motion.h2>
                <p className="mt-6 text-healing-muted max-w-xs font-bold uppercase text-[10px] tracking-[0.2em]">
                  Hãy tập trung vào hơi thở của bạn. Cảm nhận sự bình yên đang lan tỏa.
                </p>
                <button 
                  onClick={() => setIsBreathing(false)}
                  className="mt-16 px-8 py-3 bg-healing-accent text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-healing-accent/20 active:scale-95 transition-transform"
                >
                  Dừng lại
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer / Input Area */}
        <footer className="p-6 bg-white/20 backdrop-blur-md border-t border-white/20">
          <div className="flex gap-4 items-end">
            <button 
              onClick={startBreathing}
              className="p-4 bg-white/40 text-healing-accent rounded-3xl hover:bg-white/60 transition-all shadow-sm active:scale-90"
              title="Tập hít thở"
            >
              <Wind className="w-7 h-7" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Chia sẻ với TLATD..."
                className="w-full bg-white/40 backdrop-blur-md border border-white/40 rounded-[28px] px-6 py-4 pr-14 focus:outline-none focus:ring-4 focus:ring-healing-accent/10 resize-none min-h-[60px] max-h-40 font-medium text-healing-text placeholder:text-healing-muted/60"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2.5 bottom-2.5 p-3 bg-healing-accent text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-healing-accent/90 transition-all shadow-lg shadow-healing-accent/20 active:scale-90 send-button-trigger"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-[9px] text-healing-muted font-black uppercase tracking-[0.2em] opacity-60">
            <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> Không thay thế tư vấn chuyên môn</span>
            <span className="w-1.5 h-1.5 rounded-full bg-healing-accent/20" />
            <span className="flex items-center gap-1.5"><Heart className="w-3 h-3" /> Luôn đồng hành cùng bạn</span>
          </div>
        </footer>
      </div>

      {/* Zen Clicker Mini-game Panel */}
      <AnimatePresence>
        {isGameOpen && (
          <motion.div
            ref={gameWindowRef}
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            style={{ 
              width: 320, 
              height: 480,
              position: 'fixed',
              bottom: '100px',
              right: '24px',
              zIndex: 100
            }}
            className="glass-panel rounded-[32px] shadow-2xl border-healing-accent/20 flex flex-col overflow-hidden"
          >
            {/* Window Header / Drag Handle */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-between p-4 bg-white/20 border-b border-black/5 cursor-move select-none"
            >
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-healing-accent/60" />
                <div className="flex items-center gap-2">
                  <Flower2 className="w-4 h-4 text-healing-accent" />
                  <h3 className="font-serif font-bold text-base text-healing-accent">Zen Clicker</h3>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsAdviceListOpen(!isAdviceListOpen)}
                  className={cn(
                    "p-1.5 rounded-full transition-colors",
                    isAdviceListOpen ? "bg-healing-accent text-white" : "hover:bg-black/5 text-healing-muted"
                  )}
                  title="Bộ sưu tập lời khuyên"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsGameOpen(false)}
                  className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors group"
                >
                  <X className="w-4 h-4 text-healing-muted group-hover:text-red-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col relative">
              {/* Main Game Content */}
              <div className={cn(
                "flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col transition-all duration-300",
                isAdviceListOpen ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
              )}>
                <div className="bg-white/40 rounded-2xl p-4 mb-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-healing-muted font-bold mb-1">Năng lượng Zen</div>
                  <div className="text-3xl font-bold text-healing-accent flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6 fill-healing-accent" />
                    {zenEnergy}
                  </div>
                  <div className="text-[10px] text-healing-muted mt-1">
                    +{energyPerSecond}/giây • +{energyPerClick}/chạm
                  </div>
                </div>

                <div className="flex justify-center mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleZenClick}
                    className="w-32 h-32 rounded-full bg-healing-accent/10 border-2 border-healing-accent/30 flex items-center justify-center text-healing-accent shadow-inner group overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={Math.floor(zenEnergy / 10)}
                        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 1.5, rotate: 20 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="flex items-center justify-center"
                      >
                        {renderZenStage()}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </div>

                <div className="space-y-2 mb-4">
                  {upgrades.map(upgrade => (
                    <button
                      key={upgrade.id}
                      onClick={() => buyUpgrade(upgrade)}
                      disabled={zenEnergy < upgrade.cost}
                      className={cn(
                        "w-full p-3 rounded-xl border transition-all text-left flex items-center justify-between group",
                        zenEnergy >= upgrade.cost 
                          ? "bg-white/60 border-healing-accent/20 hover:border-healing-accent/50" 
                          : "bg-black/5 border-transparent opacity-60 grayscale cursor-not-allowed"
                      )}
                    >
                      <div>
                        <div className="text-xs font-bold text-healing-accent">{upgrade.name}</div>
                        <div className="text-[9px] text-healing-muted">{upgrade.description}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs font-bold text-healing-accent flex items-center gap-0.5">
                          <Zap className="w-3 h-3 fill-healing-accent" />
                          {upgrade.cost}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-auto pt-3 border-t border-black/5 text-center">
                  <AnimatePresence mode="wait">
                    {zenAdvice ? (
                      <motion.div
                        key={zenAdvice}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-healing-accent/5 p-3 rounded-xl border border-healing-accent/10 mb-2"
                      >
                        <p className="text-[10px] text-healing-accent font-medium leading-relaxed mb-2">
                          "{zenAdvice}"
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={saveAdvice}
                            className="flex items-center gap-1 px-2 py-1 bg-healing-accent text-white rounded-full text-[8px] font-bold uppercase tracking-widest hover:bg-healing-accent/90 transition-colors"
                          >
                            <Bookmark className="w-2 h-2" />
                            Lưu
                          </button>
                          <button 
                            onClick={() => setZenAdvice(null)}
                            className="text-[8px] uppercase tracking-widest text-healing-muted hover:text-healing-accent transition-colors"
                          >
                            Đóng
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-[9px] text-healing-muted italic mb-2">
                        "Chạm nhẹ nhàng để tích tụ bình an..."
                      </p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Saved Advice List Overlay */}
              <AnimatePresence>
                {isAdviceListOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute inset-0 bg-white/80 backdrop-blur-md p-5 flex flex-col z-10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-serif font-bold text-healing-accent flex items-center gap-2">
                        <Bookmark className="w-4 h-4" />
                        Bộ sưu tập lời khuyên
                      </h4>
                      <button 
                        onClick={() => setIsAdviceListOpen(false)}
                        className="p-1 hover:bg-black/5 rounded-full"
                      >
                        <X className="w-4 h-4 text-healing-muted" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                      {savedAdvice.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                          <Bookmark className="w-12 h-12 mb-3 text-healing-muted" />
                          <p className="text-xs italic text-healing-muted">Chưa có lời khuyên nào được lưu...</p>
                        </div>
                      ) : (
                        savedAdvice.map((advice, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-white/60 border border-healing-accent/10 rounded-xl relative group"
                          >
                            <p className="text-[10px] text-healing-text leading-relaxed pr-6 italic">
                              "{advice}"
                            </p>
                            <button 
                              onClick={() => removeSavedAdvice(idx)}
                              className="absolute top-2 right-2 p-1 text-healing-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Mini-window Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            ref={settingsWindowRef}
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            drag
            dragControls={settingsDragControls}
            dragListener={false}
            dragMomentum={false}
            style={{ 
              width: 300, 
              height: 'auto',
              position: 'fixed',
              top: '100px',
              right: '24px',
              zIndex: 110
            }}
            className="glass-panel rounded-[32px] shadow-2xl border-healing-accent/20 flex flex-col overflow-hidden"
          >
            {/* Window Header / Drag Handle */}
            <div 
              onPointerDown={(e) => settingsDragControls.start(e)}
              className="flex items-center justify-between p-4 bg-white/20 border-b border-black/5 cursor-move select-none"
            >
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-healing-accent/60" />
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-healing-accent" />
                  <h3 className="font-serif font-bold text-base text-healing-accent">Cài đặt</h3>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors group"
              >
                <X className="w-4 h-4 text-healing-muted group-hover:text-red-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-healing-muted/60">Hiệu ứng hình ảnh</h3>
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-medium text-healing-text group-hover:text-healing-accent transition-colors">Sóng nước (Ripples)</span>
                  <input 
                    type="checkbox" 
                    checked={settings.showRipples}
                    onChange={(e) => setSettings({...settings, showRipples: e.target.checked})}
                    className="w-4 h-4 accent-healing-accent rounded-lg"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-medium text-healing-text group-hover:text-healing-accent transition-colors">Bong bóng tương tác (Pops)</span>
                  <input 
                    type="checkbox" 
                    checked={settings.showPops}
                    onChange={(e) => setSettings({...settings, showPops: e.target.checked})}
                    className="w-4 h-4 accent-healing-accent rounded-lg"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-medium text-healing-text group-hover:text-healing-accent transition-colors">Bong bóng theo chuột</span>
                  <input 
                    type="checkbox" 
                    checked={settings.showMouseBubble}
                    onChange={(e) => setSettings({...settings, showMouseBubble: e.target.checked})}
                    className="w-4 h-4 accent-healing-accent rounded-lg"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-medium text-healing-text group-hover:text-healing-accent transition-colors">Khối màu nền động</span>
                  <input 
                    type="checkbox" 
                    checked={settings.showLiquidBlobs}
                    onChange={(e) => setSettings({...settings, showLiquidBlobs: e.target.checked})}
                    className="w-4 h-4 accent-healing-accent rounded-lg"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-medium text-healing-text group-hover:text-healing-accent transition-colors text-healing-accent font-bold">Thú ảo Slime</span>
                  <input 
                    type="checkbox" 
                    checked={settings.showPetSlime}
                    onChange={(e) => setSettings({...settings, showPetSlime: e.target.checked})}
                    className="w-5 h-5 accent-healing-accent rounded-lg shadow-sm"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-black/5">
                <button 
                  onClick={() => setSettings({
                    showRipples: true,
                    showPops: true,
                    showMouseBubble: true,
                    showLiquidBlobs: true,
                    autoHideOnInactivity: true,
                  })}
                  className="w-full py-2.5 bg-healing-accent/10 text-healing-accent text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-healing-accent/20 transition-all"
                >
                  Khôi phục mặc định
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Topics Mini-window Panel */}
      <AnimatePresence>
        {isSuggestionsWindowed && (
          <motion.div
            ref={suggestionsWindowRef}
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            drag
            dragControls={suggestionsDragControls}
            dragListener={false}
            dragMomentum={false}
            style={{ 
              width: 320, 
              height: 'auto',
              position: 'fixed',
              bottom: '160px',
              left: '24px',
              zIndex: 105
            }}
            className="glass-panel rounded-[32px] shadow-2xl border-healing-accent/20 flex flex-col overflow-hidden"
          >
            {/* Window Header / Drag Handle */}
            <div 
              onPointerDown={(e) => suggestionsDragControls.start(e)}
              className="flex items-center justify-between p-4 bg-white/20 border-b border-black/5 cursor-move select-none"
            >
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-healing-accent/60" />
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-healing-accent rotate-45" />
                  <h3 className="font-serif font-bold text-base text-healing-accent">Gợi ý</h3>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsSuggestionsWindowed(false);
                  setShowSuggestions(false);
                }}
                className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors group"
              >
                <X className="w-4 h-4 text-healing-muted group-hover:text-red-500" />
              </button>
            </div>

            <div className="p-5 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-2">
                {renderWindowSuggestions()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PetSlime 
        show={settings.showPetSlime} 
        windowRefs={[chatRef, gameWindowRef, settingsWindowRef, suggestionsWindowRef]} 
        lastFedAdvice={lastFedAdvice}
      />
    </div>
  );
}
