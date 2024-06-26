package com.bryanchan.PayUBack.controller;

import com.bryanchan.PayUBack.model.Expense;
import com.bryanchan.PayUBack.model.Group;
import com.bryanchan.PayUBack.repository.ExpenseRepository;
import com.bryanchan.PayUBack.repository.GroupRepository;
import com.bryanchan.PayUBack.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseService expenseService;

    @GetMapping("/{username}")
    // gets all the groups that the specifed user is in
    public ResponseEntity getAllGroupsByUsername(@PathVariable String username) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");

       List<Group> groups = groupRepository.getGroupsByUsername(username);

        if (!groups.isEmpty()) {
            return new ResponseEntity<>(groups, responseHeaders, HttpStatus.OK);
        }

        // case groups not found
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/add")
    public ResponseEntity addGroup(@RequestBody Group group) {
        try {
            groupRepository.save(group);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity deleteGroup(@PathVariable String groupId) {

        if (groupId.equals("individual")) {
            return new ResponseEntity<>("the individuals group cannot be deleted.", HttpStatus.BAD_REQUEST);
        }

        try {
            Optional<Group> g = groupRepository.findById(groupId);
            if (g.isPresent()) {
                // delete all related expenses
                expenseService.deleteExpensesByGroupId(groupId);
                groupRepository.delete(g.get());
                return new ResponseEntity<>(HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{groupId}/{username}")
    public ResponseEntity addUserToGroup(@PathVariable String groupId, @PathVariable String username) {
        Optional<Group> potentialGroup = groupRepository.findById(groupId);
        if (potentialGroup.isPresent()) {
            // found group
            Group g = potentialGroup.get();
            List<String> currUsernames = g.getUsernames();
            if (!currUsernames.contains(username)) {
                // ensures that a user doesn't join an already joined group
                currUsernames.add(username);
                g.setUsernames(currUsernames);
                groupRepository.delete(g);
                groupRepository.save(g);
            } else {
                // case user is already in group
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{groupId}")
    public ResponseEntity updateGroup(@PathVariable String groupId, @RequestBody Group group) {
        // find group to see if exists
        Optional<Group> potentialGroup = groupRepository.findById(groupId);
        if (potentialGroup.isPresent()) {
            // case exists
            Group g = potentialGroup.get();
            groupRepository.delete(g);
            groupRepository.save(group);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }



}
