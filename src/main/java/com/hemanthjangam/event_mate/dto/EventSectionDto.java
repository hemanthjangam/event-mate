package com.hemanthjangam.event_mate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSectionDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private int rows;
    private int cols;
    private String layoutConfig;
}
