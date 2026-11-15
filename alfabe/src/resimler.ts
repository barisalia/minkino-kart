const dosyalar = import.meta.glob<string>('../../assets/alfabe/*.webp', {
  eager: true, query: '?url', import: 'default',
});

export function resim(id: string) {
  return dosyalar['../../assets/alfabe/' + id + '.webp'];
}
