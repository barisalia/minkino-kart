import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import './styles/ana.css';
import { oyunuBaslat } from './oyun';

const kok = document.getElementById('minkino-kartlar');
if (kok) oyunuBaslat(kok);
