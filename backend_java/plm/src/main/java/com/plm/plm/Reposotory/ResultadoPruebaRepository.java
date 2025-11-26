package com.plm.plm.Reposotory;

import com.plm.plm.Models.ResultadoPrueba;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultadoPruebaRepository extends JpaRepository<ResultadoPrueba, Integer> {
    List<ResultadoPrueba> findByPruebaId(Integer pruebaId);
}

