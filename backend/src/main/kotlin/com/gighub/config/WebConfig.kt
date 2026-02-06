package com.gighub.config

import com.gighub.security.CurrentUserArgumentResolver
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
@EnableConfigurationProperties(com.gighub.security.jwt.JwtProperties::class)
class WebConfig(
    private val currentUserArgumentResolver: CurrentUserArgumentResolver,
    @Value("\${cors.allowed-origins:http://localhost:3000}")
    private val allowedOrigins: String
) : WebMvcConfigurer {

    private val logger = LoggerFactory.getLogger(javaClass)

    init {
        logger.info("========================================")
        logger.info("🌐 CORS Configuration Loaded")
        logger.info("Allowed Origins: $allowedOrigins")
        logger.info("Origins Array: ${allowedOrigins.split(",").map { it.trim() }}")
        logger.info("========================================")
    }

    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(currentUserArgumentResolver)
    }

    override fun addCorsMappings(registry: CorsRegistry) {
        val origins = allowedOrigins.split(",").map { it.trim() }.toTypedArray()

        logger.info("========================================")
        logger.info("🔧 Configuring CORS Mappings")
        logger.info("Pattern: /api/**")
        logger.info("Allowed Origins: ${origins.joinToString(", ")}")
        logger.info("Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS")
        logger.info("Allow Credentials: true")
        logger.info("========================================")

        registry.addMapping("/api/**")
            .allowedOrigins(*origins)
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
    }
}
