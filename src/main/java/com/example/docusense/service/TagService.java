package com.example.docusense.service;

import com.example.docusense.dto.TagDto;
import com.example.docusense.entity.Tag;
import com.example.docusense.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    public TagDto createTag(String name) {
        Tag tag = Tag.builder().tagName(name.trim()).build();
        Tag savedTag  = tagRepository.save(tag);
        return toDto(savedTag);
    }

    public List<TagDto> getAll() {
        return tagRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private TagDto toDto(Tag tag) {
        return TagDto.builder()
                .tagId(tag.getTagId())
                .tagName(tag.getTagName())
                .build();
    }
}