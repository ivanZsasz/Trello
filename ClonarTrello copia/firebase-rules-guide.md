# Guía: Actualizar Reglas de Firebase Manualmente

Esta guía te muestra cómo actualizar las reglas de seguridad de Firestore y Storage desde la consola de Firebase.

## 📋 Índice

1. [Actualizar Reglas de Firestore](#actualizar-reglas-de-firestore)
2. [Actualizar Reglas de Storage](#actualizar-reglas-de-storage)
3. [Reglas Recomendadas](#reglas-recomendadas)

---

## Actualizar Reglas de Firestore

### Paso 1: Acceder a la Consola de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **trello-clone-dfb8d**
3. En el menú lateral, haz clic en **Firestore Database**
4. Selecciona la pestaña **Reglas** (Rules)

### Paso 2: Editar las Reglas

En el editor de reglas, reemplaza el contenido actual con las reglas recomendadas (ver sección abajo).

### Paso 3: Publicar las Reglas

1. Haz clic en el botón **Publicar** (Publish)
2. Confirma la publicación
3. Espera a que se apliquen los cambios (generalmente toma unos segundos)

> [!TIP]
> Puedes usar el **Simulador de Reglas** para probar tus reglas antes de publicarlas. Haz clic en la pestaña "Reglas" y luego en "Simulador".

---

## Actualizar Reglas de Storage

### Paso 1: Acceder a Storage

1. En la consola de Firebase, haz clic en **Storage** en el menú lateral
2. Selecciona la pestaña **Reglas** (Rules)

### Paso 2: Editar las Reglas

Reemplaza el contenido con las reglas recomendadas para Storage.

### Paso 3: Publicar

1. Haz clic en **Publicar** (Publish)
2. Confirma los cambios

---

## Reglas Recomendadas

### Reglas de Firestore

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios - lectura pública (solo info básica), escritura solo del propio usuario
    match /users/{userId} {
      allow read: if true; // Permite búsqueda de usuarios
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Tokens FCM - solo el usuario puede leer/escribir su propio token
      match /fcmTokens/{tokenId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Colección de tarjetas (cards) - solo el propietario
    match /cards/{cardId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Colección de tableros - propietario y miembros
    match /users/{userId}/boards/{boardId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      request.auth.uid in resource.data.members);
      allow write: if request.auth != null && 
                      (request.auth.uid == userId || 
                       request.auth.uid in resource.data.members);
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Listas dentro de los tableros
      match /lists/{listId} {
        allow read, write: if request.auth != null && 
                              (request.auth.uid == userId || 
                               request.auth.uid in get(/databases/$(database)/documents/users/$(userId)/boards/$(boardId)).data.members);
        
        // Tarjetas dentro de las listas
        match /cards/{cardId} {
          allow read, write: if request.auth != null && 
                                (request.auth.uid == userId || 
                                 request.auth.uid in get(/databases/$(database)/documents/users/$(userId)/boards/$(boardId)).data.members);
        }
      }
    }
    
    // Colección de notificaciones
    match /notifications/{notificationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.recipientId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.recipientId;
    }
  }
}
```

### Reglas de Storage

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Archivos adjuntos de tarjetas
    match /attachments/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fondos de tableros personalizados
    match /board-backgrounds/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Avatares de usuario
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true; // Los avatares son públicos
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🔒 Explicación de las Reglas

### Reglas de Firestore

1. **Colección `users`**: 
   - Lectura pública para permitir búsqueda de usuarios
   - Escritura solo del propio usuario
   - Tokens FCM privados

2. **Colección `cards`**: 
   - Solo el propietario puede leer/escribir sus tarjetas

3. **Tableros (`users/{userId}/boards/{boardId}`)**: 
   - Lectura/escritura para el propietario y miembros del tablero
   - Las listas y tarjetas heredan los permisos del tablero

4. **Notificaciones**: 
   - Solo el destinatario puede leer sus notificaciones
   - Cualquier usuario autenticado puede crear notificaciones

### Reglas de Storage

1. **Archivos adjuntos**: 
   - Solo el propietario puede subir archivos
   - Usuarios autenticados pueden leer archivos

2. **Fondos de tableros**: 
   - Solo el propietario puede subir fondos personalizados
   - Usuarios autenticados pueden verlos

3. **Avatares**: 
   - Públicos para lectura
   - Solo el propietario puede actualizar su avatar

---

## ⚠️ Notas Importantes

> [!WARNING]
> Después de actualizar las reglas, puede tomar hasta **1 minuto** para que los cambios se propaguen completamente.

> [!CAUTION]
> **Nunca** uses `allow read, write: if true;` en producción, ya que permite acceso completo a todos los usuarios.

> [!TIP]
> Usa el **Simulador de Reglas** en la consola de Firebase para probar diferentes escenarios antes de publicar.

---

## 🧪 Verificar las Reglas

Después de publicar las reglas, verifica que funcionan correctamente:

1. **Prueba de lectura de usuarios**: Intenta buscar usuarios desde la aplicación
2. **Prueba de tableros compartidos**: Invita a un usuario a un tablero y verifica que puede acceder
3. **Prueba de seguridad**: Intenta acceder a datos de otro usuario (debe fallar)

---

## 📚 Recursos Adicionales

- [Documentación oficial de Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Documentación oficial de Storage Security Rules](https://firebase.google.com/docs/storage/security/start)
- [Guía de mejores prácticas de seguridad](https://firebase.google.com/docs/rules/basics)
