export const currentUser = {
  initials: 'TU',
  name: 'tú_acá',
  tag: '@discord_handle',
  level: 4,
  title: 'APPRENTICE',
  xp: 680,
  xpNext: 1000,
  avatarBg: 'linear-gradient(135deg,#f97316,#eab308)',
};

export const leaderboard = [
  { rank: 1, initials: 'SO', name: 'santii_ok', level: 12, xp: 4200, color: 'gold', bg: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { rank: 2, initials: 'NI', name: 'nico_', level: 9, xp: 3150, color: 'silver', bg: 'linear-gradient(135deg,#6ee7b7,#3b82f6)' },
  { rank: 3, initials: 'CA', name: 'camii_', level: 7, xp: 2480, color: 'bronze', bg: 'linear-gradient(135deg,#a78bfa,#ec4899)' },
  { rank: 4, initials: 'TU', name: 'tú_acá', level: 4, xp: 680, color: null, bg: 'linear-gradient(135deg,#f97316,#eab308)' },
  { rank: 5, initials: '??', name: 'próxima semana...', level: null, xp: null, color: null, bg: '#1c2030', dimmed: true },
];

export const words = [
  { word: 'RESILIENT', hint: 'adjetivo', options: ['Resistente', 'Brillante', 'Tranquilo', 'Rápido'], correct: 0 },
  { word: 'THRIVE', hint: 'verbo', options: ['Sobrevivir', 'Prosperar', 'Intentar', 'Fallar'], correct: 1 },
  { word: 'ELOQUENT', hint: 'adjetivo', options: ['Elegante', 'Fuerte', 'Elocuente', 'Callado'], correct: 2 },
  { word: 'PERSIST', hint: 'verbo', options: ['Rendirse', 'Olvidar', 'Escuchar', 'Persistir'], correct: 3 },
  { word: 'CUNNING', hint: 'adjetivo', options: ['Astuto', 'Amable', 'Torpe', 'Tímido'], correct: 0 },
  { word: 'BRAVE', hint: 'adjetivo', options: ['Valiente', 'Débil', 'Tranquilo', 'Ruidoso'], correct: 0 },
  { word: 'ANCIENT', hint: 'adjetivo', options: ['Moderno', 'Antiguo', 'Rápido', 'Joven'], correct: 1 },
  { word: 'BRIEF', hint: 'adjetivo', options: ['Largo', 'Pesado', 'Breve', 'Fuerte'], correct: 2 },
  { word: 'SCARCE', hint: 'adjetivo', options: ['Abundante', 'Escaso', 'Carísimo', 'Común'], correct: 1 },
  { word: 'EAGER', hint: 'adjetivo', options: ['Aburrido', 'Cansado', 'Ansioso', 'Lento'], correct: 2 },
  { word: 'BENEATH', hint: 'preposición', options: ['Encima', 'Debajo', 'Al lado', 'Adentro'], correct: 1 },
  { word: 'TO SEEK', hint: 'verbo', options: ['Esconder', 'Buscar', 'Encontrar', 'Perder'], correct: 1 },
  { word: 'TO GAZE', hint: 'verbo', options: ['Correr', 'Saltar', 'Mirar fijo', 'Cerrar'], correct: 2 },
  { word: 'TO GRASP', hint: 'verbo', options: ['Soltar', 'Entender', 'Olvidar', 'Romper'], correct: 1 },
  { word: 'HAZY', hint: 'adjetivo', options: ['Claro', 'Borrosos', 'Fuerte', 'Rápido'], correct: 1 },
  { word: 'TO WHISPER', hint: 'verbo', options: ['Gritar', 'Susurrar', 'Cantar', 'Hablar'], correct: 1 },
  { word: 'SWIFT', hint: 'adjetivo', options: ['Lento', 'Pesado', 'Rápido', 'Ancho'], correct: 2 },
  { word: 'TO FROWN', hint: 'verbo', options: ['Sonreír', 'Fruncir el ceño', 'Saltar', 'Dormir'], correct: 1 },
  { word: 'DREADFUL', hint: 'adjetivo', options: ['Maravilloso', 'Tranquilo', 'Horrible', 'Divertido'], correct: 2 },
  { word: 'TO MEND', hint: 'verbo', options: ['Romper', 'Reparar', 'Comprar', 'Vender'], correct: 1 },
];

export const games = [
  { id: 'wordsnap', icon: '🎯', title: 'WordSnap', desc: 'Adiviná el significado antes de que se acabe el tiempo', xp: '+50 XP / ronda', diff: 'FÁCIL', diffClass: 'easy', available: true },
  { id: 'linkwords', icon: '🔗', title: 'LinkWords', desc: 'Conectá palabras con sus definiciones a contrarreloj', xp: '+75 XP / ronda', diff: 'MEDIO', diffClass: 'med', available: false },
  { id: 'sentencefix', icon: '🧩', title: 'SentenceFix', desc: 'Ordená las palabras para formar la oración correcta', xp: '+100 XP / ronda', diff: 'DIFÍCIL', diffClass: 'hard', available: false },
  { id: 'listenup', icon: '👂', title: 'ListenUp', desc: 'Escuchá la palabra y escribila correctamente', xp: '+80 XP / ronda', diff: 'MEDIO', diffClass: 'med', available: false },
];

export const resources = [
  { id: 1, title: 'Flashcards: Verbos irregulares', category: 'Vocabulario', meta: '120 tarjetas · por Aldana', type: 'flash', btn: 'Estudiar' },
  { id: 2, title: 'Guía: Present Perfect vs Simple Past', category: 'Gramática', meta: 'PDF · por Aldana', type: 'pdf', btn: 'Descargar' },
  { id: 3, title: 'Listening: Podcast nivel B1', category: 'Listening', meta: 'Video · externo', type: 'video', btn: 'Abrir' },
  { id: 4, title: 'Ejercicios online: Condicionales', category: 'Gramática', meta: 'Link externo', type: 'link', btn: 'Abrir' },
  { id: 5, title: 'Flashcards: Phrasal verbs cotidianos', category: 'Vocabulario', meta: '80 tarjetas · por Aldana', type: 'flash', btn: 'Estudiar' },
];

export const resourceCategories = ['Todos', 'Gramática', 'Vocabulario', 'Listening', 'Writing'];

export const xpHistory = [
  { icon: 'class', desc: 'Asististe a clase: Presente perfecto', xp: '+150 XP' },
  { icon: 'game', desc: 'WordSnap — racha de 5 correctas', xp: '+80 XP' },
  { icon: 'res', desc: 'Flashcards completadas: Verbos irregulares', xp: '+40 XP' },
  { icon: 'class', desc: 'Asististe a clase: Phrasal verbs', xp: '+150 XP' },
];

export const badges = [
  { name: 'Primera clase', icon: 'star', earned: true },
  { name: 'Primer juego', icon: 'device-gamepad-2', earned: true },
  { name: '7 días seguidos', icon: 'flame', earned: true },
  { name: 'Top 3', icon: 'trophy', earned: false },
  { name: 'Nivel 10', icon: 'award', earned: false },
  { name: '100 recursos', icon: 'book', earned: false },
];

export const stats = [
  { value: '24', label: 'Miembros activos' },
  { value: '6', label: 'Minijuegos' },
  { value: '38', label: 'Recursos' },
];
