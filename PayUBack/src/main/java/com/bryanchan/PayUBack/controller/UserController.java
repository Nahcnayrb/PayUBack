package com.bryanchan.PayUBack.controller;

import com.azure.core.annotation.Get;
import com.azure.cosmos.implementation.NotFoundException;
import com.azure.cosmos.models.PartitionKey;
import com.bryanchan.PayUBack.model.User;
import com.bryanchan.PayUBack.repository.UserRepository;

import com.bryanchan.PayUBack.service.UserService;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import org.apache.coyote.Response;
import org.jasypt.util.password.StrongPasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin
@RestController
@RequestMapping("/users")
public class UserController {


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<String> add(@RequestBody User user) {

        User u = userService.addUser(user,false);

        if (u != null) {
            // case user created successfully
            return new ResponseEntity("New User created", HttpStatus.OK);
        } else {
            // case user already exists
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
    public ResponseEntity<String> deleteExistingUser(@PathVariable String username) {
        List<User> users = userRepository.findUserByUsername(username);
        if (!users.isEmpty()) {
            userRepository.delete(users.get(0));
        }
        return new ResponseEntity<String>("", HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/wipe")
    public ResponseEntity<String> deleteAll() {
        userRepository.deleteAll();
        return new ResponseEntity<String>("", HttpStatus.NO_CONTENT);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateExistingUser(@RequestBody User c) {

        Optional<User> potentialUser = userRepository.findById(c.getId());
        if (potentialUser.isPresent()) {
            User u = potentialUser.get();
            c.setToken(u.getToken());
            c.setId(u.getId());
            c.setPassword(u.getPassword());
            userRepository.delete(u);
            User createdUser = userService.addUser(c,true);
            if (createdUser != null) {
                return new ResponseEntity<String>("", HttpStatus.OK);
            } else {
                // username is already taken
                return new ResponseEntity<String>("", HttpStatus.CONFLICT);
            }
        }
        return new ResponseEntity<String>("", HttpStatus.NO_CONTENT);
    }

    @PutMapping("/forgotPassword")
    public ResponseEntity forgotPassword(@RequestBody Map<String, String> request) {
        // request should have two keys, username & email
        try {
            String username = request.get("username");
            String email = request.get("email");
            userService.forgotPassword(username, email);
            return new ResponseEntity<String>("", HttpStatus.OK);
        } catch (NotFoundException e) {
            // case data did not match an existing user
            return new ResponseEntity<String>("", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<String>("", HttpStatus.BAD_REQUEST);
        }

    }

    @PutMapping("/resetPassword")
    public ResponseEntity resetPassword(@RequestBody Map<String, String> request) {
        // request should have two keys, resetPasswordKey & password
        try {
            String resetPasswordKey = request.get("resetPasswordKey");
            String password = request.get("password");

            userService.resetPassword(resetPasswordKey, password);
            return new ResponseEntity<String>("", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<String>("", HttpStatus.BAD_REQUEST);
        }

    }

    @GetMapping("/validate/{resetPasswordKey}")
    public ResponseEntity checkResetPasswordKeyIsValid(@PathVariable String resetPasswordKey) {
        List<User> users = userRepository.findUserByResetPasswordKey(resetPasswordKey);
        if (users.size() == 0) {
            return new ResponseEntity<String>("", HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<String>("", HttpStatus.OK);
        }

    }


}
