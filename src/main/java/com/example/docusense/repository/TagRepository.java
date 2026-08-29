package com.example.docusense.repository;

import com.example.docusense.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;


public interface TagRepository extends JpaRepository<Tag,Long> {
}
