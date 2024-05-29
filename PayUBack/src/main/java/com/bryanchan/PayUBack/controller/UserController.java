package com.bryanchan.PayUBack.controller;

import com.azure.cosmos.models.PartitionKey;
import com.bryanchan.PayUBack.model.User;
import com.bryanchan.PayUBack.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {


    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public String add(@RequestBody User user) {
        userRepository.save(user);
        return "New User created";
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");
        List<User> userList = new ArrayList<>();

        userList = userRepository.getAllUsers();
        return new ResponseEntity<List<User>>(userList, responseHeaders, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<User>> getUsers(@PathVariable Integer id) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");
        List<User> userList = new ArrayList<>();

        List<Optional<User>> optionaUserList = Collections.singletonList(userRepository.findById(id));
        if (!(optionaUserList.get(0).isEmpty())) {
            optionaUserList.stream().forEach(c -> c.ifPresent(user -> userList.add(user)));
            return new ResponseEntity<List<User>>(userList, responseHeaders, HttpStatus.OK);
        }

        // case user not found
        return new ResponseEntity<List<User>>(userList, responseHeaders, HttpStatus.NOT_FOUND);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExistingCustomer(@PathVariable Integer id) {
        Optional<User> user = userRepository.findById(id);
        userRepository.deleteById(id, new PartitionKey(user.get().getLastName()));
        return new ResponseEntity<String>("", HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateExistingCustomer(@PathVariable Integer id, @RequestBody User c) {

        userRepository.save(c);
        return new ResponseEntity<String>("", HttpStatus.NO_CONTENT);
    }
}
