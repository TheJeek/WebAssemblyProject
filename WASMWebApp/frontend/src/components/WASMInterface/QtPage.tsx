import React, {useEffect, useRef, useState} from "react";
import {Button} from "../ui/button.tsx";
import {useQtModule} from "../useQtModule.ts";
import {createFileURLs, extractZip, fetchDefaultZip} from "@/api/fileApi.ts";

export const QtPage : React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qtModuleHook = useQtModule();
    const [input, setInput] = useState("");

    useEffect(() => {
        let urls: Record<string, string> = {};
        let script: HTMLScriptElement | null = null;

        async function initMap() {
            const zipBlob = await fetchDefaultZip();
            const files = await extractZip(zipBlob);
            urls = createFileURLs(files);

            // Load JS from extracted zip
            script = document.createElement("script");
            script.src = urls["WASMQt.js"];
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

                // Locate files in the virtual zip (instead of public folder)
                Module.locateFile = (path: string) => urls[path] || path;

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
        }

        initMap();

        return () => {
            if (script) document.body.removeChild(script);
            if (containerRef.current) containerRef.current.innerHTML = "";

            // Revoke all blob URLs
            Object.values(urls).forEach(URL.revokeObjectURL);
        };
    }, []);

    const sendMessageToQt = () => {
        const message = input;
        qtModuleHook.sendStringToQt(message)
        setInput("");
    };

    return (<>
            <div style={{padding: "20px"}}>
                <section
                    style={{
                        maxWidth: "400px",
                        padding: "20px",
                        marginBottom: "10px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="border px-2 py-1 rounded"
                            placeholder="Send Message to Qt"
                        />
                        <Button
                            onClick={sendMessageToQt}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                        >
                            Send
                        </Button>
                    </div>
                </section>
                <div
                    ref={containerRef}
                    id="qt-container"
                    style={{
                        width: "90vw",
                        height: "80vh",
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
