package com.example.docusense.controller;

import com.example.docusense.dto.CategoryDto;
import com.example.docusense.dto.DocumentDto;
import com.example.docusense.dto.PageResponse;
import com.example.docusense.dto.TagDto;
import com.example.docusense.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping
    public ResponseEntity<DocumentDto> createDocument(@RequestBody Map<String, String> body) {
        String fileName = (String) body.get("fileName");
        String fileType = (String) body.get("fileType");
        Long categoryId = body.get("CategoryId") != null
                ? Long.valueOf(body.get("CategoryId").toString())
                : null;
        return ResponseEntity.ok(documentService.createDocument(fileName, fileType, categoryId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<DocumentDto>> getAllDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(documentService.getAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocumentById(@PathVariable Long id) {
        documentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/upload" , consumes = "multipart/form-data")
    public ResponseEntity<DocumentDto> uploadDocument(
            @RequestParam("file") MultipartFile file ,
            @RequestParam(value = "categoryId" , required = false) Long categoryId) throws IOException
    {
        return ResponseEntity.ok(documentService.uploadDocument(file, categoryId));
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<DocumentDto> analyzeDocument(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok(documentService.analyzeDocument(id));
    }

    @PostMapping(value = "/batch" , consumes = "multipart/form-data")
    public ResponseEntity<List<DocumentDto>> uploadBatch(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "CategoryId" ,required = false) Long categoryId) throws IOException {
        return ResponseEntity.ok(documentService.uploadBatch(files, categoryId));
    }

    @PostMapping("/{id}/tags")
    public ResponseEntity<DocumentDto> addTags(
            @PathVariable Long id,
            @RequestBody List<Long> tagIds){
        return ResponseEntity.ok(documentService.addTagsToDocument(id , tagIds));
    }

    @GetMapping(params = "categoryId")
    public ResponseEntity<PageResponse<DocumentDto>> getByCategory(
            @RequestParam Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(documentService.getByCategory(categoryId, page, size));
    }

    @GetMapping(params = "tagId")
    public ResponseEntity<PageResponse<DocumentDto>> getByTag(
            @RequestParam Long tagId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(documentService.getByTag(tagId, page, size));
    }

    @GetMapping(params = "search")
    public ResponseEntity<PageResponse<DocumentDto>> search(
            @RequestParam String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(documentService.searchByFileName(search, page, size));
    }
}