export const dekorlar=[
  {id:'cicek',ad:'Papatya saksısı',fiyat:6},
  {id:'saat',ad:'Güneş saat',fiyat:12},
  {id:'bayrak',ad:'Renkli bayraklar',fiyat:18},
] as const;
export type DekorId=typeof dekorlar[number]['id'];
