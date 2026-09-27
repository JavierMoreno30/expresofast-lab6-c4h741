package cr.ac.ucr.paraiso.ie.c4h741.expresofast.business;

import cr.ac.ucr.paraiso.ie.c4h741.expresofast.data.EmpresaLogisticaRepository;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.data.VehiculoRepository;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.domain.EmpresaLogistica;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.domain.Vehiculo;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.VehiculoRequestDTO;
import cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto.VehiculoResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final EmpresaLogisticaRepository empresaLogisticaRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository,
                            EmpresaLogisticaRepository empresaLogisticaRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.empresaLogisticaRepository = empresaLogisticaRepository;
    }

    @Transactional(readOnly = true)
    public List<VehiculoResponseDTO> listar() {
        return vehiculoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public VehiculoResponseDTO crear(VehiculoRequestDTO request) {
        if (vehiculoRepository.existsByPlaca(request.getPlaca())) {
            throw new NegocioException("Ya existe un vehiculo registrado con la placa " + request.getPlaca());
        }

        // El proyecto solo maneja una empresa logistica (ExpresoFast), se asigna automaticamente.
        EmpresaLogistica empresa = empresaLogisticaRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new NegocioException(
                        "No hay una empresa logistica registrada en el sistema para asignar el vehiculo."));

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPlaca(request.getPlaca());
        vehiculo.setCapacidadKg(request.getCapacidadKg());
        vehiculo.setEstado("DISPONIBLE");
        vehiculo.setEmpresa(empresa);

        Vehiculo guardado = vehiculoRepository.save(vehiculo);
        return toResponseDTO(guardado);
    }

    private VehiculoResponseDTO toResponseDTO(Vehiculo vehiculo) {
        return new VehiculoResponseDTO(
                vehiculo.getId(), vehiculo.getPlaca(), vehiculo.getCapacidadKg(), vehiculo.getEstado());
    }
}