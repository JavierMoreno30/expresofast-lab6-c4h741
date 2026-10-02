package cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record EnvioRegistroDTO(
        @NotBlank(message = "El código de rastreo es obligatorio")
        @Pattern(regexp = "^EXP-\\d{4}$", message = "Formato inválido. Ejemplo: EXP-1234")
        String codigoRastreo,

        @NotBlank(message = "La dirección de destino es obligatoria")
        String direccionDestino,

        @NotNull(message = "El costo es obligatorio")
        @Positive(message = "El costo debe ser mayor a cero")
        BigDecimal costo,

        @NotNull(message = "Debe indicar el vehículo")
        Integer vehiculoId,

        @NotNull(message = "Debe indicar el conductor")
        Integer conductorId,

        @NotNull(message = "La fecha de despacho es obligatoria")
        LocalDate fechaDespacho,

        @NotNull(message = "La fecha de entrega estimada es obligatoria")
        LocalDate fechaEntregaEstimada,

        @NotEmpty(message = "Debe registrar al menos un paquete")
        @Valid
        List<PaqueteDTO> paquetes
) {
}