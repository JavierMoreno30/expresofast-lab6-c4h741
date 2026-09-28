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
import java.util.Optional;

@Repository
public interface EnvioRepository extends JpaRepository<Envio, Integer> {
     //Recupera todos los envios junto con Vehiculo, EmpresaLogistica y Conductor
     //en un unico viaje a la base de datos, evitando el fallo N+1 SELECT.
    @Query("""
            SELECT e FROM Envio e
            JOIN FETCH e.vehiculo v
            JOIN FETCH v.empresa
            JOIN FETCH e.conductor
            """)
    List<Envio> findAllOptimizado();

    /**
     * Actualiza de forma masiva el estado de todos los envios
     * asociados a un vehiculo especifico.
     * clearAutomatically = true limpia el contexto de persistencia
     * para evitar datos desactualizados en cache tras el UPDATE masivo.
     */
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Envio e
            SET e.estadoEnvio = :estado
            WHERE e.vehiculo.id = :vehiculoId
            """)
    int actualizarEstadoPorVehiculo(@Param("vehiculoId") Integer vehiculoId,
                                     @Param("estado") String estado);


    //paginacion relacional y Stored Procedure
Page<Envio> findByEstadoEnvio(String estadoEnvio, Pageable pageable);


Optional<Envio> findByCodigoRastreo(String codigoRastreo);

    
     //Busqueda paginada por texto libre, en codigo de rastreo o direccion destino.
     
    @Query("""
            SELECT e FROM Envio e
            WHERE LOWER(e.codigoRastreo) LIKE LOWER(CONCAT('%', :busqueda, '%'))
               OR LOWER(e.direccionDestino) LIKE LOWER(CONCAT('%', :busqueda, '%'))
            """)
    Page<Envio> buscarPaginado(@Param("busqueda") String busqueda, Pageable pageable);

    
     //Combina busqueda de texto libre con filtro de estado, paginado.
    @Query("""
            SELECT e FROM Envio e
            WHERE e.estadoEnvio = :estado
              AND (LOWER(e.codigoRastreo) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                   OR LOWER(e.direccionDestino) LIKE LOWER(CONCAT('%', :busqueda, '%')))
            """)
    Page<Envio> buscarPorEstadoYPaginado(@Param("busqueda") String busqueda,
                                          @Param("estado") String estado,
                                          Pageable pageable);

    /**
     * Invoca SP_OBTENER_ENVIOS_POR_ESTADO. El SP devuelve las columnas reales
     * de la tabla (sin alias), por eso Hibernate puede mapear el resultado
     * directamente a la entidad Envio.
     */
    @Procedure(procedureName = "SP_OBTENER_ENVIOS_POR_ESTADO")
    List<Envio> spObtenerEnviosPorEstado(@Param("pEstado") String pEstado);
}