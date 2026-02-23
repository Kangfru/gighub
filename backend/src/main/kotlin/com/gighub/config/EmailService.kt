package com.gighub.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service

@Service
class EmailService(
    private val mailSender: JavaMailSender,
    @param:Value("\${app.mail.from}") private val fromEmail: String
) {

    private val log = LoggerFactory.getLogger(EmailService::class.java)

    fun sendPasswordResetEmail(email: String, token: String, resetUrl: String) {
        try {
            val message = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, false, "UTF-8")

            helper.setFrom(fromEmail)
            helper.setTo(email)
            helper.setSubject("[GigHub] 비밀번호 재설정 안내")
            helper.setText(buildResetEmailHtml(resetUrl), true)

            mailSender.send(message)
            log.info("비밀번호 재설정 이메일 발송: {}", email)
        } catch (e: Exception) {
            log.error("이메일 발송 실패: {}", email, e)
            throw e
        }
    }

    private fun buildResetEmailHtml(resetUrl: String): String {
        return """
            <!DOCTYPE html>
            <html lang="ko">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fafafa; margin: 0; padding: 40px 20px;">
              <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="font-size: 48px; margin-bottom: 12px;">🎸</div>
                  <h1 style="font-size: 24px; font-weight: 600; color: #171717; margin: 0;">GigHub</h1>
                </div>
                <h2 style="font-size: 18px; font-weight: 600; color: #171717; margin-bottom: 16px;">비밀번호 재설정</h2>
                <p style="color: #525252; line-height: 1.6; margin-bottom: 28px;">
                  비밀번호 재설정 요청을 받았습니다.<br>
                  아래 버튼을 클릭하여 새 비밀번호를 설정해 주세요.<br>
                  이 링크는 <strong>30분</strong> 후에 만료됩니다.
                </p>
                <div style="text-align: center; margin-bottom: 28px;">
                  <a href="$resetUrl"
                     style="display: inline-block; background: #171717; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 15px;">
                    비밀번호 재설정
                  </a>
                </div>
                <p style="color: #737373; font-size: 13px; line-height: 1.6;">
                  비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시해 주세요.<br>
                  링크가 클릭되지 않으면 계정은 안전하게 유지됩니다.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
                <p style="color: #a3a3a3; font-size: 12px; text-align: center; margin: 0;">
                  GigHub - 밴드 연습곡 투표 시스템
                </p>
              </div>
            </body>
            </html>
        """.trimIndent()
    }
}
