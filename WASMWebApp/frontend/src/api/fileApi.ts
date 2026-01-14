import axios from "axios";
import JSZip from "jszip";
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080/api/files";

export async function uploadFile(
    file: File,
    type: "default" | "map"
) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/upload/${type}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        toast.error("Upload failed!", {
            description: "Your file has not been uploaded.",
        });
    }
    else {
        toast.success("Upload successful", {
            description: "Your file has been uploaded.",
        });
    }
}

export async function downloadFile(type: "default" | "map") {
    try {
        const res = await axios.get(`${BASE_URL}/download/${type}`, {
            responseType: "blob",
        });
        // Extract filename and type from headers if available
        const contentDisposition = res.headers["content-disposition"];
        let filename = res.data.filename;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) filename = match[1];
        }

        const fileType = res.headers["content-type"] || "application/octet-stream";

        const url = URL.createObjectURL(new Blob([res.data], {type: fileType}));
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error(err);
        toast.error("Download failed!");
    }
}

export async function fetchMapZip(): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/download/map`);
    if (!res.ok) toast.error("Failed to download Traveling Salesman WebAssembly module");
    return res.blob();
}

export async function fetchDefaultZip(): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/download/default`);
    if (!res.ok) toast.error("Failed to download Qt Webassembly module");
    return res.blob();
}

export async function extractZip(blob: Blob): Promise<Record<string, Blob>> {
    const zip = await JSZip.loadAsync(blob);
    const files: Record<string, Blob> = {};

    await Promise.all(
        Object.keys(zip.files).map(async (filename) => {
            const file = zip.files[filename];
            if (!file.dir) {
                const content = await file.async("blob");
                files[filename] = content;
            }
        })
    );

    return files;
}

export function createFileURLs(files: Record<string, Blob>): Record<string, string> {
    const urls: Record<string, string> = {};
    for (const [name, blob] of Object.entries(files)) {
        urls[name] = URL.createObjectURL(blob);
    }
    return urls;
}

