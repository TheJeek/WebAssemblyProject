import { useRef, useCallback } from "react";

// Hook only handles sending messages to Qt and setting up callbacks
export function useQtMapModule() {
    const qtModuleRef = useRef<any>(null);
    const callbacksRef = useRef<{
        sendToReact?: (msg: string) => void;
        toggleDeleteFromQt?: () => void;
        addMarkerFromQt?: (lat: number, lon: number) => void;
        clearNNPathFromQt?: () => void;
        addPointToNNPathFromQt?: (lat: number, lon: number) => void;
        clearOptimizedNNFromQt?: () => void;
        addPointToOptimizedNNPathFromQt?: (lat: number, lon: number) => void;
        clearMSTPathFromQt?: () => void;
        addPointToMSTPathFromQt?: (lat: number, lon: number) => void;
        clearOptimizedMSTPathFromQt?: () => void;
        addPointToOptimizedMSTPathFromQt?: (lat: number, lon: number) => void;
        clearBFPathFromQt?: () => void;
        addPointToBFPathFromQt?: (lat: number, lon: number) => void;
        clearDPPathFromQt?: () => void;
        addPointToDPPathFromQt?: (lat: number, lon: number) => void;
        clearMSTFromQt?: () => void;
        addTrailToMSTFromQt?: (lat1: number, lon1: number, lat2: number, lon2: number) => void;
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

        // Add a callback for receiving a marker from Qt
        Module.qtCallbacks.addMarker = (lat: number, lon: number) => {
            if (callbacksRef.current.addMarkerFromQt) {
                callbacksRef.current.addMarkerFromQt(lat, lon);
            }
        };

        // Add a callback for toggling Add/Delete Marker from Qt
        Module.qtCallbacks.toggleDelete = () => {
            if (callbacksRef.current.toggleDeleteFromQt) {
                callbacksRef.current.toggleDeleteFromQt();
            }
        };

        // Add a callback for clearing NN Path from Qt
        Module.qtCallbacks.clearNNPath = () => {
            if (callbacksRef.current.clearNNPathFromQt) {
                callbacksRef.current.clearNNPathFromQt();
            }
        };

        // Add a callback for adding a Coordinate Point to NN from Qt
        Module.qtCallbacks.addPointToNNPath = (lat: number, lon: number) => {
            if (callbacksRef.current.addPointToNNPathFromQt) {
                callbacksRef.current.addPointToNNPathFromQt(lat, lon);
            }
        };

        // Add a callback for clearing NN Path from Qt
        Module.qtCallbacks.clearOptimizedNN = () => {
            if (callbacksRef.current.clearOptimizedNNFromQt) {
                callbacksRef.current.clearOptimizedNNFromQt();
            }
        };

        // Add a callback for adding a Coordinate Point to NN from Qt
        Module.qtCallbacks.addPointToOptimizedNNPath = (lat: number, lon: number) => {
            if (callbacksRef.current.addPointToOptimizedNNPathFromQt) {
                callbacksRef.current.addPointToOptimizedNNPathFromQt(lat, lon);
            }
        };

        // Add a callback for clearing MST Path from Qt
        Module.qtCallbacks.clearMSTPath = () => {
            if (callbacksRef.current.clearMSTPathFromQt) {
                callbacksRef.current.clearMSTPathFromQt();
            }
        };

        // Add a callback for adding a Coordinate Point to MST Path from Qt
        Module.qtCallbacks.addPointToMSTPath = (lat: number, lon: number) => {
            if (callbacksRef.current.addPointToMSTPathFromQt) {
                callbacksRef.current.addPointToMSTPathFromQt(lat, lon);
            }
        };

        // Add a callback for clearing Optimized MST Path from Qt
        Module.qtCallbacks.clearOptimizedMSTPath = () => {
            if (callbacksRef.current.clearOptimizedMSTPathFromQt) {
                callbacksRef.current.clearOptimizedMSTPathFromQt();
            }
        };

        // Add a callback for adding a Coordinate Point to Optimized MST Path from Qt
        Module.qtCallbacks.addPointToOptimizedMSTPath = (lat: number, lon: number) => {
            if (callbacksRef.current.addPointToOptimizedMSTPathFromQt) {
                callbacksRef.current.addPointToOptimizedMSTPathFromQt(lat, lon);
            }
        };

        // Add a callback for clearing Brute Force Path from Qt
        Module.qtCallbacks.clearBFPath = () => {
            if (callbacksRef.current.clearBFPathFromQt) {
                callbacksRef.current.clearBFPathFromQt();
            }
        };

        // Add a callback for adding a Coordinate Point to Brute Force Path from Qt
        Module.qtCallbacks.addPointToBFPath = (lat: number, lon: number) => {
            if (callbacksRef.current.addPointToBFPathFromQt) {
                callbacksRef.current.addPointToBFPathFromQt(lat, lon);
            }
        };

        // Add a callback for clearing Dynamic Programming Path from Qt
        Module.qtCallbacks.clearDPPath = () => {
            if (callbacksRef.current.clearDPPathFromQt) {
                callbacksRef.current.clearDPPathFromQt();
            }
        };

        // Add a callback for adding a Coordinate Point to Dynamic Programming Path from Qt
        Module.qtCallbacks.addPointToDPPath = (lat: number, lon: number) => {
            if (callbacksRef.current.addPointToDPPathFromQt) {
                callbacksRef.current.addPointToDPPathFromQt(lat, lon);
            }
        };

        // Add a callback for clearing MST from Qt
        Module.qtCallbacks.clearMST = () => {
            if (callbacksRef.current.clearMSTFromQt) {
                callbacksRef.current.clearMSTFromQt();
            }
        };

        // Add a callback for adding a Trail to MST from Qt
        Module.qtCallbacks.addTrailToMST = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            if (callbacksRef.current.addTrailToMSTFromQt) {
                callbacksRef.current.addTrailToMSTFromQt(lat1, lon1, lat2, lon2);
            }
        };
    }, []);

    // Register callback for receiving messages from Qt
    const onMessageFromQt = useCallback((cb: (msg: string) => void) => {
        callbacksRef.current.sendToReact = cb;
    }, []);

    // Register callback for toggling Add/Delete Marker from Qt
    const onToggleDeleteFromQt = useCallback((cb: () => void) => {
        callbacksRef.current.toggleDeleteFromQt = cb;
    }, []);

    // Register callback specifically for receiving markers from Qt
    const onAddMarkerFromQt = useCallback((cb: (lat: number, lon: number) => void) => {
        callbacksRef.current.addMarkerFromQt = cb;
    }, []);

    // Register callback for clearing NN Path from Qt
    const onClearNNPathFromQt = useCallback((cb: () => void) => {
        callbacksRef.current.clearNNPathFromQt = cb;
    }, []);

    // Register callback for adding Coordinate to NN Path
    const onAddPointToNNPathFromQt = useCallback((cb: (lat: number, lon: number) => void) => {
        callbacksRef.current.addPointToNNPathFromQt = cb;
    }, []);

    // Register callback for clearing Optimized NN Path from Qt
    const onClearOptimizedNNFromQt = useCallback((cb: () => void) => {
        callbacksRef.current.clearOptimizedNNFromQt = cb;
    }, []);

    // Register callback for adding Coordinate to Optimized NN Path
    const onAddPointToOptimizedNNPathFromQt = useCallback((cb: (lat: number, lon: number) => void) => {
        callbacksRef.current.addPointToOptimizedNNPathFromQt = cb;
    }, []);

    // Register callback for clearing MST Path from Qt
    const onClearMSTPathFromQt = useCallback((cb: () => void) => {
        callbacksRef.current.clearMSTPathFromQt = cb;
    }, []);

    // Register callback for adding Coordinate to MST Path
    const onAddPointToMSTPathFromQt = useCallback((cb: (lat: number, lon: number) => void) => {
        callbacksRef.current.addPointToMSTPathFromQt = cb;
    }, []);

    // Register callback for clearing Optimized MST Path from Qt
    const onClearOptimizedMSTPathFromQt = useCallback((cb: () => void) => {
        callbacksRef.current.clearOptimizedMSTPathFromQt = cb;
    }, []);

    // Register callback for adding Coordinate to Optimized MST Path
    const onAddPointToOptimizedMSTPathFromQt = useCallback((cb: (lat: number, lon: number) => void) => {
        callbacksRef.current.addPointToOptimizedMSTPathFromQt = cb;
    }, []);

    // Register callback for clearing Brute Force Path from Qt
    const onClearBFPathFromQt = useCallback((cb: () => void) => {
        callbacksRef.current.clearBFPathFromQt = cb;
    }, []);

    // Register callback for adding Coordinate to Brute Force Path
    const onAddPointToBFPathFromQt = useCallback((cb: (lat: number, lon: number) => void) => {
        callbacksRef.current.addPointToBFPathFromQt = cb;
    }, []);

    // Register callback for clearing Dynamic Programming Path from Qt
    const onClearDPPathFromQt = useCallback((cb: () => void) => {
        callbacksRef.current.clearDPPathFromQt = cb;
    }, []);

    // Register callback for adding Coordinate to Dynamic Programming Path
    const onAddPointToDPPathFromQt = useCallback((cb: (lat: number, lon: number) => void) => {
        callbacksRef.current.addPointToDPPathFromQt = cb;
    }, []);

    // Register callback for clearing MST from Qt
    const onClearMSTFromQt = useCallback((cb: () => void) => {
        callbacksRef.current.clearMSTFromQt = cb;
    }, []);

    // Register callback for adding Coordinate to Dynamic Programming Path
    const onAddTrailToMSTFromQt = useCallback((cb: (lat1: number, lon1: number, lat2: number, lon2: number) => void) => {
        callbacksRef.current.addTrailToMSTFromQt = cb;
    }, []);



    // Coordinate to add is directly passed as an argument on the stack
    const addCoordinateToQt = (lat: number, lon: number) => {
        console.log("Sending Coordinate to Qt: ", lat, lon)
        const Module = qtModuleRef.current;
        if (!Module || !Module._addCoordinateFromJS) return;

        Module._addCoordinateFromJS(lat, lon);
    };

    // Coordinate to remove is directly passed as an argument on the stack
    const removeCoordinateToQt = (lat: number, lon: number) => {
        const Module = qtModuleRef.current;
        if (!Module || !Module._removeCoordinateFromJS) return;

        Module._removeCoordinateFromJS(lat, lon);
    };

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
        onToggleDeleteFromQt,
        addCoordinateToQt,
        removeCoordinateToQt,
        setupCallbacks,
        onMessageFromQt,
        onAddMarkerFromQt,
        onClearNNPathFromQt,
        onAddPointToNNPathFromQt,
        onClearOptimizedNNFromQt,
        onAddPointToOptimizedNNPathFromQt,
        onClearMSTPathFromQt,
        onAddPointToMSTPathFromQt,
        onClearOptimizedMSTPathFromQt,
        onAddPointToOptimizedMSTPathFromQt,
        onClearBFPathFromQt,
        onAddPointToBFPathFromQt,
        onClearDPPathFromQt,
        onAddPointToDPPathFromQt,
        onClearMSTFromQt,
        onAddTrailToMSTFromQt,
        qtModule: qtModuleRef.current,
    };
}
