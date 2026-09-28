package cr.ac.ucr.paraiso.ie.c4h741.expresofast.controller;

import cr.ac.ucr.paraiso.ie.c4h741.expresofast.business.EnvioPaginadoService;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.EnvioDTO;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/envios")
public class EnvioPaginadoController {

    private final EnvioPaginadoService envioPaginadoService;

    public EnvioPaginadoController(EnvioPaginadoService envioPaginadoService) {
        this.envioPaginadoService = envioPaginadoService;
    }

    @GetMapping
    public ResponseEntity<Page<EnvioDTO>> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(
                envioPaginadoService.listarPaginado(page, size, sortBy, direction, busqueda, estado));
    }

    @GetMapping("/procedimiento/{estado}")
    public ResponseEntity<List<EnvioDTO>> listarViaStoredProcedure(@PathVariable String estado) {
        return ResponseEntity.ok(envioPaginadoService.listarViaStoredProcedure(estado));
    }
        @GetMapping("/rastreo/{codigo}")
    public ResponseEntity<EnvioDTO> buscarPorRastreo(@PathVariable String codigo) {
        return ResponseEntity.ok(envioPaginadoService.buscarPorCodigoRastreo(codigo));
    }
}