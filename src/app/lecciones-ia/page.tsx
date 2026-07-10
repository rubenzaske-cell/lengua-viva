'use client';

import React, { useState } from 'react';
import { LessonPlayerAI } from '@/components/LessonPlayerAI';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface Leccion {
  id: string;
  nombre: string;
  tema: string;
  descripcion: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  icon: string;
}

const LECCIONES_DISPONIBLES: Leccion[] = [
  {
    id: 'saludos',
    nombre: 'Saludos',
    tema: 'Greetings',
    descripcion: 'Aprende a saludar en Quechua de manera natural',
    nivel: 'principiante',
    icon: '👋',
  },
  {
    id: 'familia',
    nombre: 'La Familia',
    tema: 'Family Members',
    descripcion: 'Conoce los nombres de los miembros de la familia',
    nivel: 'principiante',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'numeros',
    nombre: 'Números',
    tema: 'Numbers 1-20',
    descripcion: 'Cuenta del 1 al 20 en Quechua',
    nivel: 'principiante',
    icon: '🔢',
  },
  {
    id: 'colores',
    nombre: 'Colores',
    tema: 'Colors',
    descripcion: 'Aprende los nombres de los colores',
    nivel: 'principiante',
    icon: '🎨',
  },
  {
    id: 'comida',
    nombre: 'Comida',
    tema: 'Food & Eating',
    descripcion: 'Vocabulario sobre alimentos típicos',
    nivel: 'intermedio',
    icon: '🍽️',
  },
  {
    id: 'animales',
    nombre: 'Animales',
    tema: 'Animals',
    descripcion: 'Conoce los animales de los Andes',
    nivel: 'intermedio',
    icon: '🦙',
  },
  {
    id: 'verbos',
    nombre: 'Verbos Comunes',
    tema: 'Common Verbs',
    descripcion: 'Los verbos más usados en Quechua',
    nivel: 'intermedio',
    icon: '⚡',
  },
  {
    id: 'cuerpo',
    nombre: 'Cuerpo Humano',
    tema: 'Body Parts',
    descripcion: 'Partes del cuerpo en Quechua',
    nivel: 'intermedio',
    icon: '🫀',
  },
  {
    id: 'tiempo',
    nombre: 'Tiempo',
    tema: 'Time & Seasons',
    descripcion: 'Días, meses y estaciones',
    nivel: 'avanzado',
    icon: '⏰',
  },
  {
    id: 'conversacion',
    nombre: 'Conversación',
    tema: 'Conversation',
    descripcion: 'Diálogos completos en Quechua',
    nivel: 'avanzado',
    icon: '💬',
  },
];

export default function LeccionesIAPage() {
  const [leccionActual, setLeccionActual] = useState<Leccion | null>(null);
  const [filtro, setFiltro] = useState<'todas' | 'principiante' | 'intermedio' | 'avanzado'>('todas');

  const leccionesFiltradas = LECCIONES_DISPONIBLES.filter(
    (l) => filtro === 'todas' || l.nivel === filtro
  );

  if (leccionActual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        {/* Botón volver */}
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setLeccionActual(null)}
            variant="outline"
            className="bg-white border-amber-300 hover:bg-amber-50"
          >
            ← Volver a Lecciones
          </Button>
        </div>

        {/* Motor de IA */}
        <LessonPlayerAI
          leccion={leccionActual.nombre}
          tema={leccionActual.tema}
          nivel={leccionActual.nivel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-amber-900 mb-3">
            🎓 Lecciones con IA
          </h1>
          <p className="text-xl text-amber-700">
            Aprende Quechua con preguntas dinámicas y reconocimiento de voz
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          {(['todas', 'principiante', 'intermedio', 'avanzado'] as const).map(
            (nivel) => (
              <Button
                key={nivel}
                onClick={() => setFiltro(nivel)}
                variant={filtro === nivel ? 'default' : 'outline'}
                className={
                  filtro === nivel
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                    : 'border-amber-300 hover:bg-amber-50'
                }
              >
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </Button>
            )
          )}
        </motion.div>

        {/* Grid de Lecciones */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {leccionesFiltradas.map((leccion, idx) => (
              <motion.div
                key={leccion.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                layoutId={leccion.id}
              >
                <Card
                  onClick={() => setLeccionActual(leccion)}
                  className="cursor-pointer overflow-hidden border-2 border-amber-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 bg-white group"
                >
                  <div className="relative p-6 min-h-[250px] flex flex-col justify-between bg-gradient-to-br from-amber-50 to-orange-50 group-hover:from-orange-50 group-hover:to-red-50 transition-colors">
                    {/* Icono Grande */}
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {leccion.icon}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-amber-900 mb-2">
                        {leccion.nombre}
                      </h3>
                      <p className="text-sm text-amber-700 mb-3">
                        {leccion.tema}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {leccion.descripcion}
                      </p>
                    </div>

                    {/* Badge Nivel */}
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          leccion.nivel === 'principiante'
                            ? 'bg-green-100 text-green-800'
                            : leccion.nivel === 'intermedio'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {leccion.nivel.charAt(0).toUpperCase() + leccion.nivel.slice(1)}
                      </span>
                      <span className="text-xl group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Mensaje si no hay lecciones */}
        {leccionesFiltradas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-xl text-amber-700">
              No hay lecciones disponibles en este nivel
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
