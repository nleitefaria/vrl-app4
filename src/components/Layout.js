import React from 'react'

import { Inter } from "next/font/google";


const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const Layout = ({ children }) => {
    return (
        <div className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
            
            <header>header</header>
            <main className="flex-grow bg-[#f7f7f7]">{children}</main>
            <footer>footer</footer>
        </div>
    )
}

export default Layout;