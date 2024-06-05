package com.bryanchan.PayUBack.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BorrowerData {

    // List of 3 length string arrays
    // stringEl[0] = borrowerUsername
    // stringEl[1] = "paid" or "unpaid"
    // StringEl[2] = payingAmount

    private String username;
    private boolean hasPaid;
    private double amount;

    public BorrowerData(String username, boolean hasPaid, double amount) {
        this.username = username;
        this.hasPaid = hasPaid;
        this.amount = amount;

    }


}
