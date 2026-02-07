import {useCallback, useRef} from "react";

// Hook only handles sending messages to Qt and setting up callbacks
export function useWebAssemblyBenchmarkModule() {
    const qtModuleRef = useRef<any>(null);
    const callbacksRef = useRef<{
        sendToReact?: (msg: string) => void;
    }>({});

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
    }, []);

    // Register callback for receiving messages from Qt
    const onMessageFromQt = useCallback((cb: (msg: string) => void) => {
        callbacksRef.current.sendToReact = cb;
    }, []);

    // Number is directly passed as an argument on the stack
    const sendNumberToQt = (value: number) => {
        const Module = qtModuleRef.current;
        if (!Module || !Module._receiveNumberFromJS) return;

        Module._receiveNumberFromJS(value);
    };

    // JS Strings are objects in memory (not linear) and wasm only knows linear memory so the JS string needs to be encoded and memory needs to be allocated in wasm to hold those bytes + make sure to free that memory again
    // For this function to work the WASM app needs to be compiled with QT_WASM_EXTRA_EXPORTED_METHODS = ccall,cwrap,stringToUTF8,lengthBytesUTF8 and EXPORTED_FUNCTIONS=_main,_malloc,_free
    // Config file location: Qt\6.10.0\wasm_multithread\mkspecs\features\wasm\wasm.prf
    const sendStringToQt = (str: string) => {
        const Module = qtModuleRef.current;

        if (!Module) return;

        // Allocate enough bytes for UTF-8 string + null terminator
        const size = Module.lengthBytesUTF8(str) + 1;
        const ptr = Module._malloc(size);

        // Copy JS string into WASM app
        Module.stringToUTF8(str, ptr, size);

        // Call Qt function
        Module._receiveStringFromJS(ptr);

        // Free memory
        Module._free(ptr);
    };


    return {
        sendNumberToQt,
        sendStringToQt,
        setupCallbacks,
        onMessageFromQt,
        qtModule: qtModuleRef.current,
    };
}
