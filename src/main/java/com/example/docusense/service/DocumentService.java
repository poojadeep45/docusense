package com.example.docusense.service;

import com.example.docusense.dto.CategoryDto;
import com.example.docusense.dto.DocumentDto;
import com.example.docusense.dto.TagDto;
import com.example.docusense.entity.*;
import com.example.docusense.repository.CategoryRepository;
import com.example.docusense.repository.DocumentRepository;
import com.example.docusense.repository.TagRepository;
import com.example.docusense.security.CurrentUserProvider;
import com.example.docusense.security.RateLimiterService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private TextExtractionService textExtractionService;

    @Autowired
    private AiSummaryService aiSummaryService;

    @Autowired
    private AsyncSummaryService asyncSummaryService;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private RateLimiterService rateLimiterService;

    @Transactional
    public DocumentDto createDocument(String fileName, String fileType, Long CategoryId) {
        Category category = null;
        if (CategoryId != null) {
            category = categoryRepository.findById(CategoryId)
            .orElseThrow(() -> new EntityNotFoundException("Category not found: "  + CategoryId));
        }

        Document document = Document.builder()
                .fileName(fileName)
                .fileType(fileType)
                .status(DocumentStatus.UPLOADED)
                .category(category)
                .build();

        Document savedDocument = documentRepository.save(document);
        return toDto(savedDocument);
    }

    @Transactional
    public List<DocumentDto> getAll(){
        User currentUser = currentUserProvider.getCurrentUser();
        return  documentRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public DocumentDto getById(Long id){
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: "  + id));

        User currentUser = currentUserProvider.getCurrentUser();
        if (!document.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        return toDto(document);
    }

    public void deleteById(Long id){
        if (!documentRepository.existsById(id)) {
            throw new EntityNotFoundException("Document not found: "  + id);
        }
        documentRepository.deleteById(id);
    }

    private DocumentDto toDto(Document document) {
        CategoryDto categoryDto = null;
        if (document.getCategory() != null) {
            categoryDto = CategoryDto.builder()
                    .catId(document.getCategory().getCatId())
                    .catName(document.getCategory().getCatName())
                    .build();
        }

        var tagDtos = document.getTags().stream()
                .map(tag -> TagDto.builder().tagId(tag.getTagId()).tagName(tag.getTagName()).build())
                .collect(Collectors.toSet());

        return DocumentDto.builder()
                .docId(document.getDocId())
                .fileName(document.getFileName())
                .filePath(document.getFilePath())
                .fileType(document.getFileType())
                .summary(document.getSummary())
                .status(document.getStatus())
                .category(categoryDto)
                .tags(tagDtos)
                .uploadedAt(document.getUploadedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    public DocumentDto uploadDocument(MultipartFile multipartFile , Long CategoryId) throws IOException {
        Category category = null;
        if (CategoryId != null) {
            category = categoryRepository.findById(CategoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: "  + CategoryId));
        }

        String OriginalFilename = multipartFile.getOriginalFilename();
        String fileType = OriginalFilename.substring(OriginalFilename.lastIndexOf(".") + 1).toLowerCase();

        if (!fileType.equals("pdf") &&  !fileType.equals("docx") && !fileType.equals("txt")) {
            throw new IllegalArgumentException("Unsupported file type: " + fileType + ". Only PDF, DOCX, and TXT are supported.");
        }

        String storedPath = fileStorageService.store(multipartFile);
        String extractedText = textExtractionService.extractText(new File(storedPath) , fileType );

        Document document = Document.builder()
                .fileName(OriginalFilename)
                .filePath(storedPath)
                .fileType(fileType)
                .extractedText(extractedText)
                .status(DocumentStatus.UPLOADED)
                .category(category)
                .user(currentUserProvider.getCurrentUser())
                .build();

        Document savedDocument = documentRepository.save(document);
        return toDto(savedDocument);
    }

    @Transactional
    public DocumentDto analyzeDocument(Long docId){
        User currentUser = currentUserProvider.getCurrentUser();

        if (!rateLimiterService.isAllowed(currentUser.getUsername())){
            throw new IllegalStateException("Rate limit exceeded. Please wait before analyzing more documents.");
        }
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + docId));

        if (document.getExtractedText() == null || document.getExtractedText().isBlank()) {
            throw new IllegalStateException("No extracted tet file available to summarize for document: " + docId);
        }

        document.setStatus(DocumentStatus.PROCESSING);
        Document savedDocument = documentRepository.save(document);

        asyncSummaryService.processSummary(docId);

        return toDto(savedDocument);
    }

    public List<DocumentDto> uploadBatch(List<MultipartFile> Files, Long categoryId) throws IOException {
        List<DocumentDto> results = new ArrayList<>();
        for (MultipartFile file : Files) {
            results.add(uploadDocument(file, categoryId));
        }
        return results;
    }

    @Transactional
    public DocumentDto addTagsToDocument(Long docId, List<Long> tagIds) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + docId));

        for (Long tagId : tagIds) {
            Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + tagId));

            document.getTags().add(tag);
        }

        Document savedDocument = documentRepository.save(document);
        return toDto(savedDocument);
    }

    @Transactional
    public List<DocumentDto> getByCategory(Long categoryId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + categoryId));

        return documentRepository.findByUserAndCategory(currentUser, category)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<DocumentDto> getByTag(Long tagId) {
        User currentUser = currentUserProvider.getCurrentUser();
        return documentRepository.findByUserAndTagId(currentUser, tagId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<DocumentDto> searchByFileName(String keyword) {
        User currentUser = currentUserProvider.getCurrentUser();
        return documentRepository.findByUserAndFileNameContainingIgnoreCase(currentUser, keyword)
                .stream()
                .map(this::toDto)
                .toList();
    }
}
