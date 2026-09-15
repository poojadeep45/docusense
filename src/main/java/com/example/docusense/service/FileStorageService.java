package com.example.docusense.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Uploads the file straight to Cloudinary and returns its public URL.
     * No local disk is ever touched, so this is safe on hosting platforms
     * with an ephemeral filesystem (files used to disappear on every
     * redeploy when this wrote to local disk — that's the bug this fixes).
     * Documents are stored as "raw" resources since they're PDFs/DOCX/TXT,
     * not images.
     */
    public String store(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String uniquePublicId = UUID.randomUUID() + extension;

        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", uniquePublicId,
                        "resource_type", "raw"
                )
        );

        return (String) uploadResult.get("secure_url");
    }
}