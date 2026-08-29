package com.example.docusense.dto;

import com.example.docusense.entity.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDto {
    private Long docId;
    private String fileName;
    private String filePath;
    private String fileType;
    private String summary;
    private DocumentStatus status;
    private CategoryDto category;
    private Set<TagDto> tags;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
}
