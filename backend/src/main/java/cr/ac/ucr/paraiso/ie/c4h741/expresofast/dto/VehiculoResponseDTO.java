package cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto;

import java.math.BigDecimal;

public class VehiculoResponseDTO {

    private Integer id;
    private String placa;
    private BigDecimal capacidadKg;
    private String estado;

    public VehiculoResponseDTO(Integer id, String placa, BigDecimal capacidadKg, String estado) {
        this.id = id;
        this.placa = placa;
        this.capacidadKg = capacidadKg;
        this.estado = estado;
    }

    public Integer getId() { return id; }
    public String getPlaca() { return placa; }
    public BigDecimal getCapacidadKg() { return capacidadKg; }
    public String getEstado() { return estado; }
}