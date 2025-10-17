import { IDS, CLS } from "../constants/game";
import injectGameStyles from "./gameCss";

export function init() {
  injectGameStyles();
  // --- Props (antes: Astro.props)
  const pageShellId = IDS.pageShell;
  const backgroundRootId = IDS.backgroundRoot;
  const S = IDS.snake; // alias corto

  // --- Refs DOM
  const bgCanvas    = document.getElementById(S.bgCanvas)   as HTMLCanvasElement | null;
  const playCanvas  = document.getElementById(S.playCanvas) as HTMLCanvasElement | null;
  const layer       = document.getElementById(S.layer);
  const ctrlBtn     = document.getElementById(S.ctrl);
  const overlay     = document.getElementById(S.overlay);
  const exitBtn     = document.getElementById(S.exit);
  const takeoverBtn = document.getElementById(S.takeover);
  const pageShell   = document.getElementById(pageShellId);

  // Refs joystick (móvil)
  const joyBase  = document.getElementById(S.joyBase);
  const joyStick = document.getElementById(S.joyStick);

  // Si falta algo crítico, abortar silenciosamente
  if (!bgCanvas || !layer || !ctrlBtn || !overlay || !exitBtn || !playCanvas) return;

  // --- Accesibilidad / motion
  const mqReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reduce = !!mqReduce?.matches;
  mqReduce?.addEventListener?.('change', (e) => { reduce = e.matches; });

  // --- Helpers para ocultar el resto de la página bajo el overlay
  const keepIds: Set<string> = new Set([S.overlay, S.ctrl, S.layer, backgroundRootId]);

  const hidePage = () => {
    for (const el of Array.from(document.body.children)) {
      if (!keepIds.has(el.id)) {
        el.classList.add('page-hidden');
        el.setAttribute('inert', '');
      }
    }
  };

  const showPage = () => {
    for (const el of Array.from(document.body.children)) {
      if (!keepIds.has(el.id)) {
        el.classList.remove('page-hidden');
        el.removeAttribute('inert');
      }
    }
  };

  // --- Contextos 2D
  const bgCtx   = bgCanvas.getContext('2d',  { alpha: true })!;
  const playCtx = playCanvas.getContext('2d', { alpha: true })!;

  // --- Tema/colores dinámicos
  const mqDark = window.matchMedia?.('(prefers-color-scheme: dark)');
  const cssVar = (n: string, f = '') =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;

  const theme = () => {
    const primary   = cssVar('--heroui-primary-400',   '222 47% 50%');
    const secondary = cssVar('--heroui-secondary-400', '280 60% 55%');
    const isDark =
      document.documentElement.classList.contains('dark') || !!mqDark?.matches;

    return {
      isDark,
      snake: isDark ? `hsl(${primary})`   : 'rgba(2,6,23,1)',
      food : isDark ? `hsl(${secondary})` : 'rgba(2,6,23,1)',
    };
  };

  // Redibuja al cambiar tema/scheme
  mqDark?.addEventListener?.('change', () => drawAll());
  new MutationObserver(() => drawAll())
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // --- Tamaños / rejilla
  const DPR  = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const CELL = 24;
  let cols = 0, rows = 0, Wb = 0, Hb = 0;

  const sizeCanvas = (canvas: HTMLCanvasElement) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width  = w * DPR;
    canvas.height = h * DPR;
    return { w, h };
  };

  const resizePlayCanvas = () => {
    playCanvas.width  = bgCanvas.clientWidth  * DPR;
    playCanvas.height = bgCanvas.clientHeight * DPR;
    playCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };

  let grid: Uint8Array | null = null;

  const idx      = (x: number, y: number) => y * cols + x;
  const inBounds = (p: {x:number;y:number}) => p.x >= 0 && p.x < cols && p.y >= 0 && p.y < rows;
  const occAt    = (x: number, y: number) => grid![idx(x, y)] | 0;
  const setOcc   = (x: number, y: number, v: number) => { grid![idx(x, y)] = v ? 1 : 0; };

  const resizeAll = () => {
    const { w, h } = sizeCanvas(bgCanvas);
    Wb = w; Hb = h;
    bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const prevCols = cols;
    const prevRows = rows;

    cols = Math.max(10, Math.floor(Wb / CELL));
    rows = Math.max( 8, Math.floor(Hb / CELL));

    if ((prevCols !== cols || prevRows !== rows) && grid) rebuildGrid();

    if (overlayVisible()) resizePlayCanvas();
  };

  // --- Estado del juego
  let snake: Array<{x:number;y:number}> = [];
  let dir   = { x: 1, y: 0 };
  let food: {x:number;y:number} | null = null;
  let running    = true;
  let playerMode = false;

  const SPEED_AI     = 100;
  const SPEED_PLAYER = 200;
  let STEP_MS = SPEED_AI;

  let nextDir     = { x: 1, y: 0 };
  let turnQueued  = false;

  let acc      = 0;
  let prevTime = 0;
  const MAX_STEPS_PER_FRAME = 4;

  const rnd = () => ({ x: (Math.random() * cols) | 0, y: (Math.random() * rows) | 0 });

  // === A* helpers ===
  const manhattan = (a: {x:number;y:number}, b: {x:number;y:number}) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  class MinHeap<T extends {f:number}> {
    a: T[] = [];
    push(n: T) { this.a.push(n); this.up(this.a.length - 1); }
    pop(): T | null {
      if (!this.a.length) return null;
      const top = this.a[0];
      const end = this.a.pop()!;
      if (this.a.length) { this.a[0] = end; this.down(0); }
      return top;
    }
    empty() { return this.a.length === 0; }
    up(i: number) {
      const a = this.a;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p].f <= a[i].f) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    down(i: number) {
      const a = this.a, n = a.length;
      for (;;) {
        let l = i * 2 + 1, r = l + 1, m = i;
        if (l < n && a[l].f < a[m].f) m = l;
        if (r < n && a[r].f < a[m].f) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
  }

  // === Ocupación con tiempo: en cuántos pasos se libera cada celda ocupada ===
  const buildFreeTimes = () => {
    // freeAt[i] = nº de ticks (pasos) hasta que la celda i queda libre.
    // Para un segmento en posición j desde la cabeza (head=0), con snake.length = L,
    // su celda se libera tras (L - j) pasos (la cola sale primero en 1 paso).
    const L = snake.length;
    const freeAt = new Int16Array(cols * rows);
    freeAt.fill(0);

    for (let j = 0; j < L; j++) {
      const s = snake[j];
      if (!inBounds(s)) continue;
      const i = idx(s.x, s.y);
      const stepsUntilFree = L - j; // tail: 1, ... head: L
      freeAt[i] = stepsUntilFree;
    }

    return freeAt;
  };


  const rebuildGrid = () => {
    grid = new Uint8Array(cols * rows);
    for (const s of snake) if (inBounds(s)) setOcc(s.x, s.y, 1);
    if (food && !inBounds(food)) food = null;
  };

  const placeFood = () => {
    if (!grid) return;
    if (snake.length >= cols * rows) { food = null; return; }
    let p;
    do { p = rnd(); } while (occAt(p.x, p.y));
    food = p;
  };

  const resetSnake = () => {
    const start = { x: (cols / 3) | 0, y: (rows / 2) | 0 };
    snake = [start, { x: start.x - 1, y: start.y }, { x: start.x - 2, y: start.y }];
    rebuildGrid();
    dir = { x: 1, y: 0 };
    nextDir = dir; turnQueued = false;
    placeFood();
  };

  const findPath = (start: {x:number;y:number}, goal: {x:number;y:number} | null) => {
    if (!goal) return null;

    // Ocupación actual (1 = ocupado ahora)
    const body = new Uint8Array(grid!);

    // En cuántos pasos estará libre cada celda ocupada (0 si ya libre)
    const freeAt = buildFreeTimes();

    // Estructuras A*
    const OPEN  = new MinHeap<{x:number;y:number;f:number}>();
    const seen  = new Uint8Array(cols * rows);

    // gCost: coste (prioridad) con pequeña penalización por giro, como antes
    const gCost = new Float32Array(cols * rows); gCost.fill(1e9);

    // steps[i]: número entero de pasos (tiempo de llegada) hasta i
    const steps = new Int16Array(cols * rows);   steps.fill(0x7fff);

    const prevX = new Int16Array(cols * rows);   prevX.fill(-1);
    const prevY = new Int16Array(cols * rows);   prevY.fill(-1);

    const sIdx = idx(start.x, start.y);
    gCost[sIdx] = 0;
    steps[sIdx] = 0;

    // Pequeña preferencia por seguir recto (no afecta al tiempo, solo a la cola del heap)
    const straightPenalty = (fromX:number, fromY:number, toX:number, toY:number) => {
      const vx = toX - fromX, vy = toY - fromY;
      return (vx === dir.x && vy === dir.y) ? 0 : 1e-3;
    };

    OPEN.push({ x: start.x, y: start.y, f: manhattan(start, goal) });

    while (!OPEN.empty()) {
      const cur = OPEN.pop()!;
      const ci = idx(cur.x, cur.y);
      if (seen[ci]) continue;
      seen[ci] = 1;

      if (cur.x === goal.x && cur.y === goal.y) {
        // Reconstrucción del camino
        const path: Array<{x:number;y:number}> = [];
        let px = cur.x, py = cur.y;
        while (!(px === start.x && py === start.y)) {
          path.push({ x: px, y: py });
          const i = idx(px, py);
          const nx = prevX[i], ny = prevY[i];
          px = nx; py = ny;
        }
        path.reverse();
        return path;
      }

      const nbs = [
        [cur.x + 1, cur.y],
        [cur.x - 1, cur.y],
        [cur.x, cur.y + 1],
        [cur.x, cur.y - 1],
      ];

      for (let k = 0; k < 4; k++) {
        const nx = nbs[k][0], ny = nbs[k][1];
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        const ni = idx(nx, ny);
        if (seen[ni]) continue;

        // Tiempo de llegada si avanzamos a este vecino (un paso más)
        const arriveSteps = steps[ci] + 1;

        // Regla clave: podemos entrar si la celda estará libre a nuestra llegada.
        // body[ni] indica si AHORA está ocupada; freeAt[ni] dice cuándo dejará de estarlo.
        // Permitimos entrar si NO está ocupada o si arriveSteps >= freeAt[ni].
        if (body[ni] && arriveSteps < freeAt[ni]) continue;

        const tentativeG = gCost[ci] + 1 + straightPenalty(cur.x, cur.y, nx, ny);
        if (tentativeG < gCost[ni]) {
          gCost[ni] = tentativeG;
          steps[ni] = arriveSteps;
          prevX[ni] = cur.x; prevY[ni] = cur.y;
          const f = tentativeG + manhattan({ x: nx, y: ny }, goal);
          OPEN.push({ x: nx, y: ny, f });
        }
      }
    }
    return null;
  };


  // === Helpers añadidos: supervivencia / evaluación de salida ===

  const canReachTail = (from: {x:number;y:number}, willEat: boolean) => {
    const tail = snake[snake.length - 1];
    const freeTail = !willEat;
    let prev = 1;
    if (freeTail) {
      prev = occAt(tail.x, tail.y);
      setOcc(tail.x, tail.y, 0);
    }
    const ok = !!findPath(from, tail);
    if (freeTail) setOcc(tail.x, tail.y, prev);
    return ok;
  };

  const reachableCount = (from:{x:number;y:number}, willEat:boolean) => {
    const qx = new Int16Array(cols * rows);
    const qy = new Int16Array(cols * rows);
    let qs = 0, qe = 0;

    const visited = new Uint8Array(cols * rows);
    const tail = snake[snake.length - 1];
    const freeTail = !willEat;
    let prev = 1;
    if (freeTail) { prev = occAt(tail.x, tail.y); setOcc(tail.x, tail.y, 0); }

    const push = (x:number, y:number) => { const i = idx(x,y); if (visited[i]) return; visited[i]=1; qx[qe]=x; qy[qe]=y; qe++; };
    if (from.x>=0 && from.x<cols && from.y>=0 && from.y<rows && !occAt(from.x,from.y)) push(from.x,from.y);

    while (qs<qe) {
      const x = qx[qs], y = qy[qs]; qs++;
      const nbs = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
      for (let k=0;k<4;k++){
        const nx=nbs[k][0], ny=nbs[k][1];
        if (nx<0||nx>=cols||ny<0||ny>=rows) continue;
        const ii = idx(nx,ny);
        if (!visited[ii] && !occAt(nx,ny)) push(nx,ny);
      }
    }

    if (freeTail) setOcc(tail.x, tail.y, prev);

    let c=0;
    for (let i=0;i<visited.length;i++) c+=visited[i]?1:0;
    return c;
  };

  let survivalMode = false;

  // ===================== CAMINO/PLAN ÚNICO Y DIBUJO ========================
  let plannedPath: Array<{x:number;y:number}> | null = null; // <<< CAMBIO

  const drawPlannedPath = (ctx: CanvasRenderingContext2D) => { // <<< CAMBIO
    if (!plannedPath || !plannedPath.length || !snake.length || playerMode) return;
    const { isDark, food: cFood } = theme();
    const cx = (x:number) => x * CELL + CELL / 2;
    const cy = (y:number) => y * CELL + CELL / 2;

    ctx.save();
    ctx.globalAlpha = isDark ? 0.55 : 0.40;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = cFood as any;

    ctx.beginPath();
    ctx.moveTo(cx(snake[0].x), cy(snake[0].y));
    for (let i = 0; i < plannedPath.length; i++) {
      ctx.lineTo(cx(plannedPath[i].x), cy(plannedPath[i].y));
    }
    ctx.stroke();
    ctx.restore();
  };
  // ========================================================================

  // --- Dibujo
  const roundRect = (ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    const { isDark, snake: cSnake, food: cFood } = theme();
    const segA  = isDark ? 0.30 : 0.24;
    const headA = Math.min(1, segA + 0.10);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Cuerpo
    ctx.fillStyle = cSnake as any;
    ctx.globalAlpha = segA;
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      roundRect(ctx, s.x * CELL + 3, s.y * CELL + 3, CELL - 6, CELL - 6, 5);
      ctx.fill();
    }

    // Cabeza
    if (snake[0]) {
      const s = snake[0];
      ctx.globalAlpha = headA;
      roundRect(ctx, s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, 6);
      ctx.fill();
    }

    // Comida
    if (food) {
      ctx.fillStyle = cFood as any;
      ctx.globalAlpha = isDark ? 0.40 : 0.30;
      roundRect(ctx, food.x * CELL + 6, food.y * CELL + 6, CELL - 12, CELL - 12, 4);
      ctx.fill();
    }

    // Línea = exactamente el plan que seguirá la serpiente
    drawPlannedPath(ctx); // <<< CAMBIO

    ctx.globalAlpha = 1;
  };

  const drawAll = () => {
    render(bgCtx);
    if (overlayVisible()) render(playCtx);
  };

  // --- Overlay / input
  const overlayVisible = () => !overlay!.classList.contains('hidden');

  let ctrlOverrideUntil = 0;
  const forceShowCtrl = (ms = 4000) => {
    ctrlOverrideUntil = performance.now() + ms;
    ctrlBtn!.classList.remove('hidden', 'opacity-0', 'translate-y-2');
  };

  const openOverlay = () => {
    overlay!.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.body.classList.add(CLS.gameOpen);
    ctrlBtn!.classList.add('opacity-0', 'translate-y-2', 'hidden');

    requestAnimationFrame(() => {
      overlay!.classList.remove('opacity-0');
      resizeAll();
      resizePlayCanvas();
      render(playCtx);
      overlay!.setAttribute('aria-modal', 'true');
      (takeoverBtn ?? exitBtn)?.focus();
    });

    playerMode = false; STEP_MS = SPEED_AI;
    nextDir = dir; turnQueued = false;

    overlay!.classList.remove(CLS.playerMode);
    layer!.classList.add(CLS.gamePlay);

    pageShell?.classList.add('page-hidden');
    pageShell?.setAttribute('inert', '');
    hidePage();

    drawAll();
  };

  const takeControl = () => {
    playerMode = true; STEP_MS = SPEED_PLAYER;
    nextDir = dir; turnQueued = false;
    overlay!.classList.add(CLS.playerMode);
    exitBtn?.focus();
  };

  const closeOverlay = () => {
    overlay!.classList.add('opacity-0');
    setTimeout(() => overlay!.classList.add('hidden'), 300);

    document.body.style.overflow = '';
    document.body.classList.remove(CLS.gameOpen);

    playerMode = false; STEP_MS = SPEED_AI;
    overlay!.classList.remove(CLS.playerMode);

    ctrlBtn!.setAttribute('aria-pressed', 'false');
    layer!.classList.remove(CLS.gamePlay);

    pageShell?.classList.remove('page-hidden');
    pageShell?.removeAttribute('inert');
    showPage();

    drawAll();
    ctrlBtn?.focus();

    forceShowCtrl(5000);
    updateCtrlVisibility();
  };

  const sameDir = (a:{x:number;y:number}, b:{x:number;y:number}) => a && b && a.x === b.x && a.y === b.y;

  const onKey = (e: KeyboardEvent) => {
    if (!playerMode) return;
    if (e.repeat) return;

    const k = e.key.toLowerCase();
    let nd: {x:number;y:number} | null = null;

    if      (k === 'arrowup'    || k === 'w') nd = { x: 0, y: -1 };
    else if (k === 'arrowdown'  || k === 's') nd = { x: 0, y:  1 };
    else if (k === 'arrowleft'  || k === 'a') nd = { x: -1, y: 0 };
    else if (k === 'arrowright' || k === 'd') nd = { x: 1,  y: 0 };
    else if (k === 'escape') { closeOverlay(); return; }

    if (!nd) return;

    if (snake.length > 1 && (nd.x === -dir.x && nd.y === -dir.y)) return;
    if (sameDir(nd, dir) || sameDir(nd, nextDir)) return;

    if (!turnQueued) {
      nextDir = nd;
      turnQueued = true;
      e.preventDefault();
    }
  };

  // --- Joystick táctil
  let joyActive = false;
  let joyCenter = { x: 0, y: 0 };
  const BASE_R  = 56, STICK_R = 28, DEAD = 10;

  const setDirFromVector = (dx:number, dy:number) => {
    if (Math.hypot(dx, dy) < DEAD) return;

    const ang = Math.atan2(dy, dx);
    const deg = ang * 180 / Math.PI;

    let nd = dir;
    if      (deg > -45 && deg <=  45) nd = { x: 1,  y: 0 };
    else if (deg >  45 && deg <= 135) nd = { x: 0,  y: 1 };
    else if (deg <= -45 && deg > -135) nd = { x: 0,  y: -1 };
    else                               nd = { x: -1, y: 0 };

    if (snake.length > 1 && (nd.x === -dir.x && nd.y === -dir.y)) return;
    if (sameDir(nd, dir) || sameDir(nd, nextDir)) return;

    if (!turnQueued) { nextDir = nd; turnQueued = true; }
  };

  const moveStickTo = (dx:number, dy:number) => {
    const dist = Math.min(BASE_R - STICK_R, Math.hypot(dx, dy));
    const ang  = Math.atan2(dy, dx);
    const x    = Math.cos(ang) * dist;
    const y    = Math.sin(ang) * dist;
    if ((joyStick as HTMLElement | null)?.style) {
      (joyStick as HTMLElement).style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
  };

  const resetStick = () => {
    if ((joyStick as HTMLElement | null)?.style) {
      (joyStick as HTMLElement).style.transform = 'translate(-50%, -50%)';
    }
  };

  const joyTouchStart = (ev: TouchEvent) => {
    if (!playerMode) return;
    joyActive = true;

    const t = ev.touches[0];
    const rect = (document.getElementById('joy-base') as HTMLElement).getBoundingClientRect();
    joyCenter.x = rect.left + rect.width  / 2;
    joyCenter.y = rect.top  + rect.height / 2;

    const dx = t.clientX - joyCenter.x;
    const dy = t.clientY - joyCenter.y;

    moveStickTo(dx, dy);
    setDirFromVector(dx, dy);
    ev.preventDefault();
  };

  const joyTouchMove = (ev: TouchEvent) => {
    if (!joyActive) return;
    const t = ev.touches[0];
    const dx = t.clientX - joyCenter.x;
    const dy = t.clientY - joyCenter.y;

    moveStickTo(dx, dy);
    setDirFromVector(dx, dy);
    ev.preventDefault();
  };

  const joyTouchEnd = () => { joyActive = false; resetStick(); };

  if (joyBase && joyStick) {
    joyBase.addEventListener('touchstart', joyTouchStart, { passive: false });
    window.addEventListener('touchmove',   joyTouchMove,  { passive: false });
    window.addEventListener('touchend',    joyTouchEnd,   { passive: true  });
    window.addEventListener('touchcancel', joyTouchEnd,   { passive: true  });
  }

  // --- IA auxiliar "segura"
  const safeDirs = (head: {x:number;y:number}) => {
    const opts = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];

    opts.sort((a, b) =>
      ((a.x === dir.x && a.y === dir.y) ? -1 : 0) -
      ((b.x === dir.x && b.y === dir.y) ? -1 : 0)
    );

    const cands: Array<{x:number;y:number}> = [];
    for (const d of opts) {
      const nx = head.x + d.x, ny = head.y + d.y;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !occAt(nx, ny)) {
        cands.push(d);
      }
    }

    if (food) {
      cands.sort((d1, d2) => {
        const n1 = { x: head.x + d1.x, y: head.y + d1.y };
        const n2 = { x: head.x + d2.x, y: head.y + d2.y };
        return (Math.abs(n1.x - food!.x) + Math.abs(n1.y - food!.y))
             - (Math.abs(n2.x - food!.x) + Math.abs(n2.y - food!.y));
      });
    }

    return cands;
  };

  // --- Colisión con el cuerpo estricta
  const hitsBodyStrict = (nextHead: {x:number;y:number}, willEat: boolean) => {
    const tailMoves = !willEat;
    for (let i = 0; i < snake.length - (tailMoves ? 1 : 0); i++) {
      const s = snake[i];
      if (s.x === nextHead.x && s.y === nextHead.y) return true;
    }
    return false;
  };

  // --- Simulación de 1 tick
  const simulateTick = () => {
    // Sanity: asegura consistencia grid ↔ snake
    {
      let mismatch = false;
      if (grid) {
        for (let i = 0; i < snake.length; i++) {
          const s = snake[i];
          if (!inBounds(s) || !occAt(s.x, s.y)) { mismatch = true; break; }
        }
      }
      if (mismatch) { rebuildGrid(); }
    }

    const head = snake[0];

    // === USAR SIEMPRE EL MISMO PLAN PARA MOVER Y DIBUJAR ===
    // Si hay plan y el primer paso sigue siendo válido, síguelo.
    let decided = false; // <<< CAMBIO
    if (!playerMode && plannedPath && plannedPath.length) { // <<< CAMBIO
      const step0 = plannedPath[0];
      const wantDir = { x: step0.x - head.x, y: step0.y - head.y };
      const nextHeadTry = { x: head.x + wantDir.x, y: head.y + wantDir.y };
      const willEatTry = !!(food && nextHeadTry.x === food.x && nextHeadTry.y === food.y);

      if (inBounds(nextHeadTry) && !hitsBodyStrict(nextHeadTry, willEatTry)) {
        nextDir = wantDir;
        decided = true;
      } else {
        plannedPath = null; // primer paso ya no vale → invalidar plan
      }
    }

    if (!playerMode && !decided) {
      // === IA original: decide y, ADEMÁS, fija plannedPath = lo decidido ===
      survivalMode = false;
      // 1) A comida si no encierra
      const pathToFood = findPath(head, food);
      if (pathToFood && pathToFood.length) {
        const next = pathToFood[0];
        const willEatNext = !!(food && next.x === food.x && next.y === food.y);
        if (canReachTail(next, willEatNext)) {
          nextDir = { x: next.x - head.x, y: next.y - head.y };
          plannedPath = pathToFood.slice(); // <<< CAMBIO
          decided = true;
        }
      }

      // 2) A la cola
      if (!decided) {
        survivalMode = true;
        const tail = snake[snake.length - 1];
        const pathToTail = findPath(head, tail);
        if (pathToTail && pathToTail.length) {
          const next = pathToTail[0];
          nextDir = { x: next.x - head.x, y: next.y - head.y };
          plannedPath = pathToTail.slice(); // <<< CAMBIO
          decided = true;
        }
      }

      // 3) Último recurso: paso seguro con más espacio
      if (!decided) {
        const candidates = safeDirs(head);
        if (candidates.length) {
          let best = candidates[0];
          let bestScore = -1;
          for (const d of candidates) {
            const n = { x: head.x + d.x, y: head.y + d.y };
            const willEatNext = !!(food && n.x === food.x && n.y === food.y);
            const score = reachableCount(n, willEatNext);
            if (score > bestScore) { bestScore = score; best = d; }
          }
          nextDir = best;
          plannedPath = [{ x: head.x + best.x, y: head.y + best.y }]; // <<< CAMBIO
          decided = true;
        } else {
          resetSnake(); return;
        }
      }
    }

    // Ejecutar movimiento
    dir = nextDir;
    const nextHead = { x: head.x + dir.x, y: head.y + dir.y };
    if (!inBounds(nextHead)) { resetSnake(); return; }

    const willEat = !!(food && nextHead.x === food.x && nextHead.y === food.y);

    if (hitsBodyStrict(nextHead, willEat)) { resetSnake(); return; }

    snake.unshift(nextHead);
    setOcc(nextHead.x, nextHead.y, 1);

    // Consumir el paso del plan si coincide; si no coincide, invalidar plan (seguridad)
    if (plannedPath && plannedPath.length) { // <<< CAMBIO
      if (plannedPath[0].x === nextHead.x && plannedPath[0].y === nextHead.y) {
        plannedPath.shift();
      } else {
        plannedPath = null;
      }
    }

    if (willEat) {
      placeFood();
      plannedPath = null; // la comida cambió la topología: replantear en el próximo tick // <<< CAMBIO
    } else {
      const old = snake.pop()!;
      setOcc(old.x, old.y, 0);
    }

    // Modo supervivencia: posible salida si ahora hay camino seguro a comida
    if (!playerMode && survivalMode) {
      const pathToFoodNow = findPath(snake[0], food);
      if (pathToFoodNow && pathToFoodNow.length) {
        const n1 = pathToFoodNow[0];
        const willEatNext = !!(food && n1.x === food.x && n1.y === food.y);
        if (canReachTail(n1, willEatNext)) {
          survivalMode = false;
        }
      }
    }

    turnQueued = false;
  };

  // --- Loop de animación
  const step = (now: number) => {
    if (!running) { prevTime = now; requestAnimationFrame(step); return; }
    if (prevTime === 0) prevTime = now;

    let dt = now - prevTime;
    if (dt > 500) dt = 0;
    prevTime = now;

    acc += dt;

    let ticks = Math.min(MAX_STEPS_PER_FRAME, Math.floor(acc / STEP_MS));
    while (ticks-- > 0) {
      acc -= STEP_MS;
      simulateTick();
    }

    drawAll();
    requestAnimationFrame(step);
  };

  // --- FAB por scroll (ANULADO: no mostrar/ocultar por umbral)
  const updateCtrlVisibility = () => {
    // Intencionadamente vacío para desactivar el toggle por scroll.
    // Deja el estado del botón como esté (solo overlay podrá tocarlo).
  };

  // --- Init
  resizeAll();
  grid = new Uint8Array(Math.max(1, cols * rows));
  resetSnake();
  drawAll();

  prevTime = 0; acc = 0;

  if (!reduce && (overlayVisible() || document.visibilityState === 'visible')) {
    requestAnimationFrame(step);
  }

  // --- Eventos globales
  window.addEventListener('resize', () => {
    resizeAll();
    if (overlayVisible()) resizePlayCanvas();

    snake = snake.filter(inBounds);
    rebuildGrid();
    if (!snake.length) resetSnake();

    drawAll();
    updateCtrlVisibility();
  });

  window.addEventListener('orientationchange', () => {
    if (overlayVisible()) resizePlayCanvas();
    drawAll();
  });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    prevTime = 0; acc = 0;
    if (running && !reduce) requestAnimationFrame(step);
  });

  window.addEventListener('scroll', () => {
    ctrlOverrideUntil = 0;
    updateCtrlVisibility();
  }, { passive: true });

  window.addEventListener('keydown', onKey, { passive: false });

  // Controles de overlay
  ctrlBtn!.addEventListener('click', openOverlay);
  exitBtn!.addEventListener('click',  closeOverlay);
  takeoverBtn?.addEventListener('click', takeControl);

  updateCtrlVisibility();
}
