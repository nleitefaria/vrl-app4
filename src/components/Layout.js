import React from 'react'
import Meta from './Meta';
import Header from './Header';
import Footer from './Footer';

import { Inter } from "next/font/google";


const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const Layout = ({ children }) => {
    return (
        <div className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
            <Meta></Meta>
            <Header></Header>
            <main className="flex-grow bg-[#f7f7f7]">{children}</main>
            <Footer></Footer>
        </div>
    )
}

export default Layout;