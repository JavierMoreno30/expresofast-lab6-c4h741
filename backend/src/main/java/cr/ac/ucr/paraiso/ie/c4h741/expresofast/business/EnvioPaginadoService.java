package cr.ac.ucr.paraiso.ie.c4h741.expresofast.business;

import cr.ac.ucr.paraiso.ie.c4h741.expresofast.data.EnvioRepository;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.domain.Envio;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.EnvioDTO;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.exception.ResourceNotFoundException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.exception.ResourceNotFoundException;
import java.util.List;

@Service
public class EnvioPaginadoService {

    private final EnvioRepository envioRepository;

    public EnvioPaginadoService(EnvioRepository envioRepository) {
        this.envioRepository = envioRepository;
    }

    @Transactional(readOnly = true)
    public Page<EnvioDTO> listarPaginado(int page, int size, String sortBy, String dir,
                                          String busqueda, String estado) {
        Sort sort = "desc".equalsIgnoreCase(dir) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        boolean tieneBusqueda = busqueda != null && !busqueda.isBlank();
        boolean tieneEstado = estado != null && !estado.isBlank() && !"TODOS".equalsIgnoreCase(estado);

        Page<Envio> resultado;
        if (tieneBusqueda && tieneEstado) {
            resultado = envioRepository.buscarPorEstadoYPaginado(busqueda, estado.toUpperCase(), pageable);
        } else if (tieneBusqueda) {
            resultado = envioRepository.buscarPaginado(busqueda, pageable);
        } else if (tieneEstado) {
            resultado = envioRepository.findByEstadoEnvio(estado.toUpperCase(), pageable);
        } else {
            resultado = envioRepository.findAll(pageable);
        }

        return resultado.map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<EnvioDTO> listarViaStoredProcedure(String estado) {
        return envioRepository.spObtenerEnviosPorEstado(estado.toUpperCase()).stream()
                .map(this::toDTO)
                .toList();
    }

    private EnvioDTO toDTO(Envio envio) {
        return new EnvioDTO(
                envio.getId(),
                envio.getCodigoRastreo(),
                envio.getDireccionDestino(),
                envio.getCosto(),
                envio.getEstadoEnvio(),
                envio.getFechaCreacion()
        );
    }
        @Transactional(readOnly = true)
    public EnvioDTO buscarPorCodigoRastreo(String codigoRastreo) {
        Envio envio = envioRepository.findByCodigoRastreo(codigoRastreo)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe ningun envio con el codigo de rastreo " + codigoRastreo));
        return toDTO(envio);
    }
}