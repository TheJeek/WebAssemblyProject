/**
 * FileController.java
 *
 * @author Jonas Lanz
 */
package com.hsaalen.backend.controller;

import com.hsaalen.backend.model.FileType;
import com.hsaalen.backend.model.StoredFile;
import com.hsaalen.backend.service.FileStorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URLConnection;
import java.util.NoSuchElementException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileService;

    public FileController(FileStorageService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload/default")
    public ResponseEntity<?> uploadDefault(@RequestParam MultipartFile file) throws IOException {
        fileService.upload(file, FileType.DEFAULT);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload/map")
    public ResponseEntity<?> uploadMap(@RequestParam MultipartFile file) throws IOException {
        fileService.upload(file, FileType.MAP);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/download/map")
    public ResponseEntity<Object> downloadMapModule() {
        try {
            StoredFile fileDB = fileService.get(FileType.MAP);

            // Response type: byte[]
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileDB.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileDB.getName() + "\"")
                    .body(fileDB.getData());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(e.getMessage());
        }
    }

    @GetMapping("/map/{filename}")
    public ResponseEntity<byte[]> getMapFile(@PathVariable String filename) {
        try {
            StoredFile zipFile = fileService.get(FileType.MAP);

            // Unzip and find the requested file
            try (ByteArrayInputStream bais = new ByteArrayInputStream(zipFile.getData());
                 ZipInputStream zis = new ZipInputStream(bais)) {

                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (entry.getName().equals(filename)) {
                        byte[] fileData = zis.readAllBytes();

                        // Determine MIME type
                        String contentType;
                        if (filename.endsWith(".wasm")) {
                            contentType = "application/wasm"; // required for streaming compile
                        } else if (filename.endsWith(".js")) {
                            contentType = "application/javascript";
                        } else if (filename.endsWith(".html")) {
                            contentType = "text/html";
                        } else if (filename.endsWith(".data")) {
                            contentType = "application/octet-stream";
                        } else {
                            contentType = URLConnection.guessContentTypeFromName(filename);
                            if (contentType == null) contentType = "application/octet-stream";
                        }

                        // Return as "blob" via raw bytes with correct MIME type
                        return ResponseEntity.ok()
                                .contentType(MediaType.parseMediaType(contentType))
                                .header("Cross-Origin-Opener-Policy", "cross-origin")
                                .header("Vary", "Origin")
                                .body(fileData);
                    }
                }
            }

            // File not found in zip
            return ResponseEntity.notFound().build();

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/download/default")
    public ResponseEntity<Object> downloadDefaultModule() {
        try {
            StoredFile fileDB = fileService.get(FileType.DEFAULT);

            // Response type: byte[]
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileDB.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileDB.getName() + "\"")
                    .body(fileDB.getData());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(e.getMessage());
        }
    }
}
