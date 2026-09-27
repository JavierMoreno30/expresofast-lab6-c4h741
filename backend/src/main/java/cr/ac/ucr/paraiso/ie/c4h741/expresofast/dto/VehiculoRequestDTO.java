package cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class VehiculoRequestDTO {

    @NotBlank(message = "La placa es obligatoria")
    private String placa;

    @NotNull(message = "La capacidad es obligatoria")
    @Positive(message = "La capacidad debe ser mayor a cero")
    private BigDecimal capacidadKg;

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public BigDecimal getCapacidadKg() { return capacidadKg; }
    public void setCapacidadKg(BigDecimal capacidadKg) { this.capacidadKg = capacidadKg; }
}