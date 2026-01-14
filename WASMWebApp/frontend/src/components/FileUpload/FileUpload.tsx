import React, { useState } from "react";
import axios from "axios";
import {downloadFile, uploadFile} from "@/api/fileApi.ts";
import {Button} from "@/components/ui/button.tsx";

export const FileUpload: React.FC = () => {

    const [defaultFile, setDefaultFile] = useState<File | null>(null);
    const [mapFile, setMapFile] = useState<File | null>(null);

    return (
        <div
            style={{
                padding: "40px 20px",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxSizing: "border-box",
            }}
        >
            {/* WebAssembly Qt Project File Section */}
            <section
                style={{
                    width: "100%",
                    maxWidth: "600px",
                    padding: "20px",
                    marginBottom: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}
            >
                <h2 style={{ margin: 0 }}>Qt WebAssembly Project WASM zip</h2>

                <label
                    style={{
                        display: "inline-block",
                        cursor: "pointer",
                        padding: "10px 15px",
                        backgroundColor: "#28a745",
                        borderRadius: "6px",
                        textAlign: "center",
                        fontWeight: 500,
                        width: "fit-content",
                    }}
                >
                    Choose File
                    <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => setDefaultFile(e.target.files?.[0] ?? null)}
                    />
                </label>
                {defaultFile && <span>{defaultFile.name}</span>}

                <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                        onClick={() => defaultFile && uploadFile(defaultFile, "default")}
                        disabled={!defaultFile}
                    >
                        Upload
                    </Button>
                    <Button onClick={() => downloadFile("default")}>Download</Button>
                </div>
            </section>

            {/* Traveling Salesman WASM File Section */}
            <section
                style={{
                    width: "100%",
                    maxWidth: "600px",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}
            >
                <h2 style={{ margin: 0 }}>Traveling Salesman Project WASM zip</h2>

                <label
                    style={{
                        display: "inline-block",
                        cursor: "pointer",
                        padding: "10px 15px",
                        backgroundColor: "#28a745",
                        borderRadius: "6px",
                        textAlign: "center",
                        fontWeight: 500,
                        width: "fit-content",
                    }}
                >
                    Choose File
                    <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => setMapFile(e.target.files?.[0] ?? null)}
                    />
                </label>
                {mapFile && <span>{mapFile.name}</span>}

                <div style={{ display: "flex", gap: "10px" }}>
                    <Button variant={"default"}
                        onClick={() => mapFile && uploadFile(mapFile, "map")}
                        disabled={!mapFile}
                    >
                        Upload
                    </Button>
                    <Button onClick={() => downloadFile("map")}>Download</Button>
                </div>
            </section>
        </div>
    );
}
