\## Laboratorio 7 - Suite de Pruebas Unitarias e Integracion



Se implemento una suite de pruebas automatizadas con JUnit 5, Mockito y MockMvc, certificando un minimo de 85% de cobertura de instrucciones en la capa de servicios (`cr.ac.ucr.paraiso.ie.c4h741.expresofast.business`) mediante JaCoCo.



\### Pruebas incluidas



\- \*\*EnvioServiceTest\*\* (20 pruebas): creacion de envios, validacion de capacidad de vehiculo, transiciones de estado validas e invalidas, cancelacion de envios, generacion automatica de bitacora, calculo de tarifas parametrizado.

\- \*\*AuthServiceTest\*\* (2 pruebas): login exitoso y fallido, aislando el AuthenticationManager con Mockito.

\- \*\*EnvioControllerTest\*\* / \*\*AuthControllerTest\*\* (5 pruebas): pruebas de corte de controlador con `@WebMvcTest` y `MockMvc`, verificando codigos HTTP (200, 400, 401, 404) y estructura de las respuestas JSON.



\### Como ejecutar las pruebas



Correr solo las pruebas:

```bash

cd backend

mvnw.cmd clean test

```



Correr las pruebas y certificar el umbral de cobertura del 85% (falla el build si no se cumple):

```bash

cd backend

mvnw.cmd clean verify

```



\### Ver el reporte de cobertura



Despues de ejecutar `mvn clean verify` (o `mvn clean test` seguido de `mvn jacoco:report`), abrir en el navegador:

## Laboratorio 9 - Procedimientos Almacenados y Paginacion Relacional

Se implemento paginacion fisica a nivel de base de datos con `Pageable`/`Page<T>` de Spring Data, y un Stored Procedure nativo en SQL Server para consultar envios por estado.

### Endpoints nuevos

- `GET /api/v1/envios` — paginado, acepta `page`, `size`, `sortBy`, `direction`, `busqueda`, `estado`.
- `GET /api/v1/envios/procedimiento/{estado}` — invoca `SP_OBTENER_ENVIOS_POR_ESTADO` via `@Procedure`.

### Scripts SQL

Ubicados en `database/`, corridos sobre `ExpresoFast_C4H741_II2026`:
- Creacion del procedimiento `SP_OBTENER_ENVIOS_POR_ESTADO`.
- Semillas: 15 envios con estados variados para probar la paginacion.

### Vista web

`frontend/dashboard_paginado.html` — tabla paginada con filtros de busqueda, estado y tamaño de pagina, mas los controles Primera/Anterior/Siguiente/Ultima.

## Laboratorio 10 - Frontend Angular Standalone

Migracion del cliente web de ExpresoFast a una SPA en Angular Standalone (`frontend-angular/`) que consume la API RESTful de Spring Boot (`backend/`).

### Requisitos

- Java 21 y Maven (se usa el wrapper `mvnw`)
- Node.js 18+ y Angular CLI (`npm install -g @angular/cli`)
- SQL Server con la base `ExpresoFast_C4H741_II2026` (scripts en `database/`)

### Ejecutar el backend

```bash
cd backend
mvnw.cmd spring-boot:run
```

La API queda en `http://localhost:8080/api/v1/`.

### Ejecutar el frontend

```bash
cd frontend-angular
npm install
ng serve
```

La aplicacion queda en `http://localhost:4200`.

### Vistas

- `/envios`: tabla de envios con insignias de estado y selector para cambiar el estado.
- `/nuevo-envio`: formulario de registro de envios.
- `/rastreo`: busqueda por codigo de rastreo con barra de progreso.

### Credenciales de prueba

- Usuario: `<admin>`
- Contrasena: `<admin123>`

## Laboratorio 11 - Formularios Reactivos Avanzados y Consolidación Full-Stack

Se agregó la relación 1:N entre `Envio` y `Paquete` (SQL Server + JPA) y un formulario reactivo tipado en Angular (`/nuevo-envio-avanzado`) que registra un envío con varios paquetes en una sola transacción.

### Pregunta 1: UX y escalabilidad de FormArray

Un `FormArray` te deja crear y quitar controles en tiempo de ejecución, así que el formulario muestra solo los paquetes que el operador realmente necesita. Con 10 campos estáticos ocultos pasa lo contrario: el DOM carga los 10 bloques aunque se usen 2, hay que programar a mano cuándo mostrar o esconder cada uno, y el límite de 10 queda pegado en el HTML.

Para el operador, agregar o quitar un paquete es un clic, sin tope artificial. Cada control lleva su propio estado (`touched`, `dirty`, errores), entonces el mensaje de error sale solo en el campo que falló. Además, la validez del `FormArray` se suma sola a la del `FormGroup` padre: si un paquete es inválido, `form.invalid` pasa a `true` y el botón de envío se deshabilita sin escribir nada extra.

En mantenimiento también gana. La estructura de un paquete se define una sola vez en `crearPaquete()` y se reutiliza dentro de un `@for`, así que si hay que cambiar una regla, como el peso máximo, se toca un solo lugar y no 10 copias del HTML. Con campos estáticos, encima, tendría que armar el arreglo del payload a mano (`paquete1`, `paquete2`, ...), mientras que con el `FormArray`, `getRawValue()` devuelve directamente la lista que espera el `EnvioRegistroDTO`. Y como el formulario es tipado (`FormControl<number>`), TypeScript avisa en compilación si se intenta meter un string en el peso.

### Pregunta 2: Event Loop, validador síncrono vs asíncrono

JavaScript corre en un solo hilo con una pila de llamadas (call stack). El validador cruzado de fechas es síncrono: se ejecuta dentro de esa misma pila, justo cuando Angular recalcula la validez después de un cambio. Solo compara dos fechas que ya están en memoria y devuelve `null` o `{ fechasInvalidas: true }` al instante, así que cuando la función termina el estado del formulario ya quedó calculado.

El validador de tracking no puede hacer eso, porque tiene que saber si el código existe en la base de datos y esa respuesta depende de la red. Si se quedara esperando con la pila bloqueada, el hilo único se congelaría y la interfaz dejaría de responder. Lo que pasa en realidad es que la petición HTTP se le delega a una API del navegador (Web API) y la pila queda libre. Cuando llega la respuesta, su callback entra a la cola de tareas y el Event Loop lo ejecuta apenas la pila esté vacía. El `timer(400)` del validador funciona igual: es un `setTimeout` que se encola como macrotarea y de paso sirve de debounce.

Por eso el validador asíncrono tiene que retornar un `Observable` o una `Promise`. La función debe devolver algo en el momento y, como el resultado todavía no existe, devuelve un "contenedor" del valor futuro. Mientras tanto Angular marca el control como `PENDING` y se suscribe; cuando el `Observable` emite, actualiza los errores y pasa el estado a `VALID` o `INVALID`. Si el usuario sigue escribiendo, Angular cancela la suscripción anterior y descarta la respuesta vieja. Eso sí, el `Observable` tiene que completarse para que Angular tome el resultado, y los validadores asíncronos solo corren si los síncronos del mismo campo ya pasaron.