import { useEffect } from 'react';
import { init } from '../games/snake.ts';

/**
 * Componente “vacío” que solo inicializa el snake en el cliente.
 * Devuelve null para no renderizar nada en el DOM.
 * Tu snake.ts ya tiene protección anti-doble arranque (bootstrapped).
 */
export default function SnakeBoot() {
  useEffect(() => {
    init();
  }, []);

  return null;
}
