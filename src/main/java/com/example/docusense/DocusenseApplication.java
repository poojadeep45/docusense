package com.example.docusense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DocusenseApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocusenseApplication.class, args);
	}

}
