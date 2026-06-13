package com.xpwords.backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String from;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Código de recuperación - XPWords");
        message.setText(String.format("""
                Has solicitado restablecer tu contraseña en XPWords.
                                
                Tu código de recuperación es: %s
                                
                Este código expira en 15 minutos.
                Si no solicitaste este cambio, ignora este mensaje.
                                
                — El equipo de XPWords
                """, code));
        mailSender.send(message);
    }
}
