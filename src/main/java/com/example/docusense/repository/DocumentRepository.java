package com.example.docusense.repository;

import com.example.docusense.entity.Category;
import com.example.docusense.entity.Document;
import com.example.docusense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document,Long> {
    List<Document> findByUser(User user);

    List<Document> findByUserAndCategory(User user, Category category);

    @Query("SELECT d FROM Document d JOIN d.tags t WHERE d.user = :user AND t.tagId = :tagId")
    List<Document> findByUserAndTagId(@Param("user") User user, @Param("tagId") Long tagId);

    List<Document> findByUserAndFileNameContainingIgnoreCase(User user, String keyword);

}
