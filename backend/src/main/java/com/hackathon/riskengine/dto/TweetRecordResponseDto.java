package com.hackathon.riskengine.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TweetRecordResponseDto {

    @JsonProperty("tweet_id")
    private String tweetId;

    @JsonProperty("ticker")
    private String ticker;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("text")
    private String text;

    @JsonProperty("retweet_count")
    private int retweetCount;

    @JsonProperty("like_count")
    private int likeCount;

    @JsonProperty("analysis")
    private AnalysisResponseDto analysis;

    public TweetRecordResponseDto() {
    }

    public String getTweetId() {
        return tweetId;
    }

    public void setTweetId(String tweetId) {
        this.tweetId = tweetId;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getRetweetCount() {
        return retweetCount;
    }

    public void setRetweetCount(int retweetCount) {
        this.retweetCount = retweetCount;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }

    public AnalysisResponseDto getAnalysis() {
        return analysis;
    }

    public void setAnalysis(AnalysisResponseDto analysis) {
        this.analysis = analysis;
    }
}
