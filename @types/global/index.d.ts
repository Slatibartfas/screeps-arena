/**
 * Minimal placeholder global type definitions to satisfy the compiler.
 * This file intentionally keeps things permissive; add project-specific
 * global types here if needed.
 */

declare global {
  const global: any;

  interface Console {
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
  }

  const console: Console;

  // Minimal RoomPosition shape used by example arenas.
  interface RoomPosition {
    x: number;
    y: number;
  }
}

export {};
