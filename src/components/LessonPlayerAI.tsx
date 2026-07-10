'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mic, Volume2, Check, X, Zap, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreguntaDinamica {
  pregunta: string;
  tipo: 'seleccionar' | 'escribir' | 'escuchar' | 'pronunciar';
  opciones?: string[];
  respuestaCorrecta: string;
  explicacion: string;
  pronunciacionQuechua?: string;
}

interface FeedbackInteligente {
  esCorrecto: boolean;
  puntos: number;
  feedback: string;
  consejo: string;
  palabrasClave: string[];
}

interface LessonPlayerAIProps {
  leccion: string;
  tema: string;
  nivel?: 'principiante' | 'intermedio' | 'avanzado';
}

const PREGUNTAS_POR_LECCION = 12; // Tipo Duolingo

export function LessonPlayerAI({
  leccion,
  tema,
  nivel = 'principiante',
}: LessonPlayerAIProps) {
  const [preguntas, setPreguntas] = useState<PreguntaDinamica[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [grabando, setGrabando] = useState(false);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [feedback, setFeedback] = useState<FeedbackInteligente | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [puntosTotales, setPuntosTotales] = useState(0);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [leccionCompletada, setLeccionCompletada] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  // Inicializar Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-PE';

      recognitionRef.current.onstart = () => setGrabando(true);
      recognitionRef.current.onend = () => setGrabando(false);

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setRespuestaUsuario(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
      };
    }

    cargarPreguntas();
  }, []);

  // Cargar todas las preguntas
  const cargarPreguntas = async () => {
    setCargando(true);
    try {
      const nuevasPreguntas: PreguntaDinamica[] = [];
      for (let i = 0; i < PREGUNTAS_POR_LECCION; i++) {
        const preguntasAnteriores = nuevasPreguntas.map((p) => p.pregunta);
        const pregunta = await generarPregunta(leccion, tema, nivel, preguntasAnteriores);
        nuevasPreguntas.push(pregunta);
      }
      setPreguntas(nuevasPreguntas);
    } catch (error) {
      console.error('Error cargando preguntas:', error);
      alert('No se pudo cargar las preguntas. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Generar una pregunta vía API
  const generarPregunta = async (
    leccion: string,
    tema: string,
    nivel: string,
    preguntasAnteriores: string[]
  ): Promise<PreguntaDinamica> => {
    const res = await fetch('/api/motor-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generar_pregunta',
        leccion,
        tema,
        nivel,
        preguntasAnteriores,
      }),
    });

    if (!res.ok) throw new Error('Error generando pregunta');
    return res.json();
  };

  // Generar feedback vía API
  const generarFeedback = async (
    respuestaUsuario: string,
    respuestaCorrecta: string,
    leccion: string
  ): Promise<FeedbackInteligente> => {
    const res = await fetch('/api/motor-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generar_feedback',
        respuestaUsuario,
        respuestaCorrecta,
        leccion,
      }),
    });

    if (!res.ok) throw new Error('Error generando feedback');
    return res.json();
  };

  // Iniciar grabación
  const iniciarGrabacion = () => {
    if (recognitionRef.current) {
      setRespuestaUsuario('');
      recognitionRef.current.start();
    }
  };

  // Procesar respuesta
  const procesarRespuesta = async () => {
    if (!respuestaUsuario.trim()) {
      alert('Por favor responde primero');
      return;
    }

    setCargando(true);
    try {
      const preguntaActual = preguntas[indiceActual];
      const nuevoFeedback = await generarFeedback(
        respuestaUsuario,
        preguntaActual.respuestaCorrecta,
        leccion
      );

      setFeedback(nuevoFeedback);
      setMostrarFeedback(true);

      if (nuevoFeedback.esCorrecto) {
        setPuntosTotales(puntosTotales + nuevoFeedback.puntos);
        setRespuestasCorrectas(respuestasCorrectas + 1);
      }
    } catch (error) {
      console.error('Error procesando respuesta:', error);
      alert('Error al procesar tu respuesta');
    } finally {
      setCargando(false);
    }
  };

  // Siguiente pregunta
  const siguientePregunta = () => {
    if (indiceActual + 1 >= preguntas.length) {
      setLeccionCompletada(true);
    } else {
      setIndiceActual(indiceActual + 1);
      setRespuestaUsuario('');
      setMostrarFeedback(false);
      setFeedback(null);
    }
  };

  // Reproducir pronunciación
  const reproducirPronunciacion = async () => {
    const preguntaActual = preguntas[indiceActual];
    if (!preguntaActual?.pronunciacionQuechua) return;

    try {
      const utterance = new SpeechSynthesisUtterance(
        preguntaActual.pronunciacionQuechua
      );
      utterance.lang = 'es-PE';
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error reproduciendo audio:', error);
    }
  };

  // Pantalla de carga
  if (cargando && preguntas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-16 w-16 animate-spin text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-900 mb-2">
            Preparando tu lección...
          </h2>
          <p className="text-amber-700">Generando {PREGUNTAS_POR_LECCION} preguntas personalizadas</p>
        </motion.div>
      </div>
    );
  }

  // Lección completada
  if (leccionCompletada) {
    const porcentaje = (respuestasCorrectas / PREGUNTAS_POR_LECCION) * 100;
    const esSuperior = porcentaje >= 80;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            {esSuperior ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="text-8xl mb-4"
              >
                🏆
              </motion.div>
            ) : (
              <div className="text-8xl mb-4">⭐</div>
            )}
          </div>

          <h2 className="text-4xl font-extrabold text-amber-900 mb-4">
            ¡Lección Completada!
          </h2>

          <Card className="p-8 bg-white border-2 border-amber-200 mb-6">
            <div className="space-y-4">
              <div className="text-5xl font-extrabold text-amber-600">
                {puntosTotales}
              </div>
              <div className="text-lg text-gray-700">
                Puntos ganados
              </div>

              <div className="pt-4 border-t border-amber-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 font-semibold">Precisión:</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {porcentaje.toFixed(0)}%
                  </span>
                </div>
                <Progress value={porcentaje} className="h-2" />
              </div>

              <div className="pt-4 border-t border-amber-200 text-sm text-gray-600">
                <div className="flex justify-between mb-2">
                  <span>✅ Correctas:</span>
                  <span className="font-bold text-green-600">{respuestasCorrectas}</span>
                </div>
                <div className="flex justify-between">
                  <span>❌ Incorrectas:</span>
                  <span className="font-bold text-red-600">
                    {PREGUNTAS_POR_LECCION - respuestasCorrectas}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {esSuperior && (
            <motion.p
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-xl font-bold text-amber-600 mb-6"
            >
              ¡Excelente desempeño! 🎉
            </motion.p>
          )}

          <Button
            onClick={() => window.location.href = '/lecciones-ia'}
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white w-full"
          >
            ← Volver a Lecciones
          </Button>
        </motion.div>
      </div>
    );
  }

  if (preguntas.length === 0) return null;

  const preguntaActual = preguntas[indiceActual];
  const progreso = ((indiceActual + 1) / PREGUNTAS_POR_LECCION) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-extrabold text-amber-900">{leccion}</h2>
              <p className="text-amber-700 text-sm">{tema}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-xl font-bold text-amber-600">
                <Zap className="h-5 w-5" />
                {puntosTotales}
              </div>
            </div>
          </div>

          {/* Progreso */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-amber-700 mb-2">
              <span>Pregunta {indiceActual + 1} de {PREGUNTAS_POR_LECCION}</span>
              <span>{progreso.toFixed(0)}%</span>
            </div>
            <Progress value={progreso} className="h-3 bg-amber-100" />
          </div>
        </motion.div>

        {/* Pregunta */}
        <motion.div
          key={indiceActual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 bg-white border-2 border-amber-200 mb-6">
            <div className="space-y-6">
              {/* Pregunta */}
              <div className="flex items-start justify-between">
                <h3 className="text-2xl font-bold text-amber-900 flex-1">
                  {preguntaActual.pregunta}
                </h3>
                {preguntaActual.pronunciacionQuechua && (
                  <Button
                    onClick={reproducirPronunciacion}
                    variant="outline"
                    size="sm"
                    className="ml-4 border-amber-300 hover:bg-amber-50"
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Opciones */}
              {preguntaActual.opciones && preguntaActual.opciones.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {preguntaActual.opciones.map((opcion, idx) => (
                    <Button
                      key={idx}
                      onClick={() => setRespuestaUsuario(opcion)}
                      disabled={mostrarFeedback}
                      variant={
                        respuestaUsuario === opcion ? 'default' : 'outline'
                      }
                      className={`h-auto py-4 text-lg font-semibold ${
                        respuestaUsuario === opcion
                          ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                          : 'border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                      }`}
                    >
                      {opcion}
                    </Button>
                  ))}
                </div>
              )}

              {/* Input de texto o micrófono */}
              {(!preguntaActual.opciones || preguntaActual.opciones.length === 0) && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={respuestaUsuario}
                    onChange={(e) => setRespuestaUsuario(e.target.value)}
                    placeholder="Escribe o usa el micrófono"
                    disabled={mostrarFeedback}
                    className="flex-1 px-4 py-3 text-lg border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <Button
                    onClick={iniciarGrabacion}
                    disabled={grabando || mostrarFeedback}
                    variant="outline"
                    className={`px-4 ${
                      grabando
                        ? 'bg-red-100 border-red-300'
                        : 'border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <Mic
                      className={`h-5 w-5 ${grabando ? 'animate-pulse text-red-600' : ''}`}
                    />
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Botón Enviar */}
          {!mostrarFeedback && (
            <Button
              onClick={procesarRespuesta}
              disabled={cargando || !respuestaUsuario.trim()}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
            >
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Evaluando...
                </>
              ) : (
                '✓ Enviar Respuesta'
              )}
            </Button>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {mostrarFeedback && feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  className={`p-6 border-2 mt-6 ${
                    feedback.esCorrecto
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {feedback.esCorrecto ? (
                        <>
                          <Check className="h-8 w-8 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            ¡Correcto!
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-8 w-8 text-red-600" />
                          <span className="text-2xl font-bold text-red-600">
                            Casi...
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-lg font-semibold text-gray-800">
                      {feedback.feedback}
                    </p>

                    <p className="text-gray-700">{feedback.consejo}</p>

                    {feedback.esCorrecto && (
                      <p className="text-xl font-bold text-green-600 pt-2">
                        +{feedback.puntos} puntos 🎉
                      </p>
                    )}
                  </div>
                </Card>

                <Button
                  onClick={siguientePregunta}
                  size="lg"
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg"
                >
                  {indiceActual + 1 >= PREGUNTAS_POR_LECCION
                    ? 'Ver Resultados →'
                    : 'Siguiente Pregunta →'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
