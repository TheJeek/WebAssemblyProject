import React, { useState } from "react";
import axios from "axios";

export const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileId, setFileId] = useState<string>("");
    const [allFiles, setAllFiles] = useState<any[]>([]);

    const API_URL = "http://localhost:8080/api/files";

    // Handle file input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    // Upload file
    const handleUpload = async () => {
        if (!file) return alert("Please select a file first!");

        const formData = new FormData();
        formData.append("file", file);
        allFiles;

        try {
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("File uploaded successfully!");
            console.log(res.data);
        } catch (err) {
            console.error(err);
            alert("Upload failed!");
        }
    };

    // Download single file by UUID
    const handleDownloadById = async () => {
        if (!fileId) return alert("Please enter a file ID!");

        try {
            const res = await axios.get(`${API_URL}/${fileId}`, {
                responseType: "blob",
            });

            // Extract filename and type from headers if available
            const contentDisposition = res.headers["content-disposition"];
            let filename = "downloaded_file";

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            const fileType = res.headers["content-type"] || "application/octet-stream";

            const url = URL.createObjectURL(new Blob([res.data], { type: fileType }));
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Download failed!");
        }
    };

    // Download all files
    const handleDownloadAll = async () => {
        try {
            const res = await axios.get(`${API_URL}`, { responseType: "json" });
            setAllFiles(res.data);

            for (const f of res.data) {
                if (f.url != undefined) {
                    const fileRes = await axios.get(`${f.url}`, { responseType: "blob" });
                    const url = URL.createObjectURL(
                        new Blob([fileRes.data], { type: f.type || "application/octet-stream" })
                    );
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = f.name || "unknown_file";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }

            alert("All files downloaded!");
        } catch (err) {
            console.error(err);
            alert("Failed to download all files!");
        }
    };

    return (
        <div className="p-8 flex flex-col items-center space-y-4">
            <h1 className="text-2xl font-semibold mb-2"> File Upload & Download</h1>

            <input type="file" onChange={handleFileChange} />
            <button
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
                Upload
            </button>

            <div className="flex flex-col items-center space-y-2 mt-6">
                <input
                    type="text"
                    value={fileId}
                    onChange={(e) => setFileId(e.target.value)}
                    placeholder="Enter File ID"
                    className="border px-2 py-1 rounded w-64 text-center"
                />
                <button
                    onClick={handleDownloadById}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    Download by ID
                </button>
            </div>

            <button
                onClick={handleDownloadAll}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mt-4"
            >
                Download All Files
            </button>
        </div>
    );
};
