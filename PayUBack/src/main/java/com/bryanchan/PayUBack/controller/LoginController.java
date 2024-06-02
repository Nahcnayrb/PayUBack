package com.bryanchan.PayUBack.controller;


import com.azure.core.annotation.Get;
import com.bryanchan.PayUBack.model.User;
import com.bryanchan.PayUBack.repository.UserRepository;
import org.jasypt.util.password.StrongPasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/authenticate")
    public ResponseEntity<User> authenticate(@RequestBody User user) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");
        String username = user.getUsername();
        String password = user.getPassword();
        boolean authenticationSuccess = false;
        List<User> users = userRepository.findUserByUsername(username);
        if (!users.isEmpty()) {
            StrongPasswordEncryptor encryptor = new StrongPasswordEncryptor();
            String encryptedPassword = users.get(0).getPassword();
            authenticationSuccess = encryptor.checkPassword(password, encryptedPassword);
        }

        if (authenticationSuccess) {
            return new ResponseEntity(users.get(0), responseHeaders, HttpStatus.OK);
        } else {
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/{token}")
    public ResponseEntity<User> getUsersByToken(@PathVariable String token) {

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");
        List<User> users = userRepository.findUserByToken(token);

        if (!users.isEmpty()) {
            // found user
            return new ResponseEntity(users.get(0),responseHeaders, HttpStatus.OK);
        } else {
            // case did not find user
            return new ResponseEntity(HttpStatus.NOT_FOUND);
        }

    }
}
