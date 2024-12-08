package com.bryanchan.PayUBack.model;


import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import lombok.Getter;
import lombok.Setter;
import org.apache.tomcat.util.codec.binary.Base64;
import org.jasypt.util.password.StrongPasswordEncryptor;
import org.springframework.lang.Nullable;

import javax.persistence.*;

@Getter
@Setter
@Container(containerName = "User", ru = "100")
public class User {

    @Id
    private String id;

    private String username;

    @Nullable
    private String firstName;

    @Nullable
    @PartitionKey
    private String lastName;
    private String password;
    private String token;
    private String email;
    private String resetPasswordKey;

    public User(String firstName, String lastName, String username, String password, String email) {
        this.id = ValueGenerator.generateNewValue();
        if (firstName != null) {
            this.firstName = firstName.trim();
        } else {
            // case first name is null
            this.firstName = "";
        }

        if (lastName != null) {
            this.lastName = lastName.trim();
        } else {
            // case last name null
            this.lastName = "";
        }

        this.username = username.toLowerCase().trim();
        this.password = password;
        if (email != null) {
            this.email = email.trim();
        } else {
            this.email = "";
        }
    }





}
