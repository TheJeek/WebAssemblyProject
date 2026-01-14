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
import java.util.Set;
import java.util.stream.Stream;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import com.hsaalen.backend.model.FileType;
import com.hsaalen.backend.model.StoredFile;
import com.hsaalen.backend.repository.StoredFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    @Autowired
    private StoredFileRepository fileRepository;

    @Transactional
    public StoredFile upload(MultipartFile file, FileType type) throws IOException {
        System.out.println("Content Type: " + file.getContentType());
        byte[] data = shouldCompress(file.getContentType())
                ? compressBytes(file.getBytes())
                : file.getBytes();

        StoredFile storedFile = fileRepository.findByFileType(type)
                .orElseGet(() -> {
                    StoredFile f = new StoredFile();
                    f.setFileType(type);
                    return f;
                });

        storedFile.setName(StringUtils.cleanPath(file.getOriginalFilename()));
        storedFile.setContentType(file.getContentType());
        storedFile.setData(data);
        storedFile.setSize(file.getSize());
        storedFile.setCompressed(shouldCompress(file.getContentType()));

        return fileRepository.save(storedFile);
    }

    // Since I plan on uploading all WASM files together in a zip this probably won't be used
    // but potentially for the future
    private boolean shouldCompress(String contentType) {
        if (contentType == null) return true; //default compressed

        //Different compressed content types
        Set<String> compressedTypes = Set.of(
                "application/zip",
                "application/x-zip-compressed",
                "application/x-zip",
                "application/x-rar-compressed",
                "application/gzip"
        );

        return !compressedTypes.contains(contentType) &&
                !contentType.startsWith("image/") &&
                !contentType.startsWith("video/") &&
                !contentType.startsWith("audio/");
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

    @Transactional(readOnly = true)
    public StoredFile get(FileType type) {
        StoredFile fileDB = fileRepository.findByFileType(type)
                .orElseThrow(() -> new RuntimeException("File not found with type: " + type));
        return fileDB;
    }
}