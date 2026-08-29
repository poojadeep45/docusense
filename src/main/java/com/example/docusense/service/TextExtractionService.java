package com.example.docusense.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.stream.Collectors;

@Service
public class TextExtractionService {

    public String extractText(File file, String fileType) throws IOException {
        return switch (fileType.toLowerCase()){
            case "pdf" -> extractFromPdf(file);
            case "docx" -> extractFromDocx(file);
            case "txt" -> Files.readString(file.toPath());
            default -> throw new IllegalArgumentException("Unsupported file type: "  + fileType);
        };
    }

    public String extractFromPdf(File file) throws IOException {
        try(PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public String extractFromDocx(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
        XWPFDocument document = new XWPFDocument(fis);
        XWPFWordExtractor extractor = new XWPFWordExtractor(document))
        {
            return  extractor.getText();
        }
    }
}
