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

---
Task ID: 11 (Eliminar fondo verde de Kuntur)
Agent: Z.ai Code (main)
Task: Eliminar el fondo verde de las 8 imágenes de la mascota Kuntur

Work Log:
- Intento 1 (SDK z-ai image-edit): Usé el modelo de IA para "remover el fondo verde". Las imágenes se procesaron en ~16s c/u, pero el VLM reveló que la IA reemplazó el verde con blanco (3 canales RGB, 0% transparente) en lugar de hacerlo transparente. Enfoque descartado.
- Análisis del color de fondo: Muestreé las esquinas de las imágenes originales y descubrí que el "verde" es en realidad verde lima/amarillento: RGB(181, 207, 105). La fórmula naive de "greenness = G - max(R,B)" solo daba ~27, insuficiente para detectarlo.
- Intento 2 (chroma key por distancia al color de fondo): Implementé un script que:
  1. Muestrea el color de fondo promedio de la esquina superior izquierda (10x10 píxeles) de cada imagen.
  2. Para cada píxel calcula la distancia euclidiana al color de fondo.
  3. distancia < 45 → totalmente transparente (alpha=0).
  4. distancia 45-75 → anti-aliasing suave (alpha interpolado).
  5. distancia > 75 → opaco (el personaje).
- Resultado: 63-76% de píxeles transparentes por imagen. El personaje se preserva intacto con anti-aliasing limpio en los bordes.
- Verificación de transparencia: Componiendo feliz.png sobre un fondo rojo puro, el VLM confirmó que el fondo se ve rojo (transparencia real confirmada, no blanco).
- Optimización: Las imágenes se redimensionaron a 400px y se guardaron como PNG RGBA optimizado (88-189 KB c/u).
- Verificación visual con Agent Browser + VLM en 4 contextos:
  1. Ruta de aprendizaje (Kuntur feliz sobre fondo crema): "blends cleanly with the page with no colored box" ✓
  2. Feedback correcto (Kuntur riendo sobre barra verde clara): "blends cleanly with the light green bar with no box" ✓
  3. Feedback incorrecto (Kuntur triste sobre barra rosa): "blends cleanly with the pink bar with no box" ✓
  4. Sin corazones (Kuntur enojado sobre barra roja): "blends cleanly with the red/pink feedback bar" ✓
- `bun run lint` pasa limpio. Sin errores de consola ni runtime.

Stage Summary:
- El fondo verde de las 8 imágenes de Kuntur fue eliminado definitivamente usando chroma key programático (más preciso que la IA para fondos de color sólido).
- Kuntur ahora se integra limpiamente sobre cualquier color de fondo en la app (verde, rojo, rosa, crema) sin cajas ni halos de color.
- Las imágenes son PNG RGBA con ~65-76% de transparencia, optimizadas a 400px (88-189 KB c/u).
- Script reutilizable en scripts/chroma-key-kuntur.ts por si se añaden más emociones de Kuntur en el futuro.

---
Task ID: 12 (Monedas Inti reemplazan diamantes)
Agent: Z.ai Code (main)
Task: Reemplazar los diamantes/gemas por monedas Inti de oro con diseño del sol, estilo Duolingo 2D plano

Work Log:
- Generé la moneda Inti con el SDK de generación de imágenes (z-ai image). Prompt: moneda de oro circular con degradado, borde dorado oscuro estilo 3D (como botones Duolingo), diseño de sol Inca en el centro (cara redonda con rayos triangulares), contornos negros bold, 2D plano vectorial, fondo blanco sólido. Tamaño 1024x1024.
- Verifiqué con VLM: "Yes, it is a 2D flat cartoon gold coin with a sun design. The sun design is clearly visible in the center, the background is white, and it has a Duolingo-style appearance."
- Procesé la imagen con chroma key (mismo enfoque que Kuntur): muestreé el color de fondo blanco de las esquinas (RGB 253,253,253), apliqué distancia euclidiana con HARD_DIST=50 (transparente) y SOFT_DIST=90 (anti-alias). Resultado: 22% transparente (el fondo es pequeño porque la moneda llena el frame). Verificado componiendo sobre rojo: el VLM confirmó "red" en las esquinas.
- Redimensioné a 256px y optimicé PNG (120 KB).
- Creé el componente reutilizable `IntiCoin.tsx` que renderiza la imagen con tamaño configurable.
- Reemplacé el ícono Gem/diamantes en toda la app:
  - **TopBar**: contador de intis con moneda dorada (antes diamante azul). Color cambiado a duo-yellow.
  - **ShopView**: contador de intis en el header, botones de precio con moneda Inti (antes diamante azul), mensajes toast "Intis insuficientes", pista "Gana intis completando lecciones y logros". Botones de precio ahora duo-btn-yellow.
  - **ProfileView**: tarjeta de estadísticas "Intis" con moneda (antes "Gemas" con diamante azul). Manejo especial para renderizar IntiCoin (img) en lugar de ícono lucide.
  - **LessonPlayer**: pantalla de completado muestra moneda Inti + "Intis" (antes 💠 + "Gemas"). Tarjeta ahora con fondo duo-yellow.
  - **content.ts**: logro "Ahorrador" cambia de "100 gemas 💠" a "100 intis ☀️".
  - **API routes**: mensajes de error "Gemas insuficientes" → "Intis insuficientes" (shop, heart).
- Mantuve el campo backend `gems` por simplicidad (solo cambió la capa de presentación).
- `bun run lint` pasa limpio (0 errores, 0 warnings).
- Verificación con Agent Browser + VLM en 4 contextos:
  1. TopBar: "a gold coin with a sun design showing 67" ✓
  2. Tienda: "currency counter shows a gold sun coin; price buttons show gold sun coins" ✓
  3. Perfil: "the card showing Intis has a gold sun coin icon" ✓
  4. Pantalla de completado: "the currency card shows a gold sun coin icon, labeled Intis" ✓
