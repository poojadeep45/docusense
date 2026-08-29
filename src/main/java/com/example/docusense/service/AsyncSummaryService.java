package com.example.docusense.service;

import com.example.docusense.entity.Document;
import com.example.docusense.entity.DocumentStatus;
import com.example.docusense.repository.DocumentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AsyncSummaryService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AiSummaryService aiSummaryService;

    @Async("aiTaskExecutor")
    @Transactional
    public void processSummary(Long docId) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new EntityNotFoundException("Document with id: " + docId + " not found"));

        try {
            String summary = aiSummaryService.summarize(document.getExtractedText());
            document.setSummary(summary);
            document.setStatus(DocumentStatus.COMPLETED);
        }catch (Exception e){
            document.setStatus(DocumentStatus.FAILED);
        }

        documentRepository.save(document);
    }
}
