import metin from './salon-replikleri.json';
import {fisPuani,pizzaPuani,yanlisYaridakiMalzemeler,type PizzaFisi,type PizzaKivami,type PizzaParcasi} from './pizza-tabagi';

export function babaPizzaYorumu(ust:readonly PizzaParcasi[],fis:PizzaFisi,kivam:PizzaKivami){
  const uyum=fisPuani(ust,fis);
  if(uyum<3&&uyum<=pizzaPuani(kivam)){
    return yanlisYaridakiMalzemeler(ust,fis).length?metin['baba-pizza-yari']:metin['baba-pizza-ic'];
  }
  return metin[`baba-pizza-${kivam}`];
}
