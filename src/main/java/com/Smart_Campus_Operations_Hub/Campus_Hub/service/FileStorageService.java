package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.StoredFileInfo;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.AttachmentLimitExceededException;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.AttachmentNotFoundException;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.FileValidationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final Tika tika;
    private final Set<String> allowlist = Set.of("image/jpeg", "image/png", "image/webp");

    public FileStorageService(@Value("${upload.dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.tika = new Tika();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public List<StoredFileInfo> storeAttachments(UUID ticketId, List<MultipartFile> files, int existingCount) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        if (existingCount + files.size() > 3) {
            throw new AttachmentLimitExceededException("Cannot upload more than 3 attachments per ticket.");
        }

        List<StoredFileInfo> storedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            validateFile(file);
            
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = extractExtension(originalFilename);
            String storedName = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);
            
            Path targetLocation = this.fileStorageLocation.resolve("tickets").resolve(ticketId.toString()).resolve(storedName);
            
            try {
                Files.createDirectories(targetLocation.getParent());
                Files.copy(file.getInputStream(), targetLocation);
                
                String detectedMimeType = tika.detect(file.getInputStream());
                storedFiles.add(new StoredFileInfo(originalFilename, storedName, detectedMimeType, file.getSize()));
            } catch (IOException ex) {
                throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
            }
        }

        return storedFiles;
    }

    public UrlResource loadFileAsResource(String storedName, UUID ticketId) {
        try {
            Path filePath = this.fileStorageLocation.resolve("tickets").resolve(ticketId.toString()).resolve(storedName).normalize();
            guardPath(filePath);
            
            UrlResource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new AttachmentNotFoundException("File not found or not readable " + storedName);
            }
        } catch (MalformedURLException ex) {
            throw new AttachmentNotFoundException("File not found " + storedName);
        }
    }

    public void deleteAttachment(String storedName, UUID ticketId, String callerEmail) {
        try {
            Path filePath = this.fileStorageLocation.resolve("tickets").resolve(ticketId.toString()).resolve(storedName).normalize();
            guardPath(filePath);
            Files.deleteIfExists(filePath);
            log.info("Deleted attachment. TicketId: {}, StoredName: {}, Caller: {}", ticketId, storedName, callerEmail);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + storedName, ex);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new FileValidationException("File exceeds 5MB limit");
        }
        
        try (InputStream is = file.getInputStream()) {
            String detected = tika.detect(is);
            if (!allowlist.contains(detected)) {
                throw new FileValidationException("File type not allowed: " + detected);
            }
        } catch (IOException e) {
            throw new FileValidationException("Could not read file for validation");
        }
    }

    private void guardPath(Path resolved) {
        if (!resolved.toAbsolutePath().normalize().startsWith(this.fileStorageLocation)) {
            throw new SecurityException("Path traversal attempt detected");
        }
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
