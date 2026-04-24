package com.Smart_Campus_Operations_Hub.Campus_Hub.resource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ResourceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createResourceAsAdminReturnsCreated() throws Exception {
        Map<String, Object> payload = Map.of(
                "name", "Lab 01",
                "type", "LAB",
                "capacity", 40,
                "location", "Building A",
                "availableFrom", "08:00:00",
                "availableTo", "17:00:00",
                "status", "ACTIVE"
        );

        mockMvc.perform(post("/api/resources")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin", "admin123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Lab 01"));
    }

    @Test
    void createResourceAsUserIsForbidden() throws Exception {
        Map<String, Object> payload = Map.of(
                "name", "Meeting Room 1",
                "type", "MEETING_ROOM",
                "capacity", 12,
                "location", "Building B",
                "availableFrom", "09:00:00",
                "availableTo", "18:00:00",
                "status", "ACTIVE"
        );

        mockMvc.perform(post("/api/resources")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("user", "user123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listResourcesSupportsFilters() throws Exception {
        Map<String, Object> payload = Map.of(
                "name", "Lecture Hall 3",
                "type", "LECTURE_HALL",
                "capacity", 120,
                "location", "Main Block",
                "availableFrom", "07:30:00",
                "availableTo", "19:00:00",
                "status", "ACTIVE"
        );

        mockMvc.perform(post("/api/resources")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin", "admin123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/resources")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("user", "user123"))
                        .param("type", "LECTURE_HALL")
                        .param("minCapacity", "100")
                        .param("location", "main")
                        .param("availableFrom", "08:00:00")
                        .param("availableTo", "18:00:00")
                        .param("status", "ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("LECTURE_HALL"))
                .andExpect(jsonPath("$[0].availableFrom").value("07:30:00"));
    }

    @Test
    void patchAndDeactivateFlowWorksForAdmin() throws Exception {
        Map<String, Object> payload = Map.of(
                "name", "Projector X",
                "type", "EQUIPMENT",
                "capacity", 0,
                "location", "Media Center",
                "availableFrom", "08:00:00",
                "availableTo", "20:00:00",
                "status", "ACTIVE"
        );

        String response = mockMvc.perform(post("/api/resources")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin", "admin123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        Map<String, Object> patchPayload = Map.of(
                "location", "Media Center - Floor 2",
                "availableFrom", "09:00:00",
                "availableTo", "18:00:00"
        );

        mockMvc.perform(patch("/api/resources/{id}", id)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin", "admin123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Media Center - Floor 2"))
                .andExpect(jsonPath("$.availableFrom").value("09:00:00"));

        mockMvc.perform(delete("/api/resources/{id}", id)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin", "admin123")))
                .andExpect(status().isNoContent());
    }

    @Test
    void createResourceWithInvalidAvailabilityWindowReturnsBadRequest() throws Exception {
        Map<String, Object> payload = Map.of(
                "name", "Lab 04",
                "type", "LAB",
                "capacity", 25,
                "location", "Science Block",
                "availableFrom", "18:00:00",
                "availableTo", "08:00:00",
                "status", "ACTIVE"
        );

        mockMvc.perform(post("/api/resources")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin", "admin123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("availableFrom must be earlier than availableTo"));
    }
}
