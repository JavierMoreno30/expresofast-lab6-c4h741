USE ExpresoFast_C4H741_II2026
GO

IF OBJECT_ID('dbo.SP_OBTENER_ENVIOS_POR_ESTADO', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_OBTENER_ENVIOS_POR_ESTADO;
GO

CREATE PROCEDURE SP_OBTENER_ENVIOS_POR_ESTADO
    @pEstado VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        envio_id,
        codigo_rastreo,
        direccion_destino,
        peso_kg,
        costo,
        estado_envio,
        vehiculo_id,
        conductor_id,
        fecha_creacion,
        fecha_modificacion
    FROM dbo.envio
    WHERE estado_envio = @pEstado
    ORDER BY fecha_creacion DESC;
END;
GO

EXEC SP_OBTENER_ENVIOS_POR_ESTADO @pEstado = 'EN_TRANSITO';