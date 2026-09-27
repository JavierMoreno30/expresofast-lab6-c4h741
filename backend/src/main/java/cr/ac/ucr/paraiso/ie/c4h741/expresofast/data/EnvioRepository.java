package cr.ac.ucr.paraiso.ie.c4h741.expresofast.data;

import cr.ac.ucr.paraiso.ie.c4h741.expresofast.domain.Envio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnvioRepository extends JpaRepository<Envio, Integer> {

    @Query("""
            SELECT e FROM Envio e
            JOIN FETCH e.vehiculo v
            JOIN FETCH v.empresa
            JOIN FETCH e.conductor
            """)
    List<Envio> findAllOptimizado();

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Envio e
            SET e.estadoEnvio = :estado
            WHERE e.vehiculo.id = :vehiculoId
            """)
    int actualizarEstadoPorVehiculo(@Param("vehiculoId") Integer vehiculoId,
                                     @Param("estado") String estado);

    Page<Envio> findByEstadoEnvio(String estadoEnvio, Pageable pageable);

    @Query("""
            SELECT e FROM Envio e
            WHERE LOWER(e.codigoRastreo) LIKE LOWER(CONCAT('%', :busqueda, '%'))
               OR LOWER(e.direccionDestino) LIKE LOWER(CONCAT('%', :busqueda, '%'))
            """)
    Page<Envio> buscarPaginado(@Param("busqueda") String busqueda, Pageable pageable);

    @Query("""
            SELECT e FROM Envio e
            WHERE e.estadoEnvio = :estado
              AND (LOWER(e.codigoRastreo) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                   OR LOWER(e.direccionDestino) LIKE LOWER(CONCAT('%', :busqueda, '%')))
            """)
    Page<Envio> buscarPorEstadoYPaginado(@Param("busqueda") String busqueda,
                                          @Param("estado") String estado,
                                          Pageable pageable);

    @Procedure(procedureName = "SP_OBTENER_ENVIOS_POR_ESTADO")
    List<Envio> spObtenerEnviosPorEstado(@Param("pEstado") String pEstado);
}