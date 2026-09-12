package com.example.docusense.repository;

import com.example.docusense.entity.Category;
import com.example.docusense.entity.Document;
import com.example.docusense.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document,Long> {
    List<Document> findByUser(User user);
    Page<Document> findByUser(User user, Pageable pageable);

    List<Document> findByUserAndCategory(User user, Category category);
    Page<Document> findByUserAndCategory(User user, Category category, Pageable pageable);

    @Query("SELECT d FROM Document d JOIN d.tags t WHERE d.user = :user AND t.tagId = :tagId")
    List<Document> findByUserAndTagId(@Param("user") User user, @Param("tagId") Long tagId);

    @Query("SELECT d FROM Document d JOIN d.tags t WHERE d.user = :user AND t.tagId = :tagId")
    Page<Document> findByUserAndTagId(@Param("user") User user, @Param("tagId") Long tagId, Pageable pageable);

    List<Document> findByUserAndFileNameContainingIgnoreCase(User user, String keyword);
    Page<Document> findByUserAndFileNameContainingIgnoreCase(User user, String keyword, Pageable pageable);
}