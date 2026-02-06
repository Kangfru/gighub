package com.gighub.security

import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import org.springframework.core.MethodParameter
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

@Component
class CurrentUserArgumentResolver : HandlerMethodArgumentResolver {

    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.hasParameterAnnotation(CurrentUser::class.java) &&
                parameter.parameterType == Long::class.java
    }

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?
    ): Long {
        val authentication = SecurityContextHolder.getContext().authentication
            ?: throw GigHubException.AuthenticationException(
                errorCode = ErrorCode.INVALID_TOKEN,
                message = "인증 정보가 없습니다"
            )

        return authentication.principal as? Long
            ?: throw GigHubException.AuthenticationException(
                errorCode = ErrorCode.INVALID_TOKEN,
                message = "유효하지 않은 인증 정보입니다"
            )
    }
}
