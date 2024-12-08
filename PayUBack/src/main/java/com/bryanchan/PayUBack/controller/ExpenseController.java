package com.bryanchan.PayUBack.controller;

import com.azure.core.annotation.Get;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.bryanchan.PayUBack.model.BorrowerData;
import com.bryanchan.PayUBack.model.Expense;
import com.bryanchan.PayUBack.model.User;
import com.bryanchan.PayUBack.repository.ExpenseRepository;
import com.bryanchan.PayUBack.repository.UserRepository;
import com.bryanchan.PayUBack.service.ExpenseService;
import com.bryanchan.PayUBack.service.ReceiptService;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import org.jasypt.util.password.StrongPasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    ReceiptService receiptService;

    @PostMapping("/add")
    public ResponseEntity<String> add(@RequestBody Expense expense) {

        try {
            // expense object has the file
            expenseRepository.save(expense);
            return new ResponseEntity(expense.getId(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity("SERVER GOOFED", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PutMapping("/{expenseId}")
    public ResponseEntity<String> updateExistingExpense(@PathVariable String expenseId, @RequestBody Expense expense) {

        Optional<Expense> fetchedExpense = expenseRepository.findById(expenseId);
        if (fetchedExpense.isPresent()) {
            // case is an existing expense
            expenseRepository.delete(fetchedExpense.get());
            expenseRepository.save(expense);
            return new ResponseEntity("Expense updated", HttpStatus.OK);
        }
        return new ResponseEntity<String>("", HttpStatus.NOT_FOUND);
    }


    @PutMapping("/pay/{expenseId}/{username}")
    public ResponseEntity<String> markExpenseAsPaidForGivenUser(@PathVariable String expenseId, @PathVariable String username) {

        Optional<Expense> fetchedExpense = expenseRepository.findById(expenseId);
        if (fetchedExpense.isPresent()) {

            Expense e = fetchedExpense.get();
            for (BorrowerData b : e.getBorrowerDataList()) {
                if (b.getUsername().equals(username)) {
                    expenseRepository.delete(e);
                    b.setHasPaid(true);
                    expenseRepository.save(e);
                    break;
                }
            }

            return new ResponseEntity("Expense updated", HttpStatus.OK);

        } else {
            return new ResponseEntity<String>("", HttpStatus.NOT_FOUND);
        }

    }

    @PutMapping("/payAll/{payerUsername}/{borrowerUsername}")
    public ResponseEntity markAllAsPaid(@PathVariable String payerUsername, @PathVariable String borrowerUsername) {
        List<Expense> expenses = expenseRepository.findExpensesByPayerUsername(payerUsername);
        for (Expense e : expenses) {
            for (BorrowerData b : e.getBorrowerDataList()) {
                if (b.getUsername().equals(borrowerUsername) && (!b.isHasPaid())) {
                    // found borrower in current expense
                    // can safely remove old expense
                    expenseRepository.delete(e);
                    b.setHasPaid(true);
                    expenseRepository.save(e);
                }
            }
        }
        return new ResponseEntity("Expense updated", HttpStatus.OK);
    }

    @PutMapping("/payAllGroups/{groupId}/{payerUsername}/{borrowerUsername}")
    public ResponseEntity markAllAsPaidInCurrGroup(@PathVariable String groupId,
                                                   @PathVariable String payerUsername,
                                                   @PathVariable String borrowerUsername) {
        List<Expense> expenses = expenseRepository.findCurrGroupExpensesByPayerUsername(groupId,payerUsername);
        for (Expense e : expenses) {
            for (BorrowerData b : e.getBorrowerDataList()) {
                if (b.getUsername().equals(borrowerUsername) && (!b.isHasPaid())) {
                    // found borrower in current expense
                    // can safely remove old expense
                    expenseRepository.delete(e);
                    b.setHasPaid(true);
                    expenseRepository.save(e);
                }
            }
        }
        return new ResponseEntity("Expense updated", HttpStatus.OK);
    }


    @GetMapping("/{expenseId}")
    public ResponseEntity getExpenseById(@PathVariable String expenseId) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");

        Optional<Expense> expense = expenseRepository.findById(expenseId);

        if (expense.isPresent()) {
            // case found expense
            return new ResponseEntity<>(expense.get(), responseHeaders, HttpStatus.OK);
        } else {
            return new ResponseEntity<String>("", HttpStatus.NOT_FOUND);
        }

    }

    @GetMapping("owing/{username}")
    public ResponseEntity getExpensesWhereUserIsPayer(@PathVariable String username) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");

        List<Expense> expenses = expenseRepository.findExpensesByPayerUsername(username);
        if (!expenses.isEmpty()) {
            return new ResponseEntity<>(expenses, responseHeaders, HttpStatus.OK);
        }

        // case expense not found
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }


    @GetMapping("owed/{username}")
    public ResponseEntity getExpensesWhereUserIsBorrower(@PathVariable String username) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("ContentType", "application/json");

        List<Expense> expenses = expenseRepository.findExpensesByInvolvedUsername(username);
        if (!expenses.isEmpty()) {
            return new ResponseEntity<>(expenses, responseHeaders, HttpStatus.OK);
        }

        // case expense not found
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    @DeleteMapping("/wipe")
    public ResponseEntity<String> deleteAll() {
        expenseRepository.deleteAll();
        return new ResponseEntity<String>("", HttpStatus.OK);
    }

    @DeleteMapping("/{expenseID}")
    public ResponseEntity<String> deleteExpenseById(@PathVariable String expenseID) {
        Optional<Expense> fetchedExpense = expenseRepository.findById(expenseID);
        if (fetchedExpense.isPresent()) {
            receiptService.deleteReceipt(expenseID + ".png");
            receiptService.deleteReceipt(expenseID + ".jpg");
            expenseRepository.delete(fetchedExpense.get());
            return new ResponseEntity<String>("", HttpStatus.OK);
        } else {
            return new ResponseEntity<String>("", HttpStatus.NOT_FOUND);
        }
    }
}
