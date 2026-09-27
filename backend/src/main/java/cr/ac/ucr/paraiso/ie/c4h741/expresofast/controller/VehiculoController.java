package cr.ac.ucr.paraiso.ie.c4h741.expresofast.controller;

import cr.ac.ucr.paraiso.ie.c4h741.expresofast.business.VehiculoService;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.VehiculoRequestDTO;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.VehiculoResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


 //endpoints de gestion de vehiculos. Restringido a ROLE_ADMIN
 //segun la matriz RBAC definida en SecurityConfig ("/api/vehiculos/**").
 
@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    public VehiculoController(VehiculoService vehiculoService) {
        this.vehiculoService = vehiculoService;
    }

    @GetMapping
    public ResponseEntity<List<VehiculoResponseDTO>> listar() {
        return ResponseEntity.ok(vehiculoService.listar());
    }

    @PostMapping
    public ResponseEntity<VehiculoResponseDTO> crear(@Valid @RequestBody VehiculoRequestDTO request) {
        VehiculoResponseDTO creado = vehiculoService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
}