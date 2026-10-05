package com.hackathon.riskengine.dto;

public class SectorBreakdownDto {

    private String sector;
    private long count;
    private Double totalNotional;
    private Double percentage;

    public SectorBreakdownDto() {
    }

    public SectorBreakdownDto(String sector, long count, Double totalNotional, Double percentage) {
        this.sector = sector;
        this.count = count;
        this.totalNotional = totalNotional;
        this.percentage = percentage;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public Double getTotalNotional() {
        return totalNotional;
    }

    public void setTotalNotional(Double totalNotional) {
        this.totalNotional = totalNotional;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
