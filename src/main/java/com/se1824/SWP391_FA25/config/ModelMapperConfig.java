package com.se1824.SWP391_FA25.config;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklistDetail;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistDetailResponse;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static org.hibernate.Hibernate.map;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}