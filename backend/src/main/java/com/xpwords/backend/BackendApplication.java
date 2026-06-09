package com.xpwords.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadDotenv();
		SpringApplication.run(BackendApplication.class, args);
	}

	static void loadDotenv() {
		try (BufferedReader reader = new BufferedReader(new FileReader(".env"))) {
			String line;
			while ((line = reader.readLine()) != null) {
				line = line.trim();
				if (line.isEmpty() || line.startsWith("#")) continue;
				int eq = line.indexOf('=');
				if (eq > 0) {
					System.setProperty(line.substring(0, eq).trim(), line.substring(eq + 1).trim());
				}
			}
		} catch (IOException ignored) {}
	}

}
