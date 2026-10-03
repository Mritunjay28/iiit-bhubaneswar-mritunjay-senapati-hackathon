package com.hackathon.riskengine.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TweetFetchResponseDto {

    private int total;
    private List<TweetRecordResponseDto> results = new ArrayList<>();

    public TweetFetchResponseDto() {
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<TweetRecordResponseDto> getResults() {
        return results;
    }

    public void setResults(List<TweetRecordResponseDto> results) {
        this.results = results;
    }
}
