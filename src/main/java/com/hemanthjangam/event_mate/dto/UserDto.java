package com.hemanthjangam.event_mate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UserDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProfileUpdateRequest {
        private String name;
        private String email;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProfileResponse {
        private Long id;
        private String name;
        private String email;
        private String role;
    }
}
