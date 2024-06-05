package com.bryanchan.PayUBack.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.bryanchan.PayUBack.model.Expense;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends CosmosRepository<Expense, String> {

    @Query(value="SELECT * FROM e WHERE EXISTS (SELECT b.username FROM b IN e.borrowerDataList" +
            " WHERE b.username=@username AND b.username != e.payerUsername)")
    List<Expense> findExpensesByInvolvedUsername(@Param("username") String username);

    @Query(value="SELECT * FROM e where e.payerUsername=@username")
    List<Expense> findExpensesByPayerUsername(@Param("username") String username);





}
