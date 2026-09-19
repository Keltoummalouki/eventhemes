'use client';

import { useSyncExternalStore } from 'react';

/*
 * Windows n'affiche pas les drapeaux émoji : « 🇲🇦 » y devient « MA ». On le
 * détecte en dessinant un émoji sur un canevas (méthode reprise de
 * country-flag-emoji-polyfill, TalkJS, MIT) ; la police de drapeaux de
 * secours n'est alors appliquée, donc téléchargée, que là où il le faut.
 */

const EMOJI_FONTS =
  '"Twemoji Mozilla","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji","EmojiOne Color","Android Emoji",sans-serif';

let needed: boolean | undefined;

/** Un émoji en couleur ignore la couleur du texte : même pixel en blanc et en noir. */
function rendersInColor(emoji: string): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return true;
  context.textBaseline = 'top';
  context.font = `100px ${EMOJI_FONTS}`;
  context.scale(0.01, 0.01);
  const pixel = (color: string) => {
    context.clearRect(0, 0, 100, 100);
    context.fillStyle = color;
    context.fillText(emoji, 0, 0);
    return context.getImageData(0, 0, 1, 1).data.join(',');
  };
  const white = pixel('#fff');
  const black = pixel('#000');
  return white === black && !black.startsWith('0,0,0,');
}

function needsFlagFont(): boolean {
  if (needed === undefined) {
    try {
      needed = rendersInColor('😊') && !rendersInColor('🇨🇭');
    } catch {
      needed = false;
    }
  }
  return needed;
}

const subscribe = () => () => {};

/** Vrai quand les drapeaux émoji ont besoin de la police de secours. */
export function useFlagFont(): boolean {
  return useSyncExternalStore(subscribe, needsFlagFont, () => false);
}
