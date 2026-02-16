
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Briefcase, Smile, DollarSign, Activity, Compass, 
  Sparkles, History, PlusCircle, ChevronRight, ArrowLeft, 
  Share2, Trash2, Download, BookOpen, Shuffle, Plus, Settings,
  Camera, Coffee, Moon, Sun, Book, Shield, Zap, Image as ImageIcon,
  User, MessageCircle, Star, Music, Target, Palette, Twitter, Mail, Copy, Link as LinkIcon, Code, Smartphone,
  TreePine, Flame, Cloud, Anchor, PenTool, Globe, Gift, Award, HelpCircle, ExternalLink, Server, RefreshCw
} from 'lucide-react';
import { Category, ReflectionResponse, HistoryItem, CustomCategory } from './types';
import { generateReflectionStream, generateRandomReflection } from './services/geminiService';

/**
 * Biblioteca de ícones disponíveis para categorias.
 */
const ICON_LIBRARY = {
  Sparkles, Heart, Briefcase, Smile, DollarSign, Activity, Compass, 
  Camera, Coffee, Moon, Sun, Book, Shield, Zap, User, MessageCircle, 
  Star, Music, Target, TreePine, Flame, Cloud, Anchor, PenTool, Globe, Gift, Award, HelpCircle
};

const DEFAULT_CATEGORIES = [
  { id: Category.RELATIONSHIPS, icon: Heart, color: 'bg-rose-100 text-rose-600' },
  { id: Category.CAREER, icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
  { id: Category.EMOTIONAL, icon: Smile, color: 'bg-amber-100 text-amber-600' },
  { id: Category.FINANCE, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
  { id: Category.HEALTH, icon: Activity, color: 'bg-cyan-100 text-cyan-600' },
  { id: Category.SPIRITUALITY, icon: Compass, color: 'bg-violet-100 text-violet-600' },
];

type Theme = 'light' | 'dark' | 'sepia';

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'input' | 'result' | 'history' | 'journal' | 'manage_cats'>('home');
  const [theme, setTheme] = useState<Theme>('light');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState<string>('Sparkles');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<ReflectionResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryItem, setActiveHistoryItem] = useState<HistoryItem | null>(null);
  const [journalNote, setJournalNote] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<number | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('reflexo_history');
    const savedCustomCats = localStorage.getItem('reflexo_custom_cats');
    const savedTheme = localStorage.getItem('reflexo_theme') as Theme;
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedCustomCats) setCustomCategories(JSON.parse(savedCustomCats));
    if (savedTheme) setTheme(savedTheme);

    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('s');
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
        setResult(decoded);
        setView('result');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Erro ao decodificar link compartilhado", e);
      }
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const saveToHistory = (res: ReflectionResponse, cat: string, ctx: string, note?: string) => {
    const newItem: HistoryItem = {
      ...res,
      id: Date.now().toString(),
      category: cat,
      context: ctx,
      timestamp: Date.now(),
      journalEntry: note
    };
    const updatedHistory = [newItem, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('reflexo_history', JSON.stringify(updatedHistory));
    return newItem.id;
  };

  const updateJournalForHistoryItem = (id: string, note: string) => {
    const updated = history.map(item => item.id === id ? { ...item, journalEntry: note } : item);
    setHistory(updated);
    localStorage.setItem('reflexo_history', JSON.stringify(updated));
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('reflexo_theme', newTheme);
  };

  const addCustomCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = { id: Date.now().toString(), name: newCatName.trim(), icon: newCatIcon };
    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    localStorage.setItem('reflexo_custom_cats', JSON.stringify(updated));
    setNewCatName('');
    setNewCatIcon('Sparkles');
  };

  const removeCustomCategory = (id: string) => {
    const updated = customCategories.filter(c => c.id !== id);
    setCustomCategories(updated);
    localStorage.setItem('reflexo_custom_cats', JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewCatIcon(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRandomReflection = async () => {
    setLoading(true);
    setLoadingStep('Conectando ao servidor...');
    setView('result');
    try {
      setTimeout(() => setLoadingStep('Buscando sabedoria aleatória...'), 800);
      const res = await generateRandomReflection();
      setResult(res);
      const id = saveToHistory(res, "Aleatório", "Conselho rápido do dia");
      setActiveHistoryItem({ ...res, id, category: "Aleatório", context: "Conselho rápido do dia", timestamp: Date.now() });
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar com o servidor.");
      setView('home');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReflection = async () => {
    if (!selectedCategory || !context.trim()) return;
    setLoading(true);
    setLoadingStep('Estabelecendo conexão segura...');
    setView('result');
    try {
      setTimeout(() => setLoadingStep('Analisando seu contexto...'), 1000);
      setTimeout(() => setLoadingStep('Gerando reflexão personalizada...'), 2500);
      
      const reflection = await generateReflectionStream(selectedCategory, context, (chunk) => {
        // Opcionalmente poderíamos atualizar uma prévia aqui se usássemos streaming real de texto
      });
      
      setResult(reflection);
      const id = saveToHistory(reflection, selectedCategory, context);
      setActiveHistoryItem({ ...reflection, id, category: selectedCategory, context, timestamp: Date.now() });
    } catch (error: any) {
      console.error(error);
      const msg = error.status === 429 ? "Muitas requisições. Tente novamente em instantes." : "Erro no servidor. Verifique sua conexão.";
      alert(msg);
      setView('input');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setContext('');
    setSelectedCategory(null);
    setResult(null);
    setActiveHistoryItem(null);
    setJournalNote('');
    setView('home');
  };

  const renderIcon = (icon: string, className: string = "size-6") => {
    if (icon.startsWith('data:image')) {
      return <img src={icon} alt="Icon" className={`${className} object-cover rounded-md`} />;
    }
    const IconComponent = (ICON_LIBRARY as any)[icon] || Sparkles;
    return <IconComponent className={className} />;
  };

  // --- Lógica de Tooltip (Long Press) ---
  const startTooltipTimer = (text: string, x: number, y: number) => {
    longPressTimer.current = window.setTimeout(() => {
      setTooltip({ text, x, y });
    }, 500);
  };

  const clearTooltip = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setTooltip(null);
  };

  const handleTouchStart = (e: React.TouchEvent, text: string) => {
    const touch = e.touches[0];
    startTooltipTimer(text, touch.clientX, touch.clientY - 40);
  };

  const handleMouseDown = (e: React.MouseEvent, text: string) => {
    startTooltipTimer(text, e.clientX, e.clientY - 40);
  };

  // --- Funções de Compartilhamento ---
  const getShareText = () => {
    if (!result) return '';
    return `🧘‍♂️ *Reflexo do Dia*\n\n"${result.reflection}"\n\n💡 *Conselho:* ${result.advice}\n\n✨ *Afirmação:* ${result.affirmation}\n\n📜 "${result.quote.text}" — ${result.quote.author}`;
  };

  const generateShareableLink = () => {
    if (!result) return '';
    const minimalData = {
      reflection: result.reflection,
      advice: result.advice,
      affirmation: result.affirmation,
      quote: result.quote
    };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(minimalData))));
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('s', base64);
    return url.toString();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getShareText() + `\n\n🔗 Veja no App: ${generateShareableLink()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${result?.reflection}"\n\n#ReflexoAI #BemEstar\n${generateShareableLink()}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Uma reflexão especial para o seu dia');
    const body = encodeURIComponent(getShareText() + `\n\nLink direto da reflexão: ${generateShareableLink()}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleCopyLinkText = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    alert("Texto da reflexão copiado para a área de transferência!");
  };

  const handleCopyShareableLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    alert("Link da URL copiado! Agora você pode compartilhar este link.");
  };

  const handleCopyHtmlLink = () => {
    const link = generateShareableLink();
    const htmlSnippet = `<a href="${link}" target="_blank" style="color: #4f46e5; font-weight: bold;">Minha Reflexão Diária</a>`;
    navigator.clipboard.writeText(htmlSnippet);
    alert("Link HTML copiado!");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Reflexão - Reflexo App',
          text: getShareText(),
          url: generateShareableLink()
        });
      } catch (err) {
        console.error("Erro no compartilhamento nativo:", err);
      }
    } else {
      handleCopyShareableLink();
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("Para instalar, use a opção 'Adicionar à tela inicial' no menu do seu navegador.");
    }
  };

  const themeClasses = {
    light: { bg: 'bg-slate-50', text: 'text-slate-800', textMuted: 'text-slate-500', card: 'bg-white/70 border-white/30', input: 'bg-white ring-slate-200', header: 'bg-slate-50/80', nav: 'bg-white/90 border-slate-100' },
    dark: { bg: 'bg-slate-950', text: 'text-slate-100', textMuted: 'text-slate-400', card: 'bg-slate-900/70 border-slate-800/50', input: 'bg-slate-900 ring-slate-800 text-slate-100', header: 'bg-slate-950/80', nav: 'bg-slate-900/90 border-slate-800' },
    sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]', textMuted: 'text-[#8c7462]', card: 'bg-[#faf6e9]/70 border-[#e8dfc4]/50', input: 'bg-[#faf6e9] ring-[#e8dfc4] text-[#5b4636]', header: 'bg-[#f4ecd8]/80', nav: 'bg-[#faf6e9]/90 border-[#e8dfc4]' }
  }[theme];

  return (
    <div className={`max-w-md mx-auto min-h-screen ${themeClasses.bg} shadow-2xl relative overflow-hidden flex flex-col pb-24 transition-colors duration-300`}>
      {/* --- RENDERIZAÇÃO DO TOOLTIP --- */}
      {tooltip && (
        <div 
          className="fixed z-[100] px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg pointer-events-none transform -translate-x-1/2 shadow-xl animate-fade-in whitespace-nowrap"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}

      <header className={`p-6 flex justify-between items-center z-10 sticky top-0 ${themeClasses.header} backdrop-blur-md`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetFlow}>
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <h1 className={`text-xl font-bold ${themeClasses.text} font-serif`}>Reflexo</h1>
        </div>
        <div className="flex gap-2">
          {deferredPrompt && (
            <button onClick={handleInstallApp} className="p-2 text-indigo-600 bg-indigo-50 rounded-full animate-pulse">
              <Smartphone size={20} />
            </button>
          )}
          <button onClick={handleRandomReflection} className={`p-2 ${themeClasses.textMuted} hover:bg-slate-500/10 rounded-full transition-colors`} title="Reflexão Aleatória">
            <Shuffle size={20} />
          </button>
          <button onClick={() => setView('manage_cats')} className={`p-2 ${themeClasses.textMuted} hover:bg-slate-500/10 rounded-full transition-colors`} title="Configurações">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 z-10 overflow-y-auto">
        {view === 'home' && (
          <div className="animate-fade-in">
            <h2 className={`text-3xl font-serif font-bold ${themeClasses.text} mt-4 mb-2`}>Qual sua intenção hoje?</h2>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => { setSelectedCategory(cat.id); setView('input'); }} 
                  className={`flex flex-col items-center justify-center p-5 rounded-3xl transition-all border ${themeClasses.card} hover:scale-[1.02] hover:shadow-md`}
                >
                  <div className={`${cat.color} p-3 rounded-2xl mb-2`}><cat.icon size={24} /></div>
                  <span className={`text-xs font-semibold ${themeClasses.text} text-center`}>{cat.id}</span>
                </button>
              ))}
              {customCategories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => { setSelectedCategory(cat.name); setView('input'); }} 
                  className={`flex flex-col items-center justify-center p-5 rounded-3xl transition-all border ${themeClasses.card} hover:scale-[1.02] hover:shadow-md relative`}
                  onTouchStart={(e) => handleTouchStart(e, cat.name)}
                  onTouchEnd={clearTooltip}
                  onMouseDown={(e) => handleMouseDown(e, cat.name)}
                  onMouseUp={clearTooltip}
                  onMouseLeave={clearTooltip}
                >
                  <div className="bg-slate-100 text-slate-500 p-3 rounded-2xl mb-2">{renderIcon(cat.icon, "size-8")}</div>
                  <span className={`text-xs font-semibold ${themeClasses.text} text-center truncate w-full px-2`}>{cat.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setView('manage_cats')} className={`w-full mt-6 flex items-center justify-center gap-2 py-4 border-2 border-dashed ${theme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-indigo-200 text-indigo-400'} rounded-2xl font-bold hover:bg-indigo-500/5 transition-all`}>
              <Plus size={18} /> Criar Nova Categoria
            </button>
          </div>
        )}

        {view === 'manage_cats' && (
          <div className="animate-fade-in">
            <button onClick={() => setView('home')} className={`flex items-center gap-1 ${themeClasses.textMuted} mb-6`}><ArrowLeft size={18} /> Voltar</button>
            
            <div className={`p-6 rounded-[2rem] border ${themeClasses.card} mb-6`}>
              <h3 className={`text-sm font-bold ${themeClasses.textMuted} uppercase mb-4`}>Tema Visual</h3>
              <div className="flex gap-3">
                {(['light', 'dark', 'sepia'] as Theme[]).map((t) => (
                  <button key={t} onClick={() => changeTheme(t)} className={`flex-1 p-3 rounded-2xl border-2 transition-all ${theme === t ? 'border-indigo-600 bg-indigo-50/10' : 'border-transparent'}`}>
                    <div className={`size-8 mx-auto rounded-full shadow-inner ${t === 'light' ? 'bg-slate-100' : t === 'dark' ? 'bg-slate-900' : 'bg-[#f4ecd8]'}`}></div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-[2rem] border ${themeClasses.card} mb-8 shadow-sm`}>
              <h3 className={`text-sm font-bold ${themeClasses.textMuted} uppercase mb-4`}>Nova Categoria</h3>
              <div className="flex flex-col items-center mb-6">
                <div className={`size-20 rounded-3xl flex items-center justify-center mb-2 shadow-lg ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'} border-2 border-indigo-200`}>
                  {renderIcon(newCatIcon, "size-10 text-indigo-600")}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${themeClasses.textMuted}`}>{newCatName || 'Prévia'}</span>
              </div>

              <input 
                type="text" 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)} 
                placeholder="Ex: Paternidade, Meditação..." 
                className={`w-full p-4 rounded-2xl mb-6 shadow-inner border-none ${themeClasses.input} focus:ring-2 focus:ring-indigo-300 transition-all`} 
              />
              
              <div className="mb-6">
                <h4 className={`text-[10px] font-bold ${themeClasses.textMuted} mb-3 uppercase tracking-widest`}>Biblioteca de Ícones</h4>
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 custom-scrollbar border rounded-2xl bg-black/5">
                  {Object.keys(ICON_LIBRARY).map((iconKey) => (
                    <button
                      key={iconKey}
                      onClick={() => setNewCatIcon(iconKey)}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all ${newCatIcon === iconKey ? 'bg-indigo-600 text-white scale-110 shadow-md' : 'bg-white/50 text-slate-400 hover:bg-white hover:text-indigo-400'}`}
                      title={iconKey}
                    >
                      {renderIcon(iconKey, "size-6")}
                    </button>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-xl flex items-center justify-center transition-all border-2 border-dashed ${newCatIcon.startsWith('data:image') ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-400'}`}>
                    <ImageIcon size={24} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>

              <button onClick={addCustomCategory} disabled={!newCatName.trim()} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors">Criar Categoria</button>
            </div>

            <div className="space-y-3 pb-10">
              <h3 className={`text-xs font-bold ${themeClasses.textMuted} uppercase mb-4 px-2`}>Categorias Criadas</h3>
              {customCategories.map(cat => (
                <div key={cat.id} className={`flex justify-between items-center p-4 border rounded-2xl shadow-sm ${themeClasses.card} animate-fade-in`}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 overflow-hidden cursor-help"
                      onTouchStart={(e) => handleTouchStart(e, cat.name)}
                      onTouchEnd={clearTooltip}
                      onMouseDown={(e) => handleMouseDown(e, cat.name)}
                      onMouseUp={clearTooltip}
                      onMouseLeave={clearTooltip}
                    >
                      {renderIcon(cat.icon, "size-6")}
                    </div>
                    <span className={`font-semibold ${themeClasses.text} truncate max-w-[180px]`}>{cat.name}</span>
                  </div>
                  <button onClick={() => removeCustomCategory(cat.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-full transition-colors"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'input' && (
          <div className="animate-fade-in">
            <button onClick={() => setView('home')} className={`flex items-center gap-1 ${themeClasses.textMuted} mb-6`}><ArrowLeft size={18} /> Voltar</button>
            <h2 className={`text-2xl font-serif font-bold ${themeClasses.text} mb-4`}>{selectedCategory}</h2>
            <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Descreva brevemente o que está acontecendo ou como você se sente..." className={`w-full h-48 p-5 rounded-3xl resize-none shadow-inner border-none focus:ring-2 focus:ring-indigo-400 transition-all ${themeClasses.input}`}></textarea>
            <button onClick={handleStartReflection} disabled={!context.trim()} className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-3xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">Receber Reflexão <ChevronRight size={20} /></button>
          </div>
        )}

        {view === 'result' && (
          <div className="animate-fade-in pb-10">
            {loading ? (
              <div className="py-24 text-center">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Server size={24} className="text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <h3 className={`text-xl font-serif mb-2 ${themeClasses.text}`}>{loadingStep}</h3>
                <p className={`text-xs uppercase tracking-tighter opacity-50 ${themeClasses.text}`}>Conexão redundante ativa</p>
              </div>
            ) : result && (
              <div className="space-y-6">
                <div className={`rounded-[2.2rem] p-8 border shadow-lg ${themeClasses.card} transition-colors`}>
                  <p className={`italic text-lg font-serif mb-6 leading-relaxed ${themeClasses.text}`}>"{result.reflection}"</p>
                  <p className={`p-4 rounded-2xl mb-6 text-sm leading-relaxed ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} ${themeClasses.text}`}>{result.advice}</p>
                  <p className="text-indigo-500 font-bold mb-6 text-center text-sm bg-indigo-500/10 py-2 rounded-xl">✨ {result.affirmation}</p>
                  <div className="text-center pt-4 border-t border-slate-500/10">
                    <p className={`text-xs italic ${themeClasses.textMuted}`}>"{result.quote.text}"</p>
                    <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${themeClasses.textMuted}`}>— {result.quote.author}</p>
                  </div>
                </div>

                {/* --- SEÇÃO DE COMPARTILHAMENTO --- */}
                <div className={`p-6 rounded-[2.2rem] border shadow-md ${themeClasses.card}`}>
                  <h4 className={`text-[10px] font-bold ${themeClasses.textMuted} uppercase mb-4 flex items-center gap-2`}><Share2 size={12}/> Compartilhar Insight</h4>
                  
                  {/* Botões de Redes Sociais */}
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    <button onClick={handleWhatsAppShare} className="flex flex-col items-center gap-1.5 group">
                      <div className="p-3 bg-green-500 text-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><MessageCircle size={20}/></div>
                      <span className="text-[8px] font-bold opacity-70 uppercase">WhatsApp</span>
                    </button>
                    <button onClick={handleTwitterShare} className="flex flex-col items-center gap-1.5 group">
                      <div className="p-3 bg-sky-500 text-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Twitter size={20}/></div>
                      <span className="text-[8px] font-bold opacity-70 uppercase">Twitter</span>
                    </button>
                    <button onClick={handleEmailShare} className="flex flex-col items-center gap-1.5 group">
                      <div className="p-3 bg-slate-500 text-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Mail size={20}/></div>
                      <span className="text-[8px] font-bold opacity-70 uppercase">E-mail</span>
                    </button>
                    <button onClick={handleCopyShareableLink} className="flex flex-col items-center gap-1.5 group">
                      <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><LinkIcon size={20}/></div>
                      <span className="text-[8px] font-bold opacity-70 uppercase">URL Link</span>
                    </button>
                    <button onClick={handleCopyLinkText} className="flex flex-col items-center gap-1.5 group">
                      <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Copy size={20}/></div>
                      <span className="text-[8px] font-bold opacity-70 uppercase">Texto</span>
                    </button>
                  </div>

                  {/* Botão de Link HTML e Mais Opções */}
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCopyHtmlLink} 
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed ${themeClasses.textMuted} text-[10px] font-bold uppercase hover:bg-slate-500/5 transition-all`}
                    >
                      <Code size={14}/> Copiar HTML
                    </button>
                    <button 
                      onClick={handleNativeShare} 
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-bold uppercase hover:bg-indigo-700 transition-all shadow-md"
                    >
                      <ExternalLink size={14}/> Mais Opções
                    </button>
                  </div>
                </div>

                <div className={`p-6 rounded-[2.2rem] border shadow-inner ${themeClasses.card}`}>
                  <h4 className="text-xs font-bold text-indigo-500 mb-3 flex items-center gap-2"><BookOpen size={16}/> Diário de Reflexão</h4>
                  <textarea value={journalNote} onChange={(e) => { setJournalNote(e.target.value); if (activeHistoryItem) updateJournalForHistoryItem(activeHistoryItem.id, e.target.value); }} placeholder="Como você se sente após essa reflexão? Escreva aqui..." className={`w-full h-32 bg-transparent border-none text-sm resize-none focus:ring-0 ${themeClasses.text}`}></textarea>
                </div>
                
                <button onClick={resetFlow} className={`w-full py-5 rounded-2xl font-bold border transition-all hover:bg-indigo-50/50 ${themeClasses.card} ${themeClasses.text} shadow-sm`}>Iniciar Nova Reflexão</button>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="animate-fade-in pb-10">
            <h2 className={`text-2xl font-serif font-bold ${themeClasses.text} mb-6`}>Sua Jornada</h2>
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} onClick={() => { setActiveHistoryItem(item); setJournalNote(item.journalEntry || ''); setView('result'); setResult(item); }} className={`p-4 border rounded-2xl cursor-pointer hover:shadow-md transition-all ${themeClasses.card}`}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase px-2 py-0.5 bg-indigo-500/10 rounded-md">{item.category}</span>
                    <span className={`text-[10px] ${themeClasses.textMuted} font-medium`}>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-xs italic line-clamp-2 leading-relaxed ${themeClasses.text}`}>"{item.reflection}"</p>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-20 opacity-40">
                  <History size={48} className="mx-auto mb-4" />
                  <p className={themeClasses.text}>Seu histórico de sabedoria aparecerá aqui.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'journal' && (
          <div className="animate-fade-in pb-10">
            <h2 className={`text-2xl font-serif font-bold ${themeClasses.text} mb-6`}>Notas do Diário</h2>
            <div className="space-y-4">
              {history.filter(h => h.journalEntry).map(item => (
                <div key={item.id} className={`p-6 border rounded-[2rem] shadow-sm ${themeClasses.card}`}>
                   <div className="flex justify-between items-center mb-4">
                     <p className={`text-xs font-bold uppercase tracking-widest ${themeClasses.textMuted}`}>{new Date(item.timestamp).toLocaleDateString()}</p>
                     <span className="text-[10px] px-2 py-1 bg-slate-500/10 rounded-full">{item.category}</span>
                   </div>
                   <p className={`text-sm italic leading-relaxed border-l-4 border-indigo-200 pl-4 ${themeClasses.text}`}>"{item.journalEntry}"</p>
                </div>
              ))}
              {history.filter(h => h.journalEntry).length === 0 && (
                <div className="text-center py-20 opacity-40">
                  <BookOpen size={48} className="mx-auto mb-4" />
                  <p className={themeClasses.text}>Suas anotações introspectivas aparecerão aqui.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t px-8 pt-4 pb-[calc(1rem+var(--safe-area-inset-bottom))] flex justify-around items-center z-50 ${themeClasses.nav} backdrop-blur-md`}>
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'home' ? 'text-indigo-500 scale-105' : 'text-slate-500'}`}>
          <Compass size={24} className={view === 'home' ? 'animate-active-bounce' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Início</span>
        </button>
        <button onClick={() => setView('journal')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'journal' ? 'text-indigo-500 scale-105' : 'text-slate-500'}`}>
          <BookOpen size={24} className={view === 'journal' ? 'animate-active-bounce' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Notas</span>
        </button>
        <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'history' ? 'text-indigo-500 scale-105' : 'text-slate-500'}`}>
          <History size={24} className={view === 'history' ? 'animate-active-bounce' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Jornada</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
