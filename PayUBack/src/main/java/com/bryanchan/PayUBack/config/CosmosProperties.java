package com.bryanchan.PayUBack.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cosmos")
public class CosmosProperties {

    @Value("${azure.cosmos.uri}")
    private String uri;

    @Value("${azure.cosmos.key}")
    private String key;

    @Value("${azure.cosmos.secondaryKey}")
    private String secondaryKey;

    @Value("${azure.cosmos.queryMetricsEnabled}")
    private boolean queryMetricsEnabled;

    @Value("${azure.cosmos.database}")
    private String database;

    public String getDatabase() {
        return database;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSecondaryKey() {
        return secondaryKey;
    }

    public void setSecondaryKey(String secondaryKey) {
        this.secondaryKey = secondaryKey;
    }

    public boolean isQueryMetricsEnabled() {
        return queryMetricsEnabled;
    }

    public void setQueryMetricsEnabled(boolean enableQueryMetrics) {
        this.queryMetricsEnabled = enableQueryMetrics;
    }
}
