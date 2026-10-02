USE ExpresoFast_C4H741_II2026
GO

CREATE TABLE dbo.PAQUETES (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    envio_id INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    peso_kg DECIMAL(5,2) NOT NULL,
    CONSTRAINT FK_Paquetes_Envios FOREIGN KEY (envio_id)
        REFERENCES dbo.Envio(envio_id) ON DELETE CASCADE
);
GO

ALTER TABLE dbo.Envio ADD
    fecha_despacho DATE NULL,
    fecha_entrega_estimada DATE NULL;
GO