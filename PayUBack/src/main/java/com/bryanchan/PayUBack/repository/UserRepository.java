package com.bryanchan.PayUBack.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.bryanchan.PayUBack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends CosmosRepository<User, Integer> {

    @Query(value = "SELECT * FROM u")
    List<User> getAllUsers();
}
