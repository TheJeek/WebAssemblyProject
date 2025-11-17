/**
 * StoredFileRepository.java
 *
 * @author Jonas Lanz
 */
package com.hsaalen.backend.repository;

import com.hsaalen.backend.model.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoredFileRepository extends JpaRepository<StoredFile, String> {
    Optional<StoredFile> findByName(String name);
}
