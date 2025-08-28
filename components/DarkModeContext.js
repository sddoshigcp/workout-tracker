import { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem('darkMode');
        if (stored) setDark(stored === 'true');
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        sessionStorage.setItem('darkMode', dark);
    }, [dark]);

    return (
        <DarkModeContext.Provider value={{ dark, setDark }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    return useContext(DarkModeContext);
}