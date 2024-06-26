package com.bryanchan.PayUBack.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Id;
import java.text.DecimalFormat;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Container(containerName = "Expense", ru = "100")
public class Expense {


    @Id
    private String id;
    @PartitionKey
    private String payerUsername;

    // List of 3 length string arrays
    // stringEl[0] = borrowerUsername
    // stringEl[1] = "paid" or "unpaid"
    // StringEl[2] = payingAmount
    private List<BorrowerData> borrowerDataList;
    private double amount;
    private String description;
    private String date;
    private String groupId;

    public Expense(String payerUsername, List<BorrowerData> borrowerDataList, double amount, String description, String date, String groupId) {
        this.id = ValueGenerator.generateNewValue();
        this.payerUsername = payerUsername;
        this.borrowerDataList = borrowerDataList;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.groupId = groupId;


    }
}
