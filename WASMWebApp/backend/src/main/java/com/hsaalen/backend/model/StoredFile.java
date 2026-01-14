/**
 * StoredFile.java
 *
 * @author Jonas Lanz
 */
package com.hsaalen.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "stored_files")
public class StoredFile {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, unique = true)
    private FileType fileType;

    private String name;

    private String contentType;

    @Lob
    private byte[] data;

    private long size;

    private boolean compressed;

    public StoredFile() {
    }

    public StoredFile(String name, String type, byte[] data, long size, boolean compressed) {
        this.name = name;
        this.contentType = type;
        this.data = data;
        this.size = size;
        this.compressed = compressed;
    }

    public String getId() {
        return id;
    }

    public FileType getFileType() {
        return fileType;
    }

    public void setFileType(FileType fileType) {
        this.fileType = fileType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public boolean isCompressed() {
        return compressed;
    }

    public void setCompressed(boolean compressed) {
        this.compressed = compressed;
    }

}
