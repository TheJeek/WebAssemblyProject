// Declare the WASM Module type (Emscripten)
//Test for iframe/QtTest
declare global {
    interface Window {
        qtLoad?: (opts: any) => Promise<any>;
        Module?: any;
        qtReceiveFromCpp?: (msg: string) => void;
    }

    interface ModuleType {
        ccall: (
            name: string,
            returnType: string | null,
            argTypes: string[],
            args: string[]
        ) => never;
    }

    const Module: ModuleType;
}

// ---- TypeScript Interface ----

export const UseWebAssemblyBenchmarkModule = () => ({
    sendToQt(message: string) {
        const iframe = document.getElementById("qt-iframe") as HTMLIFrameElement;
        if (!iframe?.contentWindow) return;

        iframe.contentWindow.postMessage({ type: "fromReact", payload: message }, "*");
    },

    onMessageFromQt(callback: (msg: string) => void) {
        function handler(event: MessageEvent) {
            if (event.data?.type === "fromQt") {
                callback(event.data.payload);
            }
        }

        window.addEventListener("message", handler);

        // Return cleanup function
        return () => window.removeEventListener("message", handler);
    },
});
