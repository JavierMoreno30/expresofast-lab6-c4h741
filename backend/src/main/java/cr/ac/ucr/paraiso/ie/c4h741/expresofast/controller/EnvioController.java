package cr.ac.ucr.paraiso.ie.c4h741.expresofast.controller;

import cr.ac.ucr.paraiso.ie.c4h741.expresofast.business.EnvioService;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.BitacoraResponseDTO;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.CambioEstadoDTO;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.EnvioRequestDTO;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.EnvioResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.EnvioRegistroDTO;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/envios")
public class EnvioController {

    private final EnvioService envioService;

    public EnvioController(EnvioService envioService) {
        this.envioService = envioService;
    }

    /** GET /api/envios/optimizados — ADMIN, OPERADOR, CONDUCTOR */
    @GetMapping("/optimizados")
    public ResponseEntity<List<EnvioResponseDTO>> listarOptimizados() {
        return ResponseEntity.ok(envioService.listarOptimizado());
    }

    /** POST /api/envios — ADMIN, OPERADOR */
    @PostMapping
    public ResponseEntity<EnvioResponseDTO> crear(@Valid @RequestBody EnvioRequestDTO request) {
        EnvioResponseDTO creado = envioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    /** PATCH /api/envios/{id}/estado — ADMIN, CONDUCTOR (genera bitacora) */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<EnvioResponseDTO> actualizarEstado(@PathVariable Integer id,
                                                               @Valid @RequestBody CambioEstadoDTO request) {
        EnvioResponseDTO actualizado = envioService.actualizarEstado(id, request);
        return ResponseEntity.ok(actualizado);
    }

    /** GET /api/envios/{id}/bitacora — ADMIN, OPERADOR */
    @GetMapping("/{id}/bitacora")
    public ResponseEntity<List<BitacoraResponseDTO>> obtenerBitacora(@PathVariable Integer id) {
        return ResponseEntity.ok(envioService.obtenerBitacora(id));
    }

    /** PATCH /api/envios/vehiculo/{vehiculoId}/estado — actualizacion masiva heredada del Lab 5 */
    @PatchMapping("/vehiculo/{vehiculoId}/estado")
    public ResponseEntity<Map<String, Object>> actualizarEstadoMasivo(@PathVariable Integer vehiculoId,
                                                                        @Valid @RequestBody EstadoEnvioRequest request) {
        int filasActualizadas = envioService.actualizarEstadoMasivoPorVehiculo(
                vehiculoId, request.getEstado().toUpperCase());
        return ResponseEntity.ok(Map.of("filasActualizadas", filasActualizadas));
    }
        /** POST /api/envios/con-paquetes — ADMIN, OPERADOR */
    @PostMapping("/con-paquetes")
    public ResponseEntity<EnvioResponseDTO> crearConPaquetes(@Valid @RequestBody EnvioRegistroDTO request) {
        EnvioResponseDTO creado = envioService.crearConPaquetes(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    /** GET /api/envios/check-tracking/{trackingNumber} — usado por el validador asíncrono de Angular */
    @GetMapping("/check-tracking/{trackingNumber}")
    public ResponseEntity<Map<String, Boolean>> checkTracking(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(Map.of("existe", envioService.existeCodigoRastreo(trackingNumber)));
    }
}