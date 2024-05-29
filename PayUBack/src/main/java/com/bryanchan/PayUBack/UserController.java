package com.bryanchan.PayUBack;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @RequestMapping
    public String getUsers() {
        return "user1";
    }
}
