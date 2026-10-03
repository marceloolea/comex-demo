# COMEX · Prototipo de gestión de importaciones

Proyecto de Marcelo Olea para demostrar la solicitud, aprobación y seguimiento de órdenes de compra y expedientes de importación.

## Flujo de demostración

- Historial de PO y consulta de avances.
- Nueva solicitud por pasos, con resumen editable y datos de maestros aprobados.
- Asignación de PO y creación de expediente por embarque.
- Aprobaciones consecutivas de Gerencia y Gerencia general, con rechazo, corrección y revisión.
- Generación de un PDF referencial y registro del envío a fábrica.
- Procesamiento de correos ficticios: identificación de PO, clasificación por nombre, archivo por etapa y actualización del seguimiento.
- Bandeja para revisar resultados y resolver mensajes sin una PO coincidente.
- Checklist documental, revisión del ingeniero y envío simulado a AGA.
- OT de transporte referencial, consulta de costos y referencia manual en MANAGER.
- Descarga de documentos de ejemplo, expediente ZIP y ficha JSON.

## Alcance

La aplicación usa datos ficticios y estado en memoria. Cada visitante tiene una sesión independiente; al recargar se restablecen los ejemplos. Los mensajes, la extracción documental, las aprobaciones y los envíos son simulados. Los PDF descargables son documentos de demostración, sin validez comercial. No hay conexión activa a correo, almacenamiento corporativo, IA ni MANAGER.

La regla de una PO por embarque, el circuito de aprobación, los formatos, las reglas de costeo y los permisos requieren validación con la empresa. Para dos embarques el prototipo muestra dos PO y un reparto equitativo de cantidades. Las 24 toneladas no se aplican como límite automático. Bodega está fuera de esta demostración.

Los módulos globales y las pestañas del expediente consultan los mismos registros de la sesión. Las integraciones, persistencia y seguridad corporativa corresponden a la implementación operativa.
