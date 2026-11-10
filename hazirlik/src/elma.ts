// Sepette, beslenme kutusunda ve ilk ısırıktan sonra aynı elma.
const kontur = 'stroke="#181619" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const dal = '<path d="M77 48C79 33 76 24 71 17Q72 13 77 12C84 21 84 34 82 46Z" fill="#80563b"/><path d="M81 32Q87 9 112 13Q107 35 81 32Z" fill="#6cad56"/>';
function elmaGovde(isirik:boolean) {
  const omuz = 'M80 45C64 44 59 33 41 36C20 39 12 57 13 79C14 99 24 129 43 142C57 152 67 142 79 143C91 143 99 152 113 143C127 134 139 113 144 91';
  const sag = isirik ? 'Q132 93 126 82Q113 83 110 70Q97 64 105 51Q100 41 108 35' : 'C151 62 139 35 113 34Q110 34 108 35';
  return '<g '+kontur+'>'+dal+'<path d="'+omuz+sag+'C95 35 91 43 80 45Z" fill="#ed5046"/>'+(isirik?'<path d="M108 35Q100 41 105 51Q97 64 110 70Q113 83 126 82Q132 93 144 91C131 105 107 94 100 79C93 64 92 46 108 35Z" fill="#ffe7b7" stroke-width="1.9"/>':'')+'</g>';
}
export const elmaResmi=(isirildi=false)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="100%" height="100%">'+elmaGovde(isirildi)+'</svg>';
export const kapaliKutu='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 174"><g '+kontur+'><path d="M15 48Q14 30 39 25L210 14Q231 13 239 30L251 109Q254 134 231 141L57 162Q33 164 27 145Z" fill="#5bb79e"/><path d="M10 43Q8 25 31 20L209 8Q231 7 236 24L249 98Q251 117 231 121L53 142Q29 145 24 126Z" fill="#a1e2c6"/><path d="m91 135 61-7 1 10q0 6-7 7l-44 5q-7 1-8-5Z" fill="#ffcf61"/></g><g transform="translate(88 27) rotate(-5 42 47) scale(.55)">'+elmaGovde(false)+'</g></svg>';