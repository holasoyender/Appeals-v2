# Appeals v2

Sistema de apelación de baneos permanentes del servidor de **Ibai** y **LA CABRA** usando **MongoDB**
Para cualquier pregunta/sugerencia siempre podéis abrir una **issue**

## Como usar

1 - Crea una aplicación en Discord y añade el siguiente link a la sección Oauth2:
```http://<URL>/api/auth/discord/redirect```

2 - Rellena el archivo [.env](https://github.com/holasoyender/Appeals#ejemplo-de-arcivo-env) o tu hoja de variables de **Heroku**

3 - Añade el bot al servidor con los siguientes permisos: `Banear usuarios`, `Crear slash commands`, `Ver el registro de auditoría` y `Mandar mensajes`.
URL de ejemplo: ```https://discord.com/api/oauth2/authorize?client_id=<ID-DEL-CLIENTE>&permissions=2180&scope=bot%20applications.commands ```

4 - Crea un canal en el que el bot pueda `Mandar mensajes` y `Leer mensajes`

5 - Configurar al bot usando el archivo `config.ts`, este archivo solo contiene cosas visuales, como logos, banners, emojis, etc.

## Comandos disponibles

 - `/block <User>`: Bloquear a un usuario del servicio de apelaciones.
 - `/unblock <User>`: Desbloquear a un usuario del servicio de apelaciones.

## Ejemplo de archivo .env
```
PORT=4000
CLIENT_ID=781240994833104907
CLIENT_SECRET=elsecretdetucleinte
APP_SECRET=holasoyender
GUILD_ID=704029755975925841
CHANNEL_ID=755000173922615336
BOT_TOKEN=eltokendelbotparalaapp
MONGODB_URL=mongodb://localhost/Appeals
ROL_MODERADOR=728584717879869461
```

### PORT (Puerto)

El puerto en el que se va a iniciar el servidor.

### CLIENT_ID (ID del Cliente)

La ID de la app de Discord para el sistema oauth.

[![fotico](https://i.imgur.com/yW9neR4.png)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

### CLIENT_SECRET (Secret del Cliente)

El código secreto de la app de Discord para el sistema oauth.

[![fotico otra vez](https://i.imgur.com/SvTpAl3.png)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

### APP_SECRET (Secret de la APP)

Clave única para desencriptar las cookies del servidor.

### GUILD_ID (ID del Servidor)

La ID del servidor al que se le va a aplicar este sistema de apelaciones.

### CHANNEL_ID (ID del Canal de apelaciones)

La ID del canal en el que se mandaran los mensajes de apelaciones.

### BOT_TOKEN (Token del Bot)

El token del bot que estará en tu servidor para comprobar los bans y enviar el mensaje de apelación.

### MONGODB_URL (URL de MongoDB)

URL de la base de datos en MongoDB para guardar toda la información.

### ROL_MODERADOR (Rol de Moderador)

La ID del rol que podrá accionar los botones y comandos

## Diferencias con la versión anterior

 - **Más customizable**: Ahora puedes personalizar todo el aspecto visual del sistema con el archivo `config.ts`.
 - **Más seguro**: El sistema está encriptado con AES-256.
 - **Servidores separados**: Ahora el canal por el que se enviarán los embeds de apelaciones puede estar en un servidor diferente.
 - **Sin votaciones**: Ya no hay que votar para banear o desbanear a un usuario, cualquier moderador puede elegir.
 - **Más rápido**: El sistema está optimizado para una mayor velocidad.
 - 


