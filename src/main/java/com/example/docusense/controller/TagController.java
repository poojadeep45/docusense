package com.example.docusense.controller;

import com.example.docusense.dto.NameRequest;
import com.example.docusense.dto.TagDto;
import com.example.docusense.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @PostMapping
    public ResponseEntity<TagDto> createTag(@Valid @RequestBody NameRequest body) {
        return ResponseEntity.ok(tagService.createTag(body.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TagDto>> getAllTags() {
        return ResponseEntity.ok(tagService.getAll());
    }
}