import { useRef, useCallback } from "react";

// Hook only handles sending messages to Qt and setting up callbacks
export function useQtModule() {
    const qtModuleRef = useRef<any>(null);
    const callbacksRef = useRef<{ sendToReact?: (msg: string) => void }>({});

    const jsToQtQueue = useRef<string[]>([]);

    // Setup callbacks object for Qt
    const setupCallbacks = useCallback((Module: any) => {
        qtModuleRef.current = Module;

        Module.qtCallbacks = Module.qtCallbacks || {};

        Module.qtCallbacks.sendToQt = (msg: string) => {
            // Qt WASM runtime handles string marshaling internally
            if (Module._receiveMessageFromJS) {
                Module._receiveMessageFromJS(msg);
            } else {
                console.warn("Qt WASM module not ready yet");
            }
        };

        Module.qtCallbacks.sendToReact = (msg: string) => {
            if (callbacksRef.current.sendToReact) {
                callbacksRef.current.sendToReact(msg);
            }
        }

        Module.qtCallbacks.pullFromJsQueue = () => {
            if (!jsToQtQueue.current.length) return null;
            return jsToQtQueue.current.shift(); // Return first message
        };
        /*
        Module.qtCallbacks = {
            sendToReact: (msg: string) => {
                if (callbacksRef.current.sendToReact) {
                    callbacksRef.current.sendToReact(msg);
                }
            },
        };*/
    }, []);

    // Register callback for receiving messages from Qt
    const onMessageFromQt = useCallback((cb: (msg: string) => void) => {
        callbacksRef.current.sendToReact = cb;
    }, []);

    // Send string to Qt
    const sendToQt = useCallback((msg: string) => {
        jsToQtQueue.current.push(msg);
    }, []);

    const sendNumberToQt = (value: number) => {
        const Module = qtModuleRef.current;
        if (!Module || !Module._receiveNumberFromJS) return;

        Module._receiveNumberFromJS(value); // just pass the number
    };


    return {
        sendNumberToQt,
        sendToQt,
        setupCallbacks,
        onMessageFromQt,
        qtModule: qtModuleRef.current,
    };
}
