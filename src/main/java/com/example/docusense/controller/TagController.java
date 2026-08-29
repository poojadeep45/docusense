package com.example.docusense.controller;

import com.example.docusense.dto.TagDto;
import com.example.docusense.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @PostMapping
    public ResponseEntity<TagDto> createTag(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(tagService.createTag(body.get("name")));
    }

    @GetMapping
    public ResponseEntity<List<TagDto>> getAllTags() {
        return ResponseEntity.ok(tagService.getAll());
    }
}
