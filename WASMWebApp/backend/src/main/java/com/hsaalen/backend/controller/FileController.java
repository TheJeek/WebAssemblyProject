/**
 * FileController.java
 *
 * @author Jonas Lanz
 */
package com.hsaalen.backend.controller;

import com.hsaalen.backend.model.ResponseFile;
import com.hsaalen.backend.model.StoredFile;
import com.hsaalen.backend.service.FileStorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileService;

    public FileController(FileStorageService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String message = "";
        try {
            fileService.store(file);
            message = "Uploaded the file successfully: " + file.getOriginalFilename();
            return ResponseEntity.status(HttpStatus.OK).body(message);
        } catch (Exception e) {
            message = "Could not upload the file: " + file.getOriginalFilename() + "!";
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(message);
        }
    }

    @GetMapping()
    public ResponseEntity<List<ResponseFile>> getListFiles() {
        List<ResponseFile> files = fileService.getAllFiles().map(dbFile -> {
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/files/")
                    .path(dbFile.getId()).toUriString();

            return new ResponseFile(dbFile.getName(), fileDownloadUri, dbFile.getType(), dbFile.getData().length);
        }).collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(files);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getFile(@PathVariable String id) {

        try {
            StoredFile fileDB = fileService.getFile(id);

            // Response type: byte[]
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileDB.getName() + "\"")
                    .body(fileDB.getData());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(e.getMessage());
        }
    }

    @GetMapping("/name/{filename}")
    public ResponseEntity<byte[]> getFileByName(@PathVariable String filename) {
        StoredFile fileDB = fileService.findByName(filename)
                .orElseThrow(() -> new RuntimeException("File not found: " + filename));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileDB.getName() + "\"")
                .contentType(MediaType.parseMediaType(fileDB.getType()))
                .body(fileDB.getData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletFileById(@PathVariable String id) {
        String message = "";
        message = fileService.deleteFileById(id);
        return ResponseEntity.status(HttpStatus.OK).body(message);

    }
}
