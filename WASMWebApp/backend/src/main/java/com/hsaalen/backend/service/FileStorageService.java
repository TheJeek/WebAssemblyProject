/**
 * FileStorageService.java
 *
 * @author Jonas Lanz
 */
package com.hsaalen.backend.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import com.hsaalen.backend.model.StoredFile;
import com.hsaalen.backend.repository.StoredFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    @Autowired
    private StoredFileRepository fileRepository;

    public StoredFile store(MultipartFile file) throws IOException {
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        byte[] compressedData = compressBytes(file.getBytes());

        StoredFile fileDB = new StoredFile(fileName, file.getContentType(), compressedData);
        return fileRepository.save(fileDB);
    }


    public StoredFile getFile(String id) {
        StoredFile fileDB = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id " + id));

        // Decompress before returning
        fileDB.setData(decompressBytes(fileDB.getData()));
        return fileDB;
    }

    public Stream<StoredFile> getAllFiles() {
        return fileRepository.findAll().stream();
    }


    public String deleteFileById(String id) {
        if (fileRepository.existsById(id)) {
            fileRepository.deleteById(id);
            return "File has been successfully deleted";
        }
        return "File doesn't exist";
    }

    // compress file bytes before storing in DB
    private byte[] compressBytes(byte[] data) {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             GZIPOutputStream gzip = new GZIPOutputStream(bos)) {
            gzip.write(data);
            gzip.finish();
            return bos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to compress file data", e);
        }
    }

    // decompress file bytes after retrieving from DB
    private byte[] decompressBytes(byte[] data) {
        try (ByteArrayInputStream bis = new ByteArrayInputStream(data);
             GZIPInputStream gis = new GZIPInputStream(bis);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            byte[] buffer = new byte[1024];
            int len;
            while ((len = gis.read(buffer)) != -1) {
                bos.write(buffer, 0, len);
            }
            return bos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to decompress file data", e);
        }
    }

    public Optional<StoredFile> findByName(String filename) {
        return fileRepository.findByName(filename);
    }
}