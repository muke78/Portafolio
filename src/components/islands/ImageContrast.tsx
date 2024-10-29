import { useState, useEffect } from 'react';
import kdl from '../../img/kdl.webp'
import kdlWhite from '../../img/kdlWhite.webp'
import { darkThemes } from '../../utils/dataDarkThemes.astro'

export const ImageContrast = () => {
    const [currentTheme, setCurrentTheme] = useState<string>('light');

    useEffect(() => {

        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        setCurrentTheme(initialTheme);

        const handleThemeChange = () => {
            setCurrentTheme(document.documentElement.getAttribute('data-theme'));
        };

        const observer = new MutationObserver(handleThemeChange);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => observer.disconnect();
    }, []);
    const imageSrc = darkThemes.includes(currentTheme) ? kdlWhite : kdl;

    return (
        <div className="w-12 ">
            <img
                src={imageSrc.src}
                alt="Logotipo personal de Erick Gonzalez"
                aria-label="Logotipo personal de Erick Gonzalez"
                loading="lazy"
                className="transition-all duration-300 rounded-sm"
            />
        </div>
    );
};
