# Configuración Final: Búsqueda de Usuarios y Notificaciones Push

Esta guía te ayudará a completar la configuración de las funcionalidades implementadas.

## 📋 Pasos de Configuración

### 1. Actualizar Reglas de Firebase

Sigue la guía en [`firebase-rules-guide.md`](file:///Users/ivanzsasz/2DAM/Desarrollo%20Interfaces/ClonarTrello/firebase-rules-guide.md) para actualizar manualmente las reglas de Firestore y Storage.

**Importante**: Debes hacer esto ANTES de probar la aplicación.

---

### 2. Generar VAPID Key para FCM

Las notificaciones push requieren una clave VAPID. Sigue estos pasos:

#### Paso 1: Ir a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **trello-clone-dfb8d**
3. Ve a **Project Settings** (⚙️ en el menú lateral)
4. Selecciona la pestaña **Cloud Messaging**

#### Paso 2: Generar Web Push Certificates

1. Busca la sección **Web Push certificates**
2. Haz clic en **Generate key pair**
3. Copia la clave generada (empieza con algo como `BK...`)

#### Paso 3: Actualizar el Código

Abre el archivo `user-search-notifications.js` y busca la línea:

```javascript
vapidKey: 'YOUR_VAPID_KEY_HERE'
```

Reemplázala con tu clave VAPID:

```javascript
vapidKey: 'BK...' // Tu clave VAPID aquí
```

---

### 3. Desplegar Cloud Functions

Las notificaciones push requieren Cloud Functions. Sigue la guía en [`CLOUD_FUNCTIONS_DEPLOY.md`](file:///Users/ivanzsasz/2DAM/Desarrollo%20Interfaces/ClonarTrello/CLOUD_FUNCTIONS_DEPLOY.md).

**Comandos rápidos:**

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Ir al directorio del proyecto
cd "/Users/ivanzsasz/2DAM/Desarrollo Interfaces/ClonarTrello"

# Inicializar Functions (si no está inicializado)
firebase init functions

# Instalar dependencias
cd functions
npm install

# Desplegar
firebase deploy --only functions
```

---

### 4. Verificar la Instalación

#### Verificar Service Worker

1. Abre la aplicación en el navegador
2. Abre las DevTools (F12)
3. Ve a la pestaña **Application** > **Service Workers**
4. Deberías ver `firebase-messaging-sw.js` registrado

#### Verificar Permisos de Notificación

1. Al iniciar sesión, el navegador debería pedir permisos para notificaciones
2. Acepta los permisos
3. Verifica en la consola que se registró el token FCM

---

## 🧪 Pruebas

### Probar Búsqueda de Usuarios

1. **Crear usuarios de prueba:**
   - Registra 2-3 usuarios con diferentes emails
   - Ejemplo: `usuario1@test.com`, `usuario2@test.com`

2. **Probar búsqueda:**
   - Inicia sesión con usuario1
   - Crea un tablero
   - Haz clic en el botón de agregar participantes
   - Escribe en el campo de búsqueda: `usuario2`
   - Deberías ver resultados de búsqueda

3. **Agregar miembro:**
   - Haz clic en un usuario de los resultados
   - Verifica que se agregue a la lista de participantes

### Probar Notificaciones Push

1. **Configuración de dos usuarios:**
   - Abre la app en dos navegadores diferentes (o modo incógnito)
   - Inicia sesión con usuario1 en navegador 1
   - Inicia sesión con usuario2 en navegador 2
   - Acepta permisos de notificación en ambos

2. **Probar invitación a tablero:**
   - En navegador 1 (usuario1): crea un tablero
   - Agrega a usuario2 como participante
   - En navegador 2 (usuario2): deberías recibir una notificación

3. **Verificar en diferentes estados:**
   - **App en primer plano**: Notificación aparece como toast
   - **App en segundo plano**: Notificación del sistema
   - **App cerrada**: Notificación del sistema (al hacer clic, abre la app)

---

## 🔧 Solución de Problemas

### No aparecen resultados de búsqueda

**Problema**: Al buscar usuarios, no aparecen resultados.

**Solución**:
1. Verifica que las reglas de Firestore permitan lectura de la colección `users`
2. Asegúrate de que los usuarios se hayan creado en Firestore (revisa en Firebase Console)
3. Verifica en la consola del navegador si hay errores

### No se reciben notificaciones

**Problema**: Las notificaciones no llegan.

**Soluciones**:

1. **Verificar permisos del navegador:**
   - Ve a configuración del sitio en el navegador
   - Asegúrate de que las notificaciones estén permitidas

2. **Verificar VAPID Key:**
   - Asegúrate de haber actualizado la clave VAPID en `user-search-notifications.js`
   - La clave debe ser la misma que generaste en Firebase Console

3. **Verificar Cloud Functions:**
   - Ve a Firebase Console > Functions
   - Verifica que las funciones estén desplegadas
   - Revisa los logs para ver si hay errores

4. **Verificar token FCM:**
   - Abre la consola del navegador
   - Busca el mensaje "Token FCM registrado"
   - Ve a Firestore y verifica que el usuario tenga un campo `fcmToken`

### Error al desplegar Cloud Functions

**Problema**: `firebase deploy` falla.

**Soluciones**:

1. **Verificar plan Blaze:**
   - Ve a Firebase Console > Usage and billing
   - Asegúrate de que el plan Blaze esté activo

2. **Verificar autenticación:**
   ```bash
   firebase logout
   firebase login
   ```

3. **Reinstalar dependencias:**
   ```bash
   cd functions
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 📚 Archivos Creados

- ✅ `firebase-rules-guide.md` - Guía para actualizar reglas manualmente
- ✅ `firebase-messaging-sw.js` - Service Worker para notificaciones
- ✅ `functions/index.js` - Cloud Functions para enviar notificaciones
- ✅ `functions/package.json` - Dependencias de Cloud Functions
- ✅ `user-search-notifications.js` - Funciones de búsqueda y notificaciones
- ✅ `CLOUD_FUNCTIONS_DEPLOY.md` - Guía de despliegue de Cloud Functions
- ✅ `SETUP.md` - Este archivo

---

## 🎯 Próximos Pasos

1. [ ] Actualizar reglas de Firebase
2. [ ] Generar y configurar VAPID Key
3. [ ] Desplegar Cloud Functions
4. [ ] Probar con múltiples usuarios
5. [ ] Verificar notificaciones en diferentes estados

---

## 💡 Consejos

> [!TIP]
> **Pruebas locales**: Usa dos navegadores diferentes o modo incógnito para simular múltiples usuarios.

> [!TIP]
> **Depuración**: Abre la consola del navegador (F12) para ver logs y errores.

> [!WARNING]
> **VAPID Key**: Sin la clave VAPID configurada, las notificaciones NO funcionarán.

> [!IMPORTANT]
> **Cloud Functions**: Deben estar desplegadas para que las notificaciones funcionen correctamente.
