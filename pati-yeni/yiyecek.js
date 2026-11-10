import {pantry} from './urunler.js';
export {names, pantry} from './urunler.js';

const foodArt = import.meta.glob('../assets/pati-yeni/sofra/*.webp', {eager: true, query: '?url', import: 'default'});
const workshopArt = import.meta.glob('../assets/pati-yeni/atolye/*.webp', {eager: true, query: '?url', import: 'default'});

export function foodUrl(id) {
  return foodArt['../assets/pati-yeni/sofra/' + id + '.webp'] || workshopArt['../assets/pati-yeni/atolye/' + id + '.webp'];
}

export function foodChoices(pet) {
  return Object.hasOwn(pantry, pet) ? [...pantry[pet]] : [];
}

export function foodOutcome(pet, id, wish) {
  if (!Object.hasOwn(pantry, pet) || !pantry[pet].includes(id)) return 'unsuitable';
  return id === wish ? 'favorite' : 'fresh';
}
