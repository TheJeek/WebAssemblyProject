import React, {useEffect, useRef, useState} from "react";
import {Button} from "../ui/button.tsx";
import {useQtModule} from "../useQtModule.ts";

export const QtPage : React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);
    const qtModuleHook = useQtModule();
    const [input, setInput] = useState("");

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        const script = document.createElement("script");
        script.src = "/qt/WASMQt.js";
        script.async = true;

        script.onload = () => {
            const qtEntry = (window as any).WASMQt_entry;
            if (!qtEntry) {
                console.error("WASMQt_entry not found!");
                return;
            }

            // Create Module object
            const Module: any = {};
            // Provide the container for Qt windows
            Module.qtContainerElements = [containerRef.current];

            // So Qt can find WASM/data files (in public folder)
            Module.locateFile = (path: string) => `/qt/${path}`;

            // Callback when WASM runtime is ready
            Module.onRuntimeInitialized = () => {
                console.log("Qt WASM initialized");
                qtModuleHook.setupCallbacks(Module);
                qtModuleHook.onMessageFromQt((msg) => {
                    console.log("Message from Qt:", msg);
                })
            };

            // Initialize Qt
            qtEntry(Module);
        };

        document.body.appendChild(script);

        return () => {
            //Cleanup scripts on unmount
            document.body.removeChild(script);

            //Cleanup container to remove old Qt canvas
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, []);

    const sendMessageToQt = () => {
        const message = input;
        qtModuleHook.sendStringToQt(message)
        setInput("");
    };

    return (<>
            <div style={{padding: "50px"}}>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="border px-2 py-1 rounded"
                    placeholder="Send Number to Qt"
                />
                <Button
                    onClick={sendMessageToQt}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                >
                    Send
                </Button>
            </div>
                <div
                    ref={containerRef}
                    id="qt-container"
                    style={{
                        width: "90vw",
                        height: "80vh",
                        border: "1px solid blue",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        backgroundColor: "#000",
                    }}
                />
            </div>

        </>
    );
}
