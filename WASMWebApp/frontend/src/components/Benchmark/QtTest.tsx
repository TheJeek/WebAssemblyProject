import React, {useEffect, useRef, useState} from "react";
import {UseWebAssemblyBenchmarkModule} from "./useWebAssemblyBenchmarkModule.ts";

export const QtTest : React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const bridge = UseWebAssemblyBenchmarkModule();
    const [input, setInput] = useState("");

    useEffect(() => {
        const cleanup = bridge.onMessageFromQt((msg) => {
            console.log("Qt says:", msg);
        });

        return cleanup;
    }, []);

    /*const sendMessageToQt = () => {
        if (!iframeRef.current) return;

        const message = input;
        bridge.sendToQt(message);

        setInput(""); // clear input
    };*/

    const sendMessageToQt = () => {
        if (iframeRef.current?.contentWindow) {
            console.log("posting message")
            iframeRef.current.contentWindow.postMessage(
                { type: 'FROM_REACT', payload: 'Hello Qt WASM!' },
                '*' // Or specific origin for security
            );
        }
    };

    return (
        <div className="p-8 flex flex-col items-center space-y-4">
            <h1 className="text-2xl font-semibold mb-2">Qt WASM in React</h1>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="border px-2 py-1 rounded"
                    placeholder="Message to Qt"
                />
                <button
                    onClick={sendMessageToQt}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                >
                    Send
                </button>
            </div>

            <div></div>
            <iframe
                id={"qt-iframe"}
                ref={iframeRef}
                src="/qt/WASMQt.html"
                style={{ width: "1200px", height: "800px", border: "1px solid #ccc" }}
                title="Qt WASM App"
            />
        </div>
    );
}