- Sin errores de consola ni runtime.

Stage Summary:
- Los diamantes/💎 fueron reemplazados por monedas Inti de oro con diseño del sol (estilo Duolingo 2D plano) en TODA la app.
- La moneda es temáticamente coherente: Inti es el dios sol inca, perfecto para una app de quechua.
- Componente IntiCoin reutilizable creado. Imagen optimizada (120 KB, 256px, PNG transparente).
- La moneda se ve dorada/amarilla (duo-yellow) en vez de azul, dándole más calidez andina a la interfaz.
- Script reutilizable en scripts/process-inti-coin.ts.

---
Task ID: 13 (Quipus reemplazan XP/estrellas)
Agent: Z.ai Code (main)
Task: Reemplazar las XP/estrellas por "Quipus tejidos" (nudos andinos) como medida de progreso/nivel

Work Log:
- Generé el ícono de quipu con z-ai image: prompt de quipu andino 2D plano estilo Duolingo, cuerda principal horizontal marrón con 4 cuerdas colgantes, cada una con 2-3 nudos en colores terracota/dorado/marrón, contornos bold, fondo blanco. Tamaño 1024x1024. (Hubo un error 500 de red temporal en el primer intento, reintenté con éxito.)
- Verifiqué con VLM: confirmó que es un quipu 2D flat cartoon estilo Duolingo con fondo blanco.
- Procesé con chroma key: el fondo era un blanco cálido RGB(250,241,231). Apliqué distancia euclidiana HARD=50/SOFT=90. Resultado: 53.8% transparente, 256x256px, 58 KB. Verificado componiendo sobre rojo: el VLM confirmó "red" en el fondo y el quipu intacto.
- Creé el componente reutilizable `QuipuKnot.tsx`.
- Reemplacé XP/⭐/Star por Quipus/🎋/QuipuKnot en toda la app:
  - **TopBar**: meta diaria ahora usa QuipuKnot (antes Target amarillo) + barra con gradiente naranja-ámbar. Texto "X/Y" sin "XP".
  - **LearnPath**: header muestra "quipus tejidos" con ícono QuipuKnot (antes "XP totales"). Nodo de lección completada con coronas muestra QuipuKnot (antes Star). Burbuja de Kuntur: "Meta del día cumplida 🎋" (antes ⭐).
  - **LessonPlayer**: pantalla de completado tiene tarjeta "Quipus" con ícono QuipuKnot (antes "XP ganado" con ⭐), en color naranja para diferenciarla de los Intis dorados.
  - **ProfileView**: tarjeta de stats "Quipus tejidos" con QuipuKnot (antes "XP totales" con Star amarilla). Barra de nivel muestra "Nivel X · Título" + QuipuKnot + "current/needed" (antes "XP"). Meta diaria: "Quipus tejidos hoy" con QuipuKnot (antes "Hoy has ganado ... XP" con Target).
  - **LeagueView**: "X quipus esta semana" (antes "X XP esta semana").
  - **content.ts**: logros renombrados: "Centurión/100 XP ⭐"→"Tejedor/100 quipus 🎋", "Estrella/500 XP 🌟"→"Maestro Tejedor/500 quipus 🧵", "Leyenda/1000 XP 💫"→"Leyenda/1000 quipus 💫". Item de tienda: "Doble XP (15 min)"→"Doble Quipus (15 min)", "Duplica tu XP"→"Duplica tus quipus tejidos".
  - **page.tsx**: indicador flotante "Doble Quipus activo" (antes "Doble XP activo").
  - **ShopView toast**: "¡Doble Quipus activado!" (antes "¡Doble XP activado!").
  - **gamification.ts**: comentarios actualizados ("Quipus tejidos" en vez de "XP").
- Bug encontrado y arreglado: removí `Target` del import de ProfileView pero aún se usaba en la tarjeta "Lecciones" → runtime ReferenceError. Lo restauré.
- `bun run lint` pasa limpio (0 errores, 0 warnings).
- Verificación con Agent Browser + VLM en 5 contextos:
  1. TopBar meta diaria: "quipu icon (brown/tan) instead of target/star" + "87 quipus tejidos" ✓
  2. LearnPath header: "quipus tejidos with quipu icon" + nodo completado "quipu icon instead of star" ✓
  3. Perfil: tarjeta "QUIPUS TEJIDOS" con quipu ✓, barra de nivel con quipu ✓, "Quipus tejidos hoy" ✓
  4. Pantalla completado: 'Quipus' con ícono quipu marrón (+25) e 'Intis' con moneda sol dorada (+7) ✓
  5. Logros: "Tejedor - Teje 100 quipus" ✓
  6. Tienda: item "Doble Quipus (15 min) - Duplica tus quipus tejidos por 15 minutos" ✓
- Sin errores de consola ni runtime.

Stage Summary:
- Las XP/estrellas fueron reemplazadas por "Quipus tejidos" en TODA la app. La metáfora: cada vez que aprendes, tejes un nudo más en tu quipu de sabiduría.
- El ícono de quipu (nudo andino marrón) reemplaza a la estrella amarilla en: barra superior, ruta de aprendizaje, perfil, pantalla de completado, logros.
- Paleta de color: los quipus usan tonos naranja/marrón (duo-orange + amber) para diferenciarse visualmente de los Intis dorados.
- Logros temáticos: "Tejedor" (100 quipus), "Maestro Tejedor" (500), "Leyenda" (1000).
- Componente QuipuKnot reutilizable creado. Imagen optimizada (58 KB, 256px, PNG transparente).
- El campo backend `xp` se mantuvo por simplicidad (solo cambió la capa de presentación y textos).
