INSERT INTO words (word, hint, options, correct_index) VALUES
('RESILIENT', 'adjetivo', '["Resistente","Brillante","Tranquilo","Rápido"]', 0),
('THRIVE', 'verbo', '["Sobrevivir","Prosperar","Intentar","Fallar"]', 1),
('ELOQUENT', 'adjetivo', '["Elegante","Fuerte","Elocuente","Callado"]', 2),
('PERSIST', 'verbo', '["Rendirse","Olvidar","Escuchar","Persistir"]', 3),
('CUNNING', 'adjetivo', '["Astuto","Amable","Torpe","Tímido"]', 0),
('BRAVE', 'adjetivo', '["Valiente","Débil","Tranquilo","Ruidoso"]', 0),
('ANCIENT', 'adjetivo', '["Moderno","Antiguo","Rápido","Joven"]', 1),
('BRIEF', 'adjetivo', '["Largo","Pesado","Breve","Fuerte"]', 2),
('SCARCE', 'adjetivo', '["Abundante","Escaso","Carísimo","Común"]', 1),
('EAGER', 'adjetivo', '["Aburrido","Cansado","Ansioso","Lento"]', 2),
('BENEATH', 'preposición', '["Encima","Debajo","Al lado","Adentro"]', 1),
('TO SEEK', 'verbo', '["Esconder","Buscar","Encontrar","Perder"]', 1),
('TO GAZE', 'verbo', '["Correr","Saltar","Mirar fijo","Cerrar"]', 2),
('TO GRASP', 'verbo', '["Soltar","Entender","Olvidar","Romper"]', 1),
('HAZY', 'adjetivo', '["Claro","Borrosos","Fuerte","Rápido"]', 1),
('TO WHISPER', 'verbo', '["Gritar","Susurrar","Cantar","Hablar"]', 1),
('SWIFT', 'adjetivo', '["Lento","Pesado","Rápido","Ancho"]', 2),
('TO FROWN', 'verbo', '["Sonreír","Fruncir el ceño","Saltar","Dormir"]', 1),
('DREADFUL', 'adjetivo', '["Maravilloso","Tranquilo","Horrible","Divertido"]', 2),
('TO MEND', 'verbo', '["Romper","Reparar","Comprar","Vender"]', 1);

INSERT INTO badges (name, icon, description) VALUES
('Primera clase', 'star', 'Asististe a tu primera clase'),
('Primer juego', 'device-gamepad-2', 'Completaste tu primer minijuego'),
('7 días seguidos', 'flame', '7 días consecutivos de actividad'),
('Top 3', 'trophy', 'Llegaste al top 3 del ranking'),
('Nivel 10', 'award', 'Alcanzaste el nivel 10'),
('100 recursos', 'book', 'Completaste 100 recursos');

INSERT INTO resources (title, category, meta, type, btn, url) VALUES
('Flashcards: Verbos irregulares', 'Vocabulario', '120 tarjetas · por Aldana', 'flash', 'Estudiar', null),
('Guía: Present Perfect vs Simple Past', 'Gramática', 'PDF · por Aldana', 'pdf', 'Descargar', null),
('Listening: Podcast nivel B1', 'Listening', 'Video · externo', 'video', 'Abrir', null),
('Ejercicios online: Condicionales', 'Gramática', 'Link externo', 'link', 'Abrir', null),
('Flashcards: Phrasal verbs cotidianos', 'Vocabulario', '80 tarjetas · por Aldana', 'flash', 'Estudiar', null);
