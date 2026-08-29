package com.example.docusense.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TagDto {
    private Long tagId;
    private String tagName;
}
