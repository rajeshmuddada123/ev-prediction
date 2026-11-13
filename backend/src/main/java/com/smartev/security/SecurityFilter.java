package com.smartev.security;

import com.smartev.service.SecurityMonitoringService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1)
public class SecurityFilter implements Filter {

    private final SecurityMonitoringService securityService;

    public SecurityFilter(SecurityMonitoringService securityService) {
        this.securityService = securityService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String ip = req.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = req.getRemoteAddr();
        } else if (ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        String uri = req.getRequestURI();
        String method = req.getMethod();
        String queryString = req.getQueryString();

        // Let static assets and actuator pass without aggressive inspection
        if (!uri.startsWith("/api/security/simulate-probe") && uri.startsWith("/api/")) {
            boolean allowed = securityService.inspectRequest(ip, uri, method, queryString);
            if (!allowed) {
                res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                res.setContentType("application/json");
                res.getWriter().write("{\"error\": \"Request blocked by SMART EV active threat mitigation firewall.\"}");
                return;
            }
        }

        // Add essential security defense headers
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        chain.doFilter(request, response);
    }
}
