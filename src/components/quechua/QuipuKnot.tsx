"use client";

interface QuipuKnotProps {
  size?: number;
  className?: string;
}

/**
 * Ícono de Quipu (sistema andino de nudos para registrar información).
 * Representa los "Quipus tejidos" — la medida de progreso/sabiduría del usuario.
 * Reemplaza a las estrellas de XP en toda la app.
 */
export function QuipuKnot({ size = 20, className = "" }: QuipuKnotProps) {
  return (
    <img
      src="/kuntur/quipu.png"
      alt="Quipu"
      width={size}
      height={size}
      className={`object-contain inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
