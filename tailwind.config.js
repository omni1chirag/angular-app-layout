/** @type {import('tailwindcss').Config} */

export default {
    darkMode: "class",
    content: ['./src/**/*.{html,ts,scss,css}', './index.html'],
    plugins: [],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        }
    },
};
