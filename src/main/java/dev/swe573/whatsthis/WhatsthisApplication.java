package dev.swe573.whatsthis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

@SpringBootApplication
@PropertySource("file:env.properties")
public class WhatsthisApplication {

	public static void main(String[] args) {
		SpringApplication.run(WhatsthisApplication.class, args);
	}

}
