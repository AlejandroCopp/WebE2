import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Clock, Settings, Save, X, RotateCcw, CheckCircle, Star, MessageSquare, Grid, ChevronRight, Home, Folder, Users, BookOpen, Smartphone, Maximize, ZoomIn, ZoomOut, Move, Lock, LogIn, UserCircle, Loader2, KeyRound, ShieldCheck, CalendarClock, Cloud, ShoppingBag, Mail } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';



// --- CONFIGURACIÓN DE FIREBASE ok---
const firebaseConfig = {
  apiKey: "AIzaSyCowSK9zPnRkjqGzJNGcXvv3fI7oXxW1OY",
  authDomain: "plataforma-web-educativa-51304.firebaseapp.com",
  projectId: "plataforma-web-educativa-51304",
  storageBucket: "plataforma-web-educativa-51304.firebasestorage.app",
  messagingSenderId: "359156786934",
  appId: "1:359156786934:web:23b653477f7faad31a6ed7",
  measurementId: "G-B2K999CDY9"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "mi-escuela-digital"; 

// --- const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; ---

// --- DESCRIPCIONES DE NIVELES (SUBTÍTULOS) ---
const LEVEL_SUBTITLES = {
  "Nivel 1": "Lo imprescindible que debes saber sobre tu Celular, cuidarlo bien y las habilidades para desenvolverte en cualquier circunstancia.",
  "Nivel 2": "Aplicaciones para ampliar su funcionalidad.",
  "Nivel 3": "Aprende a dominar la Nube y aprovechar sus herramientas."
};

// --- ICONOS DE NIVELES ---
const LEVEL_ICONS = {
  "Nivel 1": Smartphone,
  "Nivel 2": ShoppingBag,
  "Nivel 3": Cloud
};

// --- LISTA BLANCA DE ALUMNOS (CONTROL DE ACCESO, NIVELES Y NOMBRES) ---
const AUTHORIZED_STUDENTS = {
  "1": {
    name: "Juan Pérez",
    access: {
      "Nivel 1": "2023-01-01", 
      "Nivel 2": new Date().toISOString().split('T')[0] 
    }
  },
  "2": {
    name: ". ",
    access: {
      "Nivel 2": new Date().toISOString().split('T')[0] 
    }
  },
  "3": {
    name: ".  ",
    access: {
      "Nivel 3": new Date().toISOString().split('T')[0]
    }
  }
};

// --- ESTRUCTURA DE CLASE POR DEFECTO ---
const EMPTY_CLASS_TEMPLATE = [
  { id: 1, title: "Apertura y Bienvenida", type: "video", duration: 600, content: "https://www.youtube.com/watch?v=LXb3EKWsInQ", notes: "Música suave. Verificar audio." }, // Ejemplo YouTube
  { id: 2, title: "Repaso: Clase Anterior", type: "video_practice", duration: 300, content: "https://www.w3schools.com/html/movie.mp4", notes: "Video tutorial corto." },
  { id: 3, title: "Práctica de Repaso", type: "timer", duration: 300, content: "Repasen lo visto en el video anterior.", notes: "Contador 5 min." },
  { id: 4, title: "Tema 1: Introducción", type: "video", duration: 180, content: "https://www.w3schools.com/html/mov_bbb.mp4", notes: "Explicación del tema." },
  { id: 5, title: "Práctica Guiada", type: "slide", duration: 1320, content: "TAREA: [Instrucción]", notes: "Guiar paso a paso." },
  { id: 6, title: "Práctica Grupal", type: "timer", duration: 900, content: "Trabajo en grupos.", notes: "Salas pequeñas." },
  { id: 7, title: "Break Activo", type: "video", duration: 900, content: "https://www.w3schools.com/html/movie.mp4", notes: "Movilidad." },
  { id: 8, title: "Tema 2: Profundización", type: "image", duration: 900, content: "https://placehold.co/800x600/indigo/FFFFFF/png?text=Ficha+Tema+2", notes: "Mostrar ficha." },
  { id: 9, title: "Práctica: Tema 2", type: "timer", duration: 300, content: "Realizar ajustes.", notes: "Práctica individual." },
  { id: 10, title: "Trivia Final", type: "quiz", duration: 15, question: "¿Pregunta del día?", options: ["A", "B", "C"], correctAnswer: 1, notes: "Trivia." }
];

// --- DATOS INICIALES DEL CURSO ---
const INITIAL_COURSE_DATA = {
  "Nivel 1": {
    "Clase 1": EMPTY_CLASS_TEMPLATE, "Clase 2": EMPTY_CLASS_TEMPLATE, "Clase 3": EMPTY_CLASS_TEMPLATE, "Clase 4": EMPTY_CLASS_TEMPLATE, "Clase 5": EMPTY_CLASS_TEMPLATE, "Clase 6": EMPTY_CLASS_TEMPLATE
  },
  "Nivel 2": {
    "Clase 1": EMPTY_CLASS_TEMPLATE, "Clase 2": EMPTY_CLASS_TEMPLATE, "Clase 3": EMPTY_CLASS_TEMPLATE, "Clase 4": EMPTY_CLASS_TEMPLATE, "Clase 5": EMPTY_CLASS_TEMPLATE, "Clase 6": EMPTY_CLASS_TEMPLATE
  },
  "Nivel 3": {
    "Clase 1": EMPTY_CLASS_TEMPLATE, "Clase 2": EMPTY_CLASS_TEMPLATE, "Clase 3": EMPTY_CLASS_TEMPLATE, "Clase 4": EMPTY_CLASS_TEMPLATE, "Clase 5": EMPTY_CLASS_TEMPLATE, "Clase 6": EMPTY_CLASS_TEMPLATE
  }
};

// --- HELPERS PARA URLS ---
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getGoogleDriveId = (url) => {
  if (!url) return null;
  // Patrón para capturar el ID entre /file/d/ y /view o /preview
  const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// --- COMPONENTES VISUALES (UI) ---

const TimerDisplay = ({ seconds, totalSeconds, isRunning }) => {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <div className="text-6xl font-mono font-bold text-slate-800 bg-white px-8 py-4 rounded-xl shadow-inner border-2 border-slate-200">{formatTime(seconds)}</div>
      <div className="w-full max-w-md h-4 bg-slate-200 rounded-full mt-4 overflow-hidden">
        <div className={`h-full transition-all duration-1000 ease-linear ${seconds < 60 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${100 - progress}%` }}></div>
      </div>
      <p className="mt-2 text-slate-500 font-medium">{isRunning ? "Tiempo corriendo..." : "Tiempo en pausa"}</p>
    </div>
  );
};

