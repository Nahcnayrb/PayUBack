package com.bryanchan.PayUBack.service;

import com.bryanchan.PayUBack.model.User;
import com.bryanchan.PayUBack.repository.UserRepository;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import org.jasypt.util.password.StrongPasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {


    @Autowired
    UserRepository userRepository;

    public User addUser(User user, boolean isUpdate) {
        List<User> users = userRepository.findUserByUsername(user.getUsername());
        if (users.isEmpty()) {
            // every created user is guaranteed to have a token
            if (!isUpdate) {
                // case add
                String token = ValueGenerator.generateNewValue();
                user.setToken(token);
                String plainPassword = user.getPassword();
                StrongPasswordEncryptor encryptor = new StrongPasswordEncryptor();
                user.setPassword(encryptor.encryptPassword(plainPassword));
            }
            userRepository.save(user);
            return user;
        } else {
            // case already exists
            return null;
        }
    }
}
