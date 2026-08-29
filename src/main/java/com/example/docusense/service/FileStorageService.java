package com.example.docusense.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${docusense.upload-dir}")
    private String uploadDir;

    public String store(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String OriginalFileName = file.getOriginalFilename();
        String extension = OriginalFileName.substring(OriginalFileName.lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID() + extension;

        Path targetPath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return targetPath.toString();
    }

    public File getFile(String filePath) {
        return new File(filePath);
    }
}
