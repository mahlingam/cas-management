package org.apereo.cas.mgmt.config;

import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.configuration.CasManagementConfigurationProperties;
import org.apereo.cas.mgmt.OauthController;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for register end point features.
 *
 * @author Travis Schmidt
 * @since 5.3.5
 */
@Configuration(value = "casManagementOAuthConfiguration", proxyBeanMethods = false)
@EnableConfigurationProperties({CasConfigurationProperties.class, CasManagementConfigurationProperties.class})
public class CasManagementOauthConfiguration {

    @Bean
    public OauthController oauthController() {
        return new OauthController();
    }

}
