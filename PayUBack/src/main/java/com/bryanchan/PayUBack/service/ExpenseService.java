package com.bryanchan.PayUBack.service;

import com.bryanchan.PayUBack.model.Expense;
import com.bryanchan.PayUBack.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public void deleteExpensesByGroupId(String groupId) {
        List<Expense> fetchedExpenses = expenseRepository.findExpensesByGroupId(groupId);
        if (!fetchedExpenses.isEmpty()) {
            expenseRepository.deleteAll(fetchedExpenses);
        }

    }
}
