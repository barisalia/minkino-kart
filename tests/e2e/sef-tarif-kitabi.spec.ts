import { test, expect } from '@playwright/test';
import type { Yemek } from '../../sef/src/yemekler';
import { readFileSync } from 'node:fs';

const adimlar=JSON.parse(readFileSync(new URL('../../sef/src/tarif-adimlari.json',import.meta.url),'utf8')) as Record<Yemek,string[]>;

test('Yedi tarifin resimli sayfaları açılır ve son sayfadan seçilen mutfağa girilir',async({page})=>{
  await page.setViewportSize({width:740,height:360});
  const hatalar:string[]=[];
  page.on('pageerror',e=>hatalar.push(e.message));
  for(const id of Object.keys(adimlar) as Yemek[]){
    await page.goto('./sef/?test=1');
    const kart=page.getByRole('button',{name:'Resimli tarif kitabı'});
    await kart.click();
    const dialog=page.getByRole('dialog',{name:'Resimli tarifler'});
    await dialog.locator('[data-kitap-yemek="'+id+'"]').focus();
    await page.keyboard.press('Enter');
    for(let i=0;i<adimlar[id].length;i++){
      const resim=dialog.getByRole('img',{name:adimlar[id][i]});
      await expect(resim).toBeVisible();
      await resim.evaluate(async el=>{await (el as HTMLImageElement).decode();});
      await expect(dialog.locator('.kitap-noktalar')).toHaveAccessibleName((i+1)+' / 4');
      const sonraki=dialog.getByRole('button',{name:i===3?'Bu yemeği hazırla':'Sonraki adım'});
      await expect(sonraki).toBeFocused();
      await page.keyboard.press('Enter');
    }
    await expect(dialog).toHaveCount(0);
    if(id==='corba'||id==='salata'){
      await expect(page.locator('.mutfak-sahnesi')).toHaveAttribute('data-ekran','mutfak');
      await page.getByRole('button',{name:'Geri',exact:true}).click();
    }else if(id==='pizza'){
      await expect(page.locator('.firin-oyunu')).toBeVisible();
      await page.getByRole('button',{name:'Siparişlere dön',exact:true}).click();
    }else{
      await expect.poll(()=>page.evaluate(()=>localStorage.getItem('minkino-sef-acik-atolye'))).toBe(id);
      await page.keyboard.press('Escape');
    }
    await expect(kart).toBeVisible();
  }
  expect(hatalar).toEqual([]);
});
