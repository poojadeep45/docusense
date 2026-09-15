package com.example.docusense.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.stream.Collectors;

@Service
public class TextExtractionService {

    public String extractText(MultipartFile file, String fileType) throws IOException {
        return switch (fileType.toLowerCase()){
            case "pdf" -> extractFromPdf(file.getBytes());
            case "docx" -> extractFromDocx(file.getInputStream());
            case "txt" -> new String(file.getBytes(), StandardCharsets.UTF_8);
            default -> throw new IllegalArgumentException("Unsupported file type: "  + fileType);
        };
    }

    public String extractFromPdf(byte[] fileBytes) throws IOException {
        try(PDDocument document = Loader.loadPDF(fileBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public String extractFromDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream);
        XWPFWordExtractor extractor = new XWPFWordExtractor(document))
        {
            return  extractor.getText();
        }
    }
}
