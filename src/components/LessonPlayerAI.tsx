'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Mic, Volume2, Check, X } from 'lucide-react';
import {
  generarPreguntaDinamica,
  corregirPronunciacion,
  generarFeedbackInteligente,
  PreguntaDinamica,
  FeedbackInteligente,
} from '@/lib/quechua/motor-ia';

interface LessonPlayerAIProps {
  leccion: string;
  tema: string;
  nivel?: 'principiante' | 'intermedio' | 'avanzado';
}

export function LessonPlayerAI({
  leccion,
  tema,
  nivel = 'principiante',
}: LessonPlayerAIProps) {
  const [pregunta, setPregunta] = useState<PreguntaDinamica | null>(null);
  const [cargando, setCargando] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [feedback, setFeedback] = useState<FeedbackInteligente | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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
  }, []);

  // Cargar pregunta dinámica
  const cargarPregunta = async () => {
    setCargando(true);
    setFeedback(null);
    setMostrarFeedback(false);
    setRespuestaUsuario('');

    try {
      const nuevaPregunta = await generarPreguntaDinamica(
        leccion,
        tema,
        nivel,
        pregunta ? [pregunta.pregunta] : []
      );
      setPregunta(nuevaPregunta);
    } catch (error) {
      console.error('Error cargando pregunta:', error);
      alert('No se pudo cargar la pregunta. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Iniciar grabación de voz
  const iniciarGrabacion = () => {
    if (recognitionRef.current) {
      setRespuestaUsuario('');
      recognitionRef.current.start();
    }
  };

  // Procesar respuesta
  const procesarRespuesta = async () => {
    if (!pregunta || !respuestaUsuario.trim()) {
      alert('Por favor responde primero');
      return;
    }

    setCargando(true);
    try {
      const nuevoFeedback = await generarFeedbackInteligente(
        respuestaUsuario,
        pregunta.respuestaCorrecta,
        leccion,
        pregunta.explicacion
      );

      setFeedback(nuevoFeedback);
      setMostrarFeedback(true);

      if (nuevoFeedback.esCorrecto) {
        setPuntos(puntos + nuevoFeedback.puntos);
      }
    } catch (error) {
      console.error('Error procesando respuesta:', error);
      alert('No se pudo procesar tu respuesta. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Reproducir pronunciación
  const reproducirPronunciacion = async () => {
    if (!pregunta?.pronunciacionQuechua) return;

    try {
      const utterance = new SpeechSynthesisUtterance(
        pregunta.pronunciacionQuechua
      );
      utterance.lang = 'es-PE';
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error reproduciendo audio:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-amber-900">{leccion}</h2>
        <p className="text-lg text-amber-700">Tema: {tema}</p>
        <p className="text-2xl font-bold text-amber-600">Puntos: {puntos} 🎯</p>
      </div>

      {/* Pregunta */}
      {!pregunta ? (
        <Card className="p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <p className="text-gray-600 mb-4">
            ¿Listo para aprender? Haz clic abajo para comenzar
          </p>
          <Button
            onClick={cargarPregunta}
            disabled={cargando}
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              '🎓 Comenzar Lección'
            )}
          </Button>
        </Card>
      ) : (
        <>
          {/* Pregunta Card */}
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold text-amber-900 flex-1">
                  {pregunta.pregunta}
                </h3>
                {pregunta.pronunciacionQuechua && (
                  <Button
                    onClick={reproducirPronunciacion}
                    variant="outline"
                    size="sm"
                    className="ml-2 border-amber-300"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Opciones */}
              {pregunta.opciones && pregunta.opciones.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  {pregunta.opciones.map((opcion, idx) => (
                    <Button
                      key={idx}
                      onClick={() => setRespuestaUsuario(opcion)}
                      variant={
                        respuestaUsuario === opcion ? 'default' : 'outline'
                      }
                      className={
                        respuestaUsuario === opcion
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'border-amber-200 hover:bg-amber-50'
                      }
                    >
                      {opcion}
                    </Button>
                  ))}
                </div>
              )}

              {/* Input de respuesta o micrófono */}
              {!pregunta.opciones || pregunta.opciones.length === 0 ? (
                <div className="flex gap-2 mt-6">
                  <input
                    type="text"
                    value={respuestaUsuario}
                    onChange={(e) => setRespuestaUsuario(e.target.value)}
                    placeholder="Escribe o usa el micrófono"
                    className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <Button
                    onClick={iniciarGrabacion}
                    disabled={grabando}
                    variant="outline"
                    className={
                      grabando
                        ? 'bg-red-100 border-red-300'
                        : 'border-amber-200'
                    }
                  >
                    <Mic
                      className={`h-4 w-4 ${grabando ? 'animate-pulse' : ''}`}
                    />
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={procesarRespuesta}
              disabled={cargando || !respuestaUsuario.trim()}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Evaluando...
                </>
              ) : (
                'Enviar Respuesta ✓'
              )}
            </Button>

            {mostrarFeedback && (
              <Button
                onClick={() => {
                  cargarPregunta();
                  setMostrarFeedback(false);
                }}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Siguiente Pregunta →
              </Button>
            )}
          </div>

          {/* Feedback */}
          {mostrarFeedback && feedback && (
            <Card
              className={`p-6 border-2 ${
                feedback.esCorrecto
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {feedback.esCorrecto ? (
                    <>
                      <Check className="h-6 w-6 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        ¡Correcto!
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="h-6 w-6 text-red-600" />
                      <span className="text-xl font-bold text-red-600">
                        Casi, intenta de nuevo
                      </span>
                    </>
                  )}
                </div>

                <p className="text-lg font-semibold text-gray-800">
                  {feedback.feedback}
                </p>

                <p className="text-gray-700">{feedback.consejo}</p>

                {feedback.esCorrecto && (
                  <p className="text-lg font-bold text-green-600">
                    +{feedback.puntos} puntos 🎉
                  </p>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