const QuizComponent = ({ data }) => {
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(10);
  useEffect(() => {
    let interval;
    if (timer > 0 && !revealed) interval = setInterval(() => setTimer((t) => t - 1), 1000);
    else if (timer === 0 && !revealed) setRevealed(true);
    return () => clearInterval(interval);
  }, [timer, revealed]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-xl border-4 border-indigo-100">
      <h3 className="text-3xl font-bold text-indigo-900 mb-8 text-center">{data.question}</h3>
      <div className="w-full space-y-4">
        {data.options.map((opt, idx) => (
          <div key={idx} className={`p-6 text-2xl rounded-xl border-2 transition-all duration-500 ${revealed ? idx === data.correctAnswer ? 'bg-green-100 border-green-500 text-green-900 font-bold scale-105' : 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-indigo-200 text-slate-700'}`}>
            <span className="inline-block w-8 font-bold mr-4">{String.fromCharCode(65 + idx)}.</span>{opt}
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-4">
        {!revealed ? (
          <div className="text-4xl font-bold text-orange-500 bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center border-4 border-orange-200">{timer}</div>
        ) : (
          <div className="text-2xl font-bold text-green-600 flex items-center gap-2 animate-bounce"><CheckCircle size={32} /> ¡Respuesta Correcta!</div>
        )}
      </div>
    </div>
  );
};

const VideoDisplay = ({ section, userMode }) => { 
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); 
  const containerRef = useRef(null);
  const videoRef = useRef(null); 
  const [trail, setTrail] = useState([]);

  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); setTrail([]); }, [section.content]);

  // Manejador de Barra Espaciadora para Play/Pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); 
        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const youtubeId = getYouTubeId(section.content);
  const googleDriveId = getGoogleDriveId(section.content);

  const handleZoom = (direction) => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev + 0.25 : prev - 0.25;
      const clamped = Math.min(Math.max(newZoom, 1), 3); 
      if (clamped === 1) setPan({ x: 0, y: 0 });
      return clamped;
    });
  };
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };
  
  const handleMouseDown = (e) => {
    if (zoom > 1) { setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); }
  };
  const handleMouseMove = (e) => {
    // Solo generar rastro si es PROFESOR
    if (userMode === 'teacher') {
      setTrail((prev) => {
        const newPoint = { x: e.clientX, y: e.clientY, id: Math.random() };
        return [newPoint, ...prev.slice(0, 30)]; 
      });
    }
    if (isDragging && zoom > 1) { e.preventDefault(); setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }
  };
  const handleMouseLeave = () => { setIsDragging(false); setTrail([]); };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div ref={containerRef} className={`w-full h-full flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden shadow-2xl relative group ${zoom > 1 ? 'cursor-move' : ''}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
        {userMode === 'teacher' && (
          <svg className="fixed inset-0 pointer-events-none z-[9999]" style={{ width: '100vw', height: '100vh' }}>
            {trail.map((point, index) => {
              if (index === trail.length - 1) return null;
              const nextPoint = trail[index + 1];
              const strokeWidth = Math.max(2, 16 - index * 0.5);
              return (
                <line key={point.id} x1={point.x} y1={point.y} x2={nextPoint.x} y2={nextPoint.y} stroke="red" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: (30 - index) / 30, filter: 'drop-shadow(0 0 2px rgba(220,38,38,0.5))' }} />
              );
            })}
          </svg>
        )}
        
        {youtubeId ? (
          <div className="w-full h-full relative" 
               style={{ 
                 transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
                 transformOrigin: 'center', 
                 transition: isDragging ? 'none' : 'transform 0.2s ease-out' 
               }}>
            {zoom > 1 && <div className="absolute inset-0 z-50 bg-transparent"></div>}
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        ) : googleDriveId ? (
            <div className="w-full h-full relative" 
                 style={{ 
                   transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
                   transformOrigin: 'center', 
                   transition: isDragging ? 'none' : 'transform 0.2s ease-out' 
                 }}>
              {zoom > 1 && <div className="absolute inset-0 z-50 bg-transparent"></div>}
              <iframe 
                src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
                className="w-full h-full"
                allow="autoplay"
                title="Google Drive Video"
              ></iframe>
            </div>
        ) : (
          <video 
            ref={videoRef} 
            key={section.content} 
            src={section.content} 
            controls={!isDragging} 
            className="w-full h-full object-contain" 
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center', transition: isDragging ? 'none' : 'transform 0.2s ease-out' }} 
            draggable={false} 
          />
        )}

        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/10">
           {zoom > 1 && <div className="flex items-center text-white/70 text-xs mr-2 animate-pulse font-medium"><Move size={14} className="mr-1" /> Arrastra para mover</div>}
           <button onClick={() => handleZoom('out')} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Alejar"><ZoomOut size={20} /></button>
           <button onClick={resetView} className="text-white font-mono text-sm font-bold w-12 text-center select-none hover:bg-white/10 rounded px-1">{Math.round(zoom * 100)}%</button>
           <button onClick={() => handleZoom('in')} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Acercar"><ZoomIn size={20} /></button>
           <div className="w-px h-6 bg-white/20 mx-1"></div>
           <button onClick={toggleFullScreen} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Pantalla Completa"><Maximize size={20} /></button>
        </div>
    </div>
  )
}

const ContentDisplay = ({ section, userMode }) => { 
  if (section.type === 'video' || section.type === 'video_practice') return <VideoDisplay section={section} userMode={userMode} />; 
  if (section.type === 'slide' || section.type === 'timer') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 rounded-xl p-12 text-center border-4 border-dashed border-indigo-200">
        {section.type === 'slide' && <Star size={64} className="text-yellow-400 mb-6 fill-yellow-400" />}
        {section.type === 'timer' && <Clock size={64} className="text-indigo-400 mb-6" />}
        <div className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight whitespace-pre-line">{section.content}</div>
        {section.type === 'slide' && <div className="mt-8 text-xl text-slate-500 bg-white px-6 py-3 rounded-full shadow-sm">Sigue las instrucciones en pantalla</div>}
      </div>
    );
  }
  if (section.type === 'image') {
    // Detectamos si es una imagen de Google Drive para usar iframe
    const googleDriveId = getGoogleDriveId(section.content);
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl overflow-hidden shadow-lg p-4">
        {googleDriveId ? (
          <iframe 
            src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
            className="w-full h-full rounded-lg"
            title="Material de clase"
            allow="autoplay"
          ></iframe>
        ) : (
          <img src={section.content} alt="Material" className="max-h-full max-w-full object-contain rounded-lg" />
        )}
      </div>
    );
  }
  if (section.type === 'quiz') return <QuizComponent data={section} />;
  return <div>Contenido desconocido</div>;
};

// --- SESIÓN ACTIVA (PANTALLA DE LA CLASE) ---
const ClassSession = ({ classData, levelTitle, classTitle, onBack, onUpdateClassData, userMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(classData[0]?.duration || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [configText, setConfigText] = useState(JSON.stringify(classData, null, 2));
  const currentSection = classData[currentIndex];

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    else if (timeLeft === 0) setIsRunning(false);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (classData[currentIndex]) { setTimeLeft(classData[currentIndex].duration); setIsRunning(false); }
  }, [currentIndex, classData]);

  const changeSection = (newIndex) => {
    if (newIndex >= 0 && newIndex < classData.length) setCurrentIndex(newIndex);
  };

  const handleSaveConfig = () => {
    try {
      const parsed = JSON.parse(configText);
      onUpdateClassData(parsed); 
      setCurrentIndex(0);
      setShowConfig(false);
    } catch (e) { alert("Error en el formato JSON. Revisa las comas."); }
  };

  // Determinar si mostrar el contador. Se OCULTA para:
  // - Videos (video, video_practice)
  // - Actividades de alumnos (timer)
  // - Quizzes (ya tienen su propio timer)
  const showTimer = !['video', 'video_practice', 'timer', 'quiz'].includes(currentSection.type);

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 flex items-center gap-1 text-sm font-medium"><SkipBack size={16} /> Volver</button>
          <div className="h-6 w-px bg-slate-300 mx-2"></div>
          <h1 className="text-xl font-bold text-slate-700"><span className="text-slate-400 font-normal">{levelTitle} / {classTitle}:</span> <span className="text-indigo-600">{currentSection.title}</span></h1>
        </div>
        <div className="flex items-center gap-4">
          {userMode === 'teacher' && <button onClick={() => setShowConfig(true)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="Cargar Material"><Settings size={20} /></button>}
          {userMode === 'student' && <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">Modo Alumno</div>}
        </div>
      </header>
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 overflow-y-auto hidden md:block">
          <div className="p-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Temario</h2>
            <div className="space-y-2">
              {classData.map((section, idx) => (
                <button key={section.id} onClick={() => changeSection(idx)} className={`w-full text-left p-3 rounded-lg text-sm transition-all ${idx === currentIndex ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <div className="flex justify-between items-center mb-1"><span>{idx + 1}. {section.type === 'video' ? '🎥' : section.type === 'quiz' ? '❓' : '⏱️'}</span><span className="text-xs text-slate-400">{Math.floor(section.duration / 60)}m</span></div>
                  <div className="truncate">{section.title}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>
        <section className="flex-1 flex flex-col bg-slate-100 relative">
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full h-full max-w-6xl max-h-[80vh] flex flex-col">
              <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-4 relative">
                <ContentDisplay section={currentSection} userMode={userMode} /> {/* Pasa userMode */}
                {/* Notas del profesor eliminadas */}
              </div>
            </div>
          </div>
          <div className="h-24 bg-white border-t border-slate-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-6">
              {/* RENDERIZADO CONDICIONAL DEL TIMER */}
              {showTimer && (
                <>
                  <div className="text-right"><div className={`text-3xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-slate-700'}`}>{Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</div></div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsRunning(!isRunning)} className={`p-4 rounded-full shadow-lg transform active:scale-95 ${isRunning ? 'bg-yellow-100 text-yellow-600' : 'bg-indigo-600 text-white'}`}>{isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}</button>
                    <button onClick={() => { setIsRunning(false); setTimeLeft(currentSection.duration); }} className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><RotateCcw size={24} /></button>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => changeSection(currentIndex - 1)} disabled={currentIndex === 0} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"><SkipBack size={20} /> Anterior</button>
              <button onClick={() => changeSection(currentIndex + 1)} disabled={currentIndex === classData.length - 1} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg disabled:opacity-50">Siguiente <SkipForward size={20} /></button>
            </div>
          </div>
        </section>
      </main>
      {showConfig && userMode === 'teacher' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          {/* MODAL CONFIGURACIÓN MÁS GRANDE (h-[90vh]) */}
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-lg text-slate-700 flex items-center gap-2"><Settings size={18} /> Cargar Material: {levelTitle} - {classTitle}</h3><button onClick={() => setShowConfig(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button></div>
            <div className="p-6 flex-1 overflow-hidden flex flex-col"><p className="text-sm text-slate-500 mb-2">Pega aquí el JSON de tu clase preparada:</p><textarea value={configText} onChange={(e) => setConfigText(e.target.value)} className="flex-1 w-full font-mono text-xs p-4 bg-slate-900 text-green-400 rounded-xl outline-none resize-none" spellCheck="false" /></div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3"><button onClick={() => setShowConfig(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button><button onClick={handleSaveConfig} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2"><Save size={18} /> Guardar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP PRINCIPAL (CONTENEDOR) ---

export default function ClassManager() {
  const [courseData, setCourseData] = useState(null); 
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [user, setUser] = useState(null); 
  const [userProfile, setUserProfile] = useState(null); 
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [dniInput, setDniInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState(""); // Nuevo estado para Email
  const [teacherPasswordInput, setTeacherPasswordInput] = useState("");

  // 1. AUTENTICACIÓN Y GESTIÓN DE SESIÓN
  useEffect(() => {
    const initAuth = async () => {
      // Intentamos recuperar una sesión previa o iniciamos una anónima
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    // initAuth se llama solo si no hay usuario inicial, pero onAuthStateChanged maneja los cambios
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Si no hay usuario (logout), iniciamos anónimo automáticamente para volver al lobby
        signInAnonymously(auth).catch((error) => console.error("Error anon login:", error));
      }
    });
    
    // Si es la primera carga y no hay usuario, iniciamos
    if (!auth.currentUser) {
       initAuth();
    }

    return () => unsubscribe();
  }, []);

  // 2. SINCRONIZACIÓN DE CURSOS
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'course_content', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) { setCourseData(docSnap.data()); } else { setCourseData(INITIAL_COURSE_DATA); }
      setIsLoadingData(false);
    }, (error) => { console.error("Error fetching course data:", error); setCourseData(INITIAL_COURSE_DATA); setIsLoadingData(false); });
    return () => unsubscribe();
  }, [user]);

  // 3. SINCRONIZACIÓN DE PERFIL
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) { setUserProfile(docSnap.data()); } else { setUserProfile(null); }
    }, (error) => console.error("Error profile:", error));
    return () => unsubscribe();
  }, [user]);

  // LOGIN PROFESOR (CON FIREBASE AUTH REAL)
  const handleTeacherLogin = async () => {
    try {
      setLoginError("");
      const userCredential = await signInWithEmailAndPassword(auth, teacherEmail, teacherPasswordInput);
      
      // Una vez logueado, forzamos la escritura del rol 'teacher' en su perfil de Firestore
      // Esto asegura que la UI lo reconozca como profesor.
      const userDocRef = doc(db, 'artifacts', appId, 'users', userCredential.user.uid, 'data', 'profile');
      await setDoc(userDocRef, { 
        role: 'teacher', 
        lastLogin: new Date().toISOString() 
      }, { merge: true });

    } catch (error) {
      console.error(error);
      setLoginError("Error de autenticación: Verifique email y contraseña.");
    }
  };

  // LOGIN ALUMNO
  const handleStudentLogin = async () => {
    if (!user) return;
    const cleanDni = dniInput.trim();
    
    if (!AUTHORIZED_STUDENTS.hasOwnProperty(cleanDni)) {
      setLoginError("Este DNI no tiene una suscripción activa.");
      return;
    }

    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    const studentData = AUTHORIZED_STUDENTS[cleanDni];

    const dataToSave = {
      role: 'student',
      dni: cleanDni,
      name: studentData.name, 
      access: studentData.access, 
      lastLogin: new Date().toISOString()
    };

    await setDoc(userDocRef, dataToSave); // Sin merge para limpiar sesión anterior
  };

  // LOGOUT
  const handleLogout = async () => {
    if (userProfile?.role === 'teacher') {
       // Si es profesor, cerramos la sesión real de Firebase.
       // Esto disparará onAuthStateChanged -> user null -> signInAnonymously -> vuelta al lobby
       await signOut(auth);
    } else {
       // Si es alumno (anónimo), solo limpiamos sus datos en Firestore para "cerrar" la sesión lógica
       if (!user) return;
       const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
       await setDoc(userDocRef, { role: null, access: null, dni: null, name: null }); 
    }
    
    // Limpieza de estados locales
    setDniInput("");
    setTeacherEmail("");
    setTeacherPasswordInput("");
    setShowTeacherForm(false);
    setLoginError("");
  };

  const updateClassData = async (newData) => {
    if (!courseData) return;
    const updatedCourseData = { ...courseData, [selectedLevel]: { ...courseData[selectedLevel], [selectedClass]: newData } };
    setCourseData(updatedCourseData);
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'course_content', 'main');
    await setDoc(docRef, updatedCourseData);
  };

  const calculateUnlockedWeeksForLevel = (levelName) => {
    if (!userProfile?.access || !userProfile.access[levelName]) return 0;
    const startDateStr = userProfile.access[levelName];
    const start = new Date(startDateStr);
    const now = new Date();
    const diffTime = now - start;
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return Math.floor(diffDays / 7) + 1;
  };

  if (!user || isLoadingData) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Cargando sistema...</div>;

  // --- VISTA 0: LOGIN ---
  if (!userProfile || !userProfile.role) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-black"></div>
         <div className="bg-white/10 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10 w-full max-w-lg relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Clase de Celulares</h1>
            <p className="text-indigo-200 mb-10 text-lg">Plataforma de Aprendizaje Digital Desarrollada por ALC</p>
            
            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner">
                <label className="block text-indigo-200 text-sm font-bold mb-3 text-left flex items-center gap-2">
                  <UserCircle size={16}/> Ingreso Alumnos
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={dniInput}
                    onChange={(e) => { setDniInput(e.target.value.replace(/\D/g, '')); setLoginError(""); }}
                    placeholder="Ingresa tu DNI (solo números)"
                    className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button onClick={handleStudentLogin} className="bg-indigo-600 text-white font-bold p-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-900/50">
                    <LogIn size={24} />
                  </button>
                </div>
                {loginError && <p className="text-red-400 text-xs mt-3 text-left font-medium flex items-center gap-1 animate-pulse"><X size={12}/> {loginError}</p>}
                <p className="text-slate-500 text-xs text-left mt-3">* Ingresa el DNI con el que te registraste al pagar.</p>
              </div>

              <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-white/10"></div><span className="flex-shrink-0 mx-4 text-white/20 text-xs uppercase tracking-widest">Administración</span><div className="flex-grow border-t border-white/10"></div></div>

              {!showTeacherForm ? (
                <button onClick={() => { setShowTeacherForm(true); setLoginError(""); }} className="w-full bg-transparent text-slate-400 text-sm font-medium p-3 rounded-xl hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2 border border-dashed border-slate-700">
                  <KeyRound size={16} /> Soy Ale
                </button>
              ) : (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-indigo-500/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <p className="text-indigo-300 text-xs font-bold mb-2 flex items-center gap-1"><ShieldCheck size={12}/> Acceso Seguro</p>
                   <div className="flex flex-col gap-2">
                     <input 
                        type="email" 
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        placeholder="Email de Profesor"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                     <div className="flex gap-2">
                       <input 
                          type="password" 
                          value={teacherPasswordInput}
                          onChange={(e) => setTeacherPasswordInput(e.target.value)}
                          placeholder="Contraseña"
                          className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button onClick={handleTeacherLogin} className="bg-indigo-600 text-white p-2 rounded-lg font-bold hover:bg-indigo-500">Entrar</button>
                        <button onClick={() => setShowTeacherForm(false)} className="text-slate-400 p-2 hover:text-white"><X size={20}/></button>
                     </div>
                   </div>
                </div>
              )}
            </div>
         </div>
      </div>
    );
  }

  // --- VISTA 1: SELECCIÓN DE NIVEL ---
  if (!selectedLevel) {
    const firstName = userProfile.name ? userProfile.name.split(' ')[0] : '';

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-6 flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border shadow-sm text-sm text-slate-500">
               <UserCircle size={14} /> {userProfile.role === 'teacher' ? 'Modo Profesor' : (userProfile.name ? `Hola, ${userProfile.name}` : `Alumno DNI: ${userProfile.dni}`)}
             </div>
             <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-600 hover:underline">Cerrar Sesión / Salir</button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg"><Smartphone size={48} className="text-white" /></div>
          <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">Clase de Celulares</h1>
        </div>
        
        <div className="text-slate-500 mb-12 text-xl font-medium text-center">
          {userProfile.role === 'teacher' ? (
            'Panel de Control Docente'
          ) : (
            <>
              ¡Qué bueno verte por aquí {firstName}!
              <span className="block mt-2 text-indigo-600">¡Hoy es un buen día para aprender!</span>
            </>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {courseData && Object.keys(courseData).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((level) => {
            const isLevelLocked = userProfile.role === 'student' && (!userProfile.access || !userProfile.access[level]);
            
            // Determinar ícono según nivel (fallback a Users si no se encuentra)
            const IconComponent = LEVEL_ICONS[level] || Users;

            return (
              <button 
                key={level} 
                onClick={() => !isLevelLocked && setSelectedLevel(level)} 
                disabled={isLevelLocked}
                className={`group relative p-8 rounded-3xl shadow-xl border transition-all duration-300 transform flex flex-col items-center text-center gap-4
                  ${isLevelLocked 
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed grayscale' 
                    : 'bg-white hover:bg-indigo-600 hover:text-white border-slate-100 hover:-translate-y-2 cursor-pointer'
                  }`}
              >
                <div className={`p-6 rounded-full transition-colors ${isLevelLocked ? 'bg-slate-200' : 'bg-indigo-100 group-hover:bg-white/20'}`}>
                  {isLevelLocked ? <Lock size={48} className="text-slate-400" /> : <IconComponent size={48} className="text-indigo-600 group-hover:text-white" />}
                </div>
                <h2 className="text-2xl font-bold">{level}</h2>
                <p className={`text-xs px-2 min-h-[40px] ${isLevelLocked ? 'text-slate-400' : 'text-slate-500 group-hover:text-indigo-100'}`}>
                  {LEVEL_SUBTITLES[level] || "Contenido del curso."}
                </p>
                <p className={`text-xs font-bold uppercase tracking-widest ${isLevelLocked ? 'text-slate-400' : 'text-indigo-400 group-hover:text-white'}`}>
                  {isLevelLocked ? 'No adquirido' : '6 Clases Disponibles'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- VISTA 2: SELECCIÓN DE CLASE ---
  if (selectedLevel && !selectedClass) {
    // Calculamos las semanas desbloqueadas PARA ESTE NIVEL ESPECÍFICO
    const unlockedWeeks = userProfile.role === 'teacher' ? 999 : calculateUnlockedWeeksForLevel(selectedLevel);
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6 relative">
        <button onClick={() => setSelectedLevel(null)} className="self-start mb-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium px-4 py-2 rounded-lg hover:bg-white transition-colors"><Home size={20} /> Volver al Inicio</button>
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-indigo-900">{selectedLevel}</h2>
            <div className="h-px bg-slate-300 flex-1"></div>
            <span className="text-slate-400 font-medium">Selecciona una clase</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseData && Object.keys(courseData[selectedLevel]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((className, index) => {
              const isLocked = index >= unlockedWeeks;
              return (
                <button
                  key={className}
                  onClick={() => !isLocked && setSelectedClass(className)}
                  disabled={isLocked}
                  className={`relative p-6 rounded-2xl border transition-all text-left group ${isLocked ? 'bg-slate-100 border-slate-200 opacity-70 cursor-not-allowed grayscale' : 'bg-white shadow-sm border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl transition-colors ${isLocked ? 'bg-slate-200 text-slate-400' : 'bg-orange-100 text-orange-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>{isLocked ? <Lock size={24} /> : <BookOpen size={24} />}</div>
                    {!isLocked && <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{className}</h3>
                  <p className="text-sm text-slate-500">{courseData[selectedLevel][className].length} actividades cargadas</p>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-2xl">
                      <div className="bg-slate-800 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"><CalendarClock size={12} /> Desbloquea semana {index + 1}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 3: REPRODUCTOR DE CLASE ---
  return (
    <>
      <ClassSession 
        classData={courseData[selectedLevel][selectedClass]}
        levelTitle={selectedLevel}
        classTitle={selectedClass}
        onBack={() => setSelectedClass(null)}
        onUpdateClassData={updateClassData}
        userMode={userProfile.role}
      />
    </>
  );
}