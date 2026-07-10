import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LeccionesNavigation() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Link href="/lecciones-ia" className="flex-1">
        <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
          🤖 Lecciones con IA
        </Button>
      </Link>
      <Link href="/lecciones" className="flex-1">
        <Button variant="outline" className="w-full border-amber-300 hover:bg-amber-50">
          📚 Lecciones Clásicas
        </Button>
      </Link>
    </div>
  );
}
