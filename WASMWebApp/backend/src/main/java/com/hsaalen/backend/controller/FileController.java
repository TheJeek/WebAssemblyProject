/**
 * FileController.java
 *
 * @author Jonas Lanz
 */
package com.hsaalen.backend.controller;

import com.hsaalen.backend.model.FileType;
import com.hsaalen.backend.model.StoredFile;
import com.hsaalen.backend.service.FileStorageService;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
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
@RequestMapping("/webassembly/api/files")
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
    public void getMapFile(@PathVariable String filename, HttpServletResponse response) throws IOException {
        StoredFile zipFile = fileService.get(FileType.MAP);

        try (ByteArrayInputStream bais = new ByteArrayInputStream(zipFile.getData());
             ZipInputStream zis = new ZipInputStream(bais)) {

            ZipEntry entry;
            boolean found = false;

            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().equals(filename)) {
                    found = true;

                    String contentType = URLConnection.guessContentTypeFromName(filename);
                    if (contentType == null) contentType = "application/octet-stream";

                    response.setContentType(contentType);
                    response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
                    response.setHeader("Vary", "Origin");

                    // Stream the file directly
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    ServletOutputStream out = response.getOutputStream();

                    while ((bytesRead = zis.read(buffer)) != -1) {
                        out.write(buffer, 0, bytesRead);
                    }

                    out.flush();
                    break;
                }
            }

            if (!found) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found in ZIP");
            }
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
