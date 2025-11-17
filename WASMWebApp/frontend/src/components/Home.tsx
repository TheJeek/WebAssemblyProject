import React, {useEffect, useRef} from "react";
import {QtPage} from "./WASMInterface/QtPage.tsx";

export const Home : React.FC = () => {

    const containerRef = useRef<HTMLDivElement>(null);

    // Early test to see if simply integrating the generated HTML would work => actual working Page on QtPage component
    useEffect(() => {
        fetch("/qt/WASMQt.html")
            .then((res) => res.text())
            .then((html) => {
                if (!containerRef.current) return;

                const temp = document.createElement("div");
                temp.innerHTML = html;

                // Extract and run script tags
                const scripts = temp.querySelectorAll("script");

                scripts.forEach((oldScript) => {
                    const newScript = document.createElement("script");
                    if (oldScript.src) {
                        newScript.src = oldScript.src;  // external script
                    } else {
                        newScript.innerHTML = oldScript.innerHTML; // inline script
                    }
                    document.body.appendChild(newScript);
                });

                // Remove scripts so they aren't double-rendered
                scripts.forEach((s) => s.remove());

                // Inject remaining HTML
                containerRef.current.innerHTML = temp.innerHTML;
            });
    }, []);

    return (<>
        <div className="App">
            <QtPage />
        </div>
    </>);
}