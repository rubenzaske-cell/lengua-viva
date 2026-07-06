"use client";

interface IntiCoinProps {
  size?: number;
  className?: string;
}

/**
 * Moneda Inti de oro con diseño del sol (estilo Duolingo, 2D plano).
 * Reemplaza al ícono de diamantes en toda la app.
 */
export function IntiCoin({ size = 20, className = "" }: IntiCoinProps) {
  return (
    <img
      src="/kuntur/inti-coin.png"
      alt="Inti"
      width={size}
      height={size}
      className={`object-contain inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
