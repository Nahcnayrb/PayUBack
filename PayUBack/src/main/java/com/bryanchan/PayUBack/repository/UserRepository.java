package com.bryanchan.PayUBack.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.bryanchan.PayUBack.model.User;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CosmosRepository<User, String> {

    @Query(value = "SELECT * FROM u")
    List<User> getAllUsers();


    @Query(value="SELECT * FROM u where u.token=@token")
    List<User> findUserByToken(@Param("token") String token);

    @Query(value="SELECT * FROM u where u.username=@username")
    List<User> findUserByUsername(@Param("username") String username);


}
