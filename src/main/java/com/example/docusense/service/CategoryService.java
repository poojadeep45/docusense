package com.example.docusense.service;

import com.example.docusense.dto.CategoryDto;
import com.example.docusense.entity.Category;
import com.example.docusense.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public CategoryDto createCategory(String name) {
        Category category = Category.builder().CatName(name).build();
        Category savedCategory = categoryRepository.save(category);
        return toDto(savedCategory);
    }

    public List<CategoryDto> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private CategoryDto toDto(Category category) {
        return CategoryDto.builder()
                .catId(category.getCatId())
                .catName(category.getCatName())
                .build();
    }
}
