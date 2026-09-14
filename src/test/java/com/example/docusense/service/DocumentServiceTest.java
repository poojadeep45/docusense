package com.example.docusense.service;

import com.example.docusense.dto.DocumentDto;
import com.example.docusense.entity.Document;
import com.example.docusense.entity.DocumentStatus;
import com.example.docusense.entity.User;
import com.example.docusense.repository.DocumentRepository;
import com.example.docusense.security.CurrentUserProvider;
import com.example.docusense.security.RateLimiterService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.ArgumentMatchers.any;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @Mock
    private RateLimiterService rateLimiterService;

    @Mock
    private AsyncSummaryService asyncSummaryService;

    @InjectMocks
    private DocumentService documentService;

    private Document sampleDocument;

    private User sampleUser;

    @BeforeEach
    public void setUp() {
        sampleUser = User.builder()
                .userId(1L)
                .username("pooja")
                .email("pooja@example.com")
                .password("test123")
                .build();

        sampleDocument = Document.builder()
                .docId(1L)
                .fileName("Resume.docx")
                .fileType("docx")
                .status(DocumentStatus.UPLOADED)
                .extractedText("Some sample extracted text for testing.")
                .tags(new HashSet<>())
                .user(sampleUser)
                .build();
    }

    @Test
    void getById_whenDocumentExists_returnsDto() {
        // Arrange
        when(documentRepository.findById(1L)).thenReturn(Optional.of(sampleDocument));
        when(currentUserProvider.getCurrentUser()).thenReturn(sampleUser);

        // Act
        DocumentDto result = documentService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getDocId());
        assertEquals("Resume.docx", result.getFileName());
        assertEquals(DocumentStatus.UPLOADED, result.getStatus());
    }

    @Test
    void getById_whenDocumentDoesNotExist_throwsEntityNotFoundException() {
        // Arrange
        when(documentRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> documentService.getById(99L));
    }

    @Test
    void uploadDocument_withUnsupportedFileType_throwsIllegalArgumentException() throws Exception {
        org.springframework.web.multipart.MultipartFile fakeFile =
                mock(org.springframework.web.multipart.MultipartFile.class);
        when(fakeFile.getOriginalFilename()).thenReturn("malware.exe");

        assertThrows(IllegalArgumentException.class, () -> documentService.uploadDocument(fakeFile, null));
    }

    @Test
    void getById_whenDocumentBelongsToAnotherUser_throwsAccessDeniedException() {
        User otherUser = User.builder()
                .userId(2L)
                .username("someone_else")
                .email("other@example.com")
                .password("hashed")
                .build();

        when(documentRepository.findById(1L)).thenReturn(Optional.of(sampleDocument));
        when(currentUserProvider.getCurrentUser()).thenReturn(otherUser);

        assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () -> documentService.getById(1L)
        );
    }

    @Test
    void delete_whenDocumentDoesNotExist_throwsEntityNotFoundException() {
        when(documentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> documentService.deleteById(99L));
    }

    @Test
    void analyzeDocument_whenRateLimitExceeded_throwsIllegalStateException() {
        when(currentUserProvider.getCurrentUser()).thenReturn(sampleUser);
        when(rateLimiterService.isAllowed("pooja")).thenReturn(false);

        assertThrows(IllegalStateException.class, () -> documentService.analyzeDocument(1L));
    }

    @Test
    void analyzeDocument_whenRateLimitNotExceeded_proceedsSuccessfully() {
        when(currentUserProvider.getCurrentUser()).thenReturn(sampleUser);
        when(rateLimiterService.isAllowed("pooja")).thenReturn(true);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(sampleDocument));
        when(documentRepository.save(any(Document.class))).thenReturn(sampleDocument);

        DocumentDto result = documentService.analyzeDocument(1L);

        assertNotNull(result);
        assertEquals(DocumentStatus.PROCESSING, result.getStatus());
    }
}
