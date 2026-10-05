package com.hackathon.riskengine.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GdeltFetchResponseDto {

    private int total;
    private String query;
    private List<AnalysisResponseDto> articles = new ArrayList<>();

    public GdeltFetchResponseDto() {
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<AnalysisResponseDto> getArticles() {
        return articles;
    }

    public void setArticles(List<AnalysisResponseDto> articles) {
        this.articles = articles;
    }
}
