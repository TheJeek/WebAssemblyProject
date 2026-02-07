import React, {useEffect, useRef, useState} from "react";
import {Button} from "../ui/button.tsx";
import {useWebAssemblyBenchmarkModule} from "./useWebAssemblyBenchmarkModule.ts";
import {createFileURLs, extractZip, fetchDefaultZip} from "@/api/fileApi.ts";

export const WebAssemblyBenchmarkComponent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qtModuleHook = useWebAssemblyBenchmarkModule();
    const [input, setInput] = useState("");
    let qtModule: any = null;

    useEffect(() => {
        let urls: Record<string, string> = {};
        let script: HTMLScriptElement | null = null;

        async function initQt() {
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
                    qtModule = Module;
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

        initQt();

        return () => {
            if (qtModule?.quit) {
                qtModule.quit();
            }
            qtModule = null;

            if (script) {
                document.body.removeChild(script);
                script = null;
            }

            if (containerRef.current) {
                containerRef.current.innerHTML = "";
                containerRef.current = null;
            }

            Object.values(urls).forEach(URL.revokeObjectURL);
            urls = {};
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
                        height: "100vh",
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
