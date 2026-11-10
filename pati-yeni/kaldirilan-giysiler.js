// Retired cuts, grouped by the variants whose shop originally showed them first.
const kaldirilanlar = new Map();
for (const id of ["kirpi","kirpi-12"]) kaldirilanlar.set(id, ["atki","papatya"]);
for (const id of ["kirpi-2"]) kaldirilanlar.set(id, ["fular","cilekli"]);
for (const id of ["kirpi-3","kirpi-7","kirpi-16"]) kaldirilanlar.set(id, ["atki","cilekli"]);
for (const id of ["kirpi-4","kirpi-5","kirpi-6","kirpi-13","kirpi-14","kirpi-15"]) kaldirilanlar.set(id, ["atki","fular"]);
for (const id of ["kirpi-8","kirpi-17"]) kaldirilanlar.set(id, ["papatya","fular"]);
for (const id of ["kirpi-9","kirpi-10","kirpi-18","kirpi-19"]) kaldirilanlar.set(id, ["atki","yelek"]);
for (const id of ["kirpi-11","kirpi-20"]) kaldirilanlar.set(id, ["fular","yelek"]);
for (const id of ["geko","geko-9","geko-10","geko-18","geko-19"]) kaldirilanlar.set(id, ["yelek","ormanci"]);
for (const id of ["geko-2"]) kaldirilanlar.set(id, ["fular","cilekli"]);
for (const id of ["geko-3"]) kaldirilanlar.set(id, ["cilekli","ormanci"]);
for (const id of ["geko-4","geko-5","geko-8","geko-11","geko-13","geko-14","geko-17","geko-20"]) kaldirilanlar.set(id, ["fular","yelek"]);
for (const id of ["geko-6","geko-15"]) kaldirilanlar.set(id, ["fular","ormanci"]);
for (const id of ["geko-7","geko-16"]) kaldirilanlar.set(id, ["cilekli","yelek"]);
for (const id of ["geko-12"]) kaldirilanlar.set(id, ["ormanci","pelerin"]);
export function kaldirildi(model,key){
 if (model.tur==='kaplumbaga') return key!=='baslik';
 if (model.tur==='hamster') return key==='pelerin';
 if (model.tur==='geko' && ['atki','papatya'].includes(key)) return true;
 return kaldirilanlar.get(model.id)?.includes(key) ?? false;
}
