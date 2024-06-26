package com.bryanchan.PayUBack.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.bryanchan.PayUBack.model.Expense;
import com.bryanchan.PayUBack.model.Group;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends CosmosRepository<Group, String> {

    @Query(value="SELECT * FROM g WHERE EXISTS (SELECT * FROM u IN g.usernames WHERE u = @username)")
    List<Group> getGroupsByUsername(@Param("username") String username);
}
