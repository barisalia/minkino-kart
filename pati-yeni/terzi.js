// These areas of the original body lie in front of the cloth.
const onParca={
 kus:['polygon(45% 10%,60% 14%,73% 48%,70% 75%,51% 68%,42% 42%)','polygon(37% 14%,50% 20%,74% 65%,56% 71%,36% 53%,28% 35%)','polygon(60% 22%,78% 36%,84% 64%,69% 73%,55% 51%)','polygon(37% 16%,50% 18%,70% 64%,55% 68%,38% 50%,28% 33%)','polygon(57% 13%,73% 24%,83% 52%,74% 71%,58% 64%,49% 42%)','polygon(38% 18%,57% 29%,76% 49%,60% 65%,40% 55%,30% 36%)'],
 ordek:[null,'polygon(19% 24%,56% 12%,70% 21%,63% 45%,37% 60%,13% 53%)',null,'polygon(28% 24%,59% 13%,65% 24%,58% 44%,38% 57%,25% 51%)','polygon(28% 40%,53% 16%,64% 15%,61% 40%,48% 61%,26% 62%)','polygon(21% 33%,51% 12%,64% 13%,61% 35%,38% 54%,19% 51%)']
};

export function terzi(kumas,model){
 Object.assign(kumas.style,{left:'50%',top:'0',width:'100%',height:'100%'});
 const on=onParca[model.tur];
 return Array.isArray(on)?on[model.temel]:on;
}
