// types/globals.d.ts
export {};

declare global {
  interface Window {
    ymaps?: any; // единственное место, где объявляем ymaps
  }
}
