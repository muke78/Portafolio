import usa from '../img/usa.png';
import mxm from '../img/mxm.png';
import fr from '../img/france.png';

export const languages = {
    es: {
        label: "Español",
        img: mxm,
    },
    en: {
        label: "English",
        img: usa
    },
    fr: {
        label: "Frances",
        img: fr,
    }
};

export const defaultLang = 'es';

export const ui = {
    en: {},
    es: {},
    fr: {},
} as const;