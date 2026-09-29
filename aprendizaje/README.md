# Aula de aprendizaje

La plataforma institucional sirve ahora tambien los dos modulos de refuerzo bajo el mismo dominio:

- `aritmetica/`: contenido integrado desde `jorgemendieta86/JMRefuerzo`.
- `yachay/`: salida estatica generada desde `jorgemendieta86/Yachay`.

Las aplicaciones conservan sus estilos, logica de ejercicios y almacenamiento local para evitar colisiones con la web institucional. Para actualizar YACHAY se debe generar nuevamente su salida estatica con `npm run build` en el repositorio original y reemplazar el contenido de `yachay/`.
