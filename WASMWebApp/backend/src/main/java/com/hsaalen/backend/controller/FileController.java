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

import java.io.IOException;
import java.util.NoSuchElementException;

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
