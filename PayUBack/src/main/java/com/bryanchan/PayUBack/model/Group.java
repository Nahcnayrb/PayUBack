package com.bryanchan.PayUBack.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Container(containerName = "Group", ru = "100")
public class Group {

    private String id;
    private String groupName;
    private List<String> usernames;
    private String colourHexCode;
    private String creatorUsername;

    public Group(String groupName, List<String> usernames, String colourHexCode, String creatorUsername) {
        this.id = ValueGenerator.generateNewValue();
        this.groupName = groupName;
        this.usernames = usernames;
        this.colourHexCode = colourHexCode;
        this.creatorUsername = creatorUsername;
    }



}
