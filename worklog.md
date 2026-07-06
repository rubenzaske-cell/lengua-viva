---
Task ID: 1-9 (single-developer execution)
Agent: Z.ai Code (main)
Task: Crear aplicación para aprender quechua estilo Duolingo con gamificación completa

Work Log:
- Diseñé e implementé el schema Prisma (UserState, LessonProgress, AchievementProgress, StreakDay, LeagueMember) y apliqué con `bun run db:push`.
- Creé el currículo completo de quechua en `src/lib/quechua/content.ts`: 3 unidades, 12 lecciones, ~75 ejercicios de 5 tipos (select, reverse, match, bank, listen) con vocabulario real quechua chanka (allinllachu, añay, inti, killa, yaku, mikhuy, etc.). Incluye logros, ligas y items de tienda.
- Implementé helpers de gamificación (rachas, regeneración de corazones, niveles, zonas horarias America/Lima) en `gamification.ts` y store Zustand en `store.ts`.
- Definí el tema visual Duolingo en `globals.css`: paleta verde primaria, botones 3D con sombra inferior, nodos de camino, opciones de ejercicio, animaciones (pop-in, shake, pulse-ring, bounce). Fuente Nunito.
- Construí el shell de la app en `page.tsx`: pantalla de carga, router de vistas, TopBar (racha/gemas/corazones/meta diaria) y BottomNav fija de 5 pestañas.
- Vista Ruta de Aprendizaje (`LearnPath.tsx`): camino serpenteante con nodos 3D, estados bloqueado/activo/completado, coronas, banners de unidad.
- Reproductor de lecciones (`LessonPlayer.tsx`): barra de progreso, sistema de corazones, 5 tipos de ejercicio, feedback correcto/incorrecto, pérdida de corazón vía API, pantalla de completado con XP/gemas/logros. TTS con Web Speech API para pronunciación.
- Vista Ligas (`LeagueView.tsx`): ranking con bots, zona de ascenso/descenso, escalera de 7 ligas, simulación de fin de semana.
- Vista Perfil (`ProfileView.tsx`): nivel con título quechua, grid de 6 estadísticas, calendario de racha semanal, meta diaria, resumen de logros.
- Vista Logros (`AchievementsView.tsx`): 12 logros con tiers (bronce/plata/oro/diamante), barras de progreso.
- Vista Tienda (`ShopView.tsx`): 5 items (recarga corazones, congeladores, doble XP, corazón extra) con sistema de gemas.
- API routes: `/api/state` (GET snapshot), `/api/progress` (POST completar lección / PUT perder corazón), `/api/heart` (refill), `/api/leaderboard` (GET ranking / POST avanzar semana), `/api/shop` (POST comprar). Lógica de servidor en `server.ts` con regeneración de corazones, rachas, desbloqueo progresivo, recálculo de logros.
- `bun run lint` pasa sin errores ni warnings.
- Verificación con Agent Browser: cargó la app, completé la lección "Saludos" (6 ejercicios) sin errores, vi la pantalla "¡Perfecto!", se desbloqueó el logro first_lesson y la lección 2 quedó activa. Verifiqué las 5 vistas (Aprender, Ligas, Logros, Tienda, Perfil). Sin errores en consola ni en dev.log. Vista móvil responsive confirmada.

Stage Summary:
- App **RunaSimi** completa y funcional: aprender quechua estilo Duolingo con gamificación total.
- Sistemas de gamificación implementados: XP, niveles con títulos quechua, rachas diarias (con congeladores), corazones (regeneración 30min + refill con gemas), gemas, 7 ligas con bots y ascensos/descensos semanales, 12 logros con tiers, coronas de maestría, meta diaria, boost de doble XP.
- 5 tipos de ejercicio con pronunciación TTS. Contenido quechua real (Runa Simi / chanka).
- Stack: Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui, Prisma (SQLite), Zustand, Framer Motion, Web Speech API.
- 100% verificado en navegador (desktop y móvil). Sin errores de runtime.

---
Task ID: 10 (Kuntur mascot integration)
Agent: Z.ai Code (main)
Task: Integrar la mascota Kuntur (cóndor) con 8 emociones en toda la app

Work Log:
- Copié las 8 imágenes de Kuntur desde /upload a /public/kuntur/ con nombres limpios (feliz, enamorado, triste, enojado, sorprendido, guino, timido, risa).
- Optimicé las imágenes con sharp: redimensionadas a 400px de ancho y compresión PNG nivel 9. Resultado: de ~1MB cada una a ~50KB (reducción 95%).
- Creé el componente `KunturMascot.tsx` con: 8 estados de ánimo, burbuja de diálogo opcional, animaciones contextuales (risa se balancea, triste se inclina, enojado tiembla, sorprendido pulsa), y frases aleatorias en quechua/español por categoría (greeting, correct, wrong, streak, encourage, perfect).
- Integré Kuntur en:
  - **Pantalla de carga** (page.tsx): mood tímido mientras carga el estado.
  - **Ruta de aprendizaje** (LearnPath): Kuntur feliz/enamorado en el header con burbuja de diálogo contextual (saludo, racha, meta cumplida). Mood enamorado cuando streak >= 3.
  - **Reproductor de lecciones** (LessonPlayer):
    - Feedback correcto → Kuntur riendo + frase de ánimo en quechua.
    - Feedback incorrecto → Kuntur triste + respuesta correcta.
    - Sin corazones → Kuntur enojado + mensaje de tienda.
    - Pantalla de completado → Kuntur risa (perfecto) o feliz (normal) con burbuja de diálogo, Kuntur sorprendido al desbloquear logros.
  - **Perfil** (ProfileView): Kuntur guiñando (streak >= 3) o feliz junto al avatar.
  - **Ligas** (LeagueView): Kuntur risa (top 5) o tímido según el puesto.
- `bun run lint` pasa limpio (0 errores, 0 warnings).
- Verificación con Agent Browser: confirmé que las imágenes cargan (loaded: true) en ruta, feedback correcto (risa), feedback incorrecto (triste), pantalla de completado (feliz), liga (tímido) y perfil (feliz). Sin errores de consola ni runtime.

Stage Summary:
- Kuntur, la mascota cóndor, ya está vivo en toda la app con 8 emociones reactivas al contexto del usuario.
- Las frases de Kuntur mezclan quechua y español (allinllachu, sumaq, allin, rikuypuni) reforzando el aprendizaje.
- Imágenes optimizadas (~50KB c/u) para carga rápida.
- La mascota añade personalidad y refuerzo emocional positivo/negativo, mejorando la retención y engagement del usuario.
