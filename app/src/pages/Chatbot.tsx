import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, Timestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { analyzeMaizeLeaf, getAI } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Loader2, Bot, User as UserIcon, Plus, Menu, X, Trash2, Mic, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid'; // need uuid for temp ids

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  createdAt: number;
  isPrediction?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function Chatbot() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat sessions
  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      const q = query(collection(db, `users/${user.uid}/chats`), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const s = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession));
      setSessions(s);
      if (s.length > 0 && !currentSessionId) {
        setCurrentSessionId(s[0].id);
      }
    };
    fetchSessions();
  }, [user]);

  // Load messages for current session
  useEffect(() => {
    if (!user || !currentSessionId) return;
    const loadMessages = async () => {
      const docRef = doc(db, `users/${user.uid}/chats/${currentSessionId}`);
      const d = await getDoc(docRef);
      if (d.exists() && d.data().messages) {
        setMessages(d.data().messages);
      } else {
        setMessages([{
          id: Date.now().toString(),
          role: 'model',
          text: "Hi! I'm Maize Guard AI. You can ask me questions about maize farming, or upload a leaf photo, and I'll analyze it for diseases.",
          createdAt: Date.now()
        }]);
      }
    };
    loadMessages();
  }, [user, currentSessionId]);

  const saveCurrentSession = async (updatedMessages: Message[], titleUpdate?: string) => {
    if (!user || !currentSessionId) return;
    const docRef = doc(db, `users/${user.uid}/chats/${currentSessionId}`);
    
    // Determine title if not given
    let sessionTitle = titleUpdate || sessions.find(s => s.id === currentSessionId)?.title || "Agriculture Chat";
    if (updatedMessages.length === 2 && updatedMessages[1].role === 'user') { // Auto-name after first user msg
       sessionTitle = updatedMessages[1].text.substring(0, 30) + (updatedMessages[1].text.length > 30 ? "..." : "");
       setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: sessionTitle } : s));
    }

    try {
      await setDoc(docRef, {
        userId: user.uid,
        title: sessionTitle,
        createdAt: sessions.find(s => s.id === currentSessionId)?.createdAt || Date.now(),
        updatedAt: Date.now(),
        messages: updatedMessages
      }, { merge: true });
    } catch(err) {
      console.error("Error saving session", err);
    }
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = { id: newId, title: "New Chat", createdAt: Date.now() };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newId);
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: "Hi! I'm Maize Guard AI. Ready to help protect your crops. What can I do for you today?",
      createdAt: Date.now()
    }]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() && !inputMessage.trim()) return;
    const finalMsg = text.trim() || inputMessage.trim();
    setInputMessage('');
    
    // Create new chat context if none exists
    let seshId = currentSessionId;
    if (!seshId) {
      seshId = Date.now().toString();
      const newSession: ChatSession = { id: seshId, title: "New Chat", createdAt: Date.now() };
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(seshId);
    }

    const newMsg: Message = { id: Date.now().toString(), role: 'user', text: finalMsg, createdAt: Date.now() };
    const curMsgs = [...messages, newMsg];
    setMessages(curMsgs);
    setIsTyping(true);

    try {
      // Build chat history for gemini
      const history = curMsgs.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const ai = getAI();
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: history.slice(0, -1), // Everything except the last message 
        config: { systemInstruction: "You are Maize Guard AI, an expert agricultural assistant specializing in maize (corn) diseases, treatments, and general farming advice. Keep responses concise, helpful, and professional in Markdown format." }
      });

      const response = await chat.sendMessage({ message: finalMsg });
      
      const modelMsg: Message = { id: Date.now().toString(), role: 'model', text: response.text || "I'm sorry, I couldn't process that.", createdAt: Date.now() };
      const updatedMsgs = [...curMsgs, modelMsg];
      setMessages(updatedMsgs);
      saveCurrentSession(updatedMsgs);
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMsgText = error?.message || "Sorry, I ran into an error processing your request.";
      if (typeof error === 'string') errorMsgText = error;
      const errorMsg: Message = { id: Date.now().toString(), role: 'model', text: "Error: " + errorMsgText, createdAt: Date.now() };
      setMessages([...curMsgs, errorMsg]);
      saveCurrentSession([...curMsgs, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsTyping(true);
    try {
      // Compress image to Base64
      const compressedDataUrl = await compressImage(file);
      const base64Data = compressedDataUrl.split(',')[1];
      const mimeType = 'image/jpeg'; // Hardcoded based on compressImage output

      let seshId = currentSessionId;
      if (!seshId) {
        seshId = Date.now().toString();
        const newSession: ChatSession = { id: seshId, title: "New Chat", createdAt: Date.now() };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(seshId);
      }

      // 1. Add user message with image
      const uiMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        text: "I uploaded this leaf for analysis.", 
        imageUrl: compressedDataUrl,
        createdAt: Date.now() 
      };
      const tempMsgs = [...messages, uiMsg];
      setMessages(tempMsgs);

      // 2. Analyze with Gemini
      const analysis = await analyzeMaizeLeaf(base64Data, mimeType);

      // 3. Save Prediction to History
      const predId = Date.now().toString();
      await setDoc(doc(db, `users/${user.uid}/predictions/${predId}`), {
        userId: user.uid,
        imageUrl: compressedDataUrl,
        prediction: analysis.prediction || 'Unknown',
        confidence: analysis.confidence || 0,
        details: analysis.details || '',
        treatment: analysis.treatment || '',
        prevention: analysis.prevention || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // 4. Add model response
      const mdResponse = `**Prediction:** ${analysis.prediction} (${Math.round((analysis.confidence || 0) * 100)}% confidence)\n\n**Details:** ${analysis.details || ''}\n\n**Treatment:** ${analysis.treatment || ''}\n\n**Prevention:** ${analysis.prevention || ''}`;

      const modelMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: mdResponse, 
        isPrediction: true,
        createdAt: Date.now() 
      };
      
      const finalMsgs = [...tempMsgs, modelMsg];
      setMessages(finalMsgs);
      
      // Save session directly to avoid closure stale state
      const docRef = doc(db, `users/${user.uid}/chats/${seshId}`);
      await setDoc(docRef, {
        userId: user.uid,
        title: sessions.find(s => s.id === seshId)?.title || "Agriculture Chat",
        createdAt: sessions.find(s => s.id === seshId)?.createdAt || Date.now(),
        updatedAt: Date.now(),
        messages: finalMsgs
      }, { merge: true });

    } catch (error: any) {
      console.error("Upload/Analysis Error", error);
      const errMsg: Message = { id: Date.now().toString(), role: 'model', text: "Error analyzing image: " + error.message, createdAt: Date.now() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex bg-white h-full overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={cn("absolute md:relative z-30 w-72 h-full bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <Button onClick={handleNewChat} className="w-full gap-2 justify-start shadow-sm" variant="outline">
              <Plus className="h-4 w-4" /> New Chat
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden ml-2" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Previous 7 Days</div>
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => { setCurrentSessionId(s.id); setSidebarOpen(false); }}
              className={cn("w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors", currentSessionId === s.id ? "bg-brand-100 text-brand-900 font-medium" : "hover:bg-slate-200 text-slate-700")}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200">
          <Button 
            className="w-full gap-2 justify-start shadow-sm text-slate-600 hover:text-slate-900" 
            variant="ghost"
            onClick={async () => {
              if ((window as any).aistudio?.openSelectKey) {
                await (window as any).aistudio.openSelectKey();
              } else {
                alert("API Key selection is only available in the AI Studio environment.");
              }
            }}
          >
            <KeyRound className="h-4 w-4" /> Change API Key
          </Button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        <div className="h-14 border-b border-slate-100 flex items-center px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-medium ml-2 text-slate-900 truncate">{sessions.find(s=>s.id===currentSessionId)?.title || "Chat"}</span>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 pb-24 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg, i) => (
              <div key={msg.id || i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1", msg.role === 'user' ? "bg-brand-600 text-white" : "bg-emerald-100 text-emerald-700")}>
                  {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 shadow-sm", msg.role === 'user' ? "bg-brand-50 text-slate-900 rounded-tr-sm" : "bg-white border border-slate-100 rounded-tl-sm")}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Uploaded Leaf" className="max-w-full sm:max-w-xs rounded-xl mb-3 border border-slate-200 object-cover aspect-video sm:aspect-auto" />
                  )}
                  {msg.role === 'model' ? (
                     <div className="markdown-body prose prose-sm prose-slate max-w-none">
                       <Markdown>{msg.text}</Markdown>
                     </div>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1 shadow-sm">
                  <motion.div className="w-2 h-2 rounded-full bg-slate-300" animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-slate-300" animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-slate-300" animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute w-full bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-4">
          <div className="max-w-3xl mx-auto relative flex items-center border border-slate-200 rounded-full bg-white shadow-lg overflow-hidden p-1">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 hover:text-brand-600 rounded-full flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping}
              title="Upload leaf photo"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(inputMessage); }}
              placeholder="Ask about crops or upload a leaf..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-sm px-3 h-10 outline-none"
              disabled={isTyping}
            />

            <Button
               variant="ghost"
               size="icon"
               className={cn("text-slate-500 rounded-full flex-shrink-0 mr-1 hover:text-brand-600", isTyping && "opacity-50")}
               onClick={() => {
                 if (!('webkitSpeechRecognition' in window)) {
                   alert("Voice input is not supported in this browser.");
                   return;
                 }
                 const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                 const recognition = new SpeechRecognition();
                 recognition.lang = 'en-US';
                 recognition.interimResults = false;
                 recognition.maxAlternatives = 1;
                 
                 recognition.onresult = (event: any) => {
                   const speechResult = event.results[0][0].transcript;
                   setInputMessage(prev => prev + (prev ? " " : "") + speechResult);
                 };
                 
                 recognition.start();
               }}
               title="Dictate message"
            >
               <Mic className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              onClick={() => handleSendMessage(inputMessage)}
              disabled={isTyping || (!inputMessage.trim())}
              className="rounded-full bg-brand-600 hover:bg-brand-700 text-white shrink-0 shadow-sm"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3 hidden md:block">
            Maize Guard AI can make mistakes. Always consult local agricultural experts for critical actions.
          </p>
        </div>
      </div>
    </div>
  );
}
