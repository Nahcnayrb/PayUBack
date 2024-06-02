package com.bryanchan.PayUBack.controller;

import com.azure.cosmos.models.PartitionKey;
import com.bryanchan.PayUBack.model.User;
import com.bryanchan.PayUBack.repository.UserRepository;

import com.bryanchan.PayUBack.utils.ValueGenerator;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {


    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public ResponseEntity<String> add(@RequestBody User user) {

        List<User> users = userRepository.findUserByUsername(user.getUsername());
        if (users.isEmpty()) {
            // every created user is guaranteed to have a token
            String token = ValueGenerator.generateNewValue();
            user.setToken(token);
            userRepository.save(user);
            return new ResponseEntity("New User created", HttpStatus.OK);
        } else {
            // case already exists
            return new ResponseEntity("user already exists", HttpStatus.CONFLICT);
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");

        List<User> userList = userRepository.getAllUsers();
        return new ResponseEntity<List<User>>(userList, responseHeaders, HttpStatus.OK);
    }

    @GetMapping("/{username}")
    public ResponseEntity getUsers(@PathVariable String username) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");

        List<User> users = userRepository.findUserByUsername(username);
        if (!users.isEmpty()) {
            return new ResponseEntity<User>(users.get(0), responseHeaders, HttpStatus.OK);
        }

        // case user not found
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    @DeleteMapping("/{username}")
    public ResponseEntity<String> deleteExistingCustomer(@PathVariable String username) {
        List<User> users = userRepository.findUserByUsername(username);
        if (!users.isEmpty()) {
            userRepository.delete(users.get(0));
        }
        return new ResponseEntity<String>("", HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{username}")
    public ResponseEntity<String> updateExistingUser(@PathVariable String username, @RequestBody User c) {

        List<User> users = userRepository.findUserByUsername(username);
        if (!users.isEmpty()) {
            c.setToken(users.get(0).getToken());
            c.setId(users.get(0).getId());
            this.deleteExistingCustomer(username);
            this.add(c);
        }
        return new ResponseEntity<String>("", HttpStatus.NO_CONTENT);
    }
}
