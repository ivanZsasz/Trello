# Despliegue de Cloud Functions

Esta guía te ayudará a desplegar las Cloud Functions necesarias para las notificaciones push.

## Requisitos Previos

- Node.js instalado (versión 18 o superior)
- Firebase CLI instalado
- Plan Blaze activado en Firebase

## Instalación de Firebase CLI

Si no tienes Firebase CLI instalado:

```bash
npm install -g firebase-tools
```

## Pasos para Desplegar

### 1. Iniciar sesión en Firebase

```bash
firebase login
```

### 2. Inicializar Firebase en el proyecto (si no está inicializado)

```bash
cd "/Users/ivanzsasz/2DAM/Desarrollo Interfaces/ClonarTrello"
firebase init functions
```

Cuando te pregunte:
- **¿Qué proyecto quieres usar?**: Selecciona `trello-clone-dfb8d`
- **¿Qué lenguaje quieres usar?**: JavaScript
- **¿Quieres usar ESLint?**: No (opcional)
- **¿Quieres instalar dependencias ahora?**: Sí

### 3. Instalar dependencias

```bash
cd functions
npm install
```

### 4. Desplegar las funciones

```bash
firebase deploy --only functions
```

## Funciones Desplegadas

Después del despliegue, tendrás estas funciones disponibles:

1. **sendNotification**: Función callable para enviar notificaciones manualmente
2. **onBoardMemberAdded**: Trigger automático cuando se agrega un miembro a un tablero

## Verificar el Despliegue

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Functions** en el menú lateral
4. Deberías ver las funciones desplegadas

## Costos Estimados

Con el plan Blaze, las primeras:
- 2M invocaciones/mes son GRATIS
- 400,000 GB-segundos/mes son GRATIS

Para uso normal de notificaciones, deberías mantenerte en el nivel gratuito.

## Solución de Problemas

Si encuentras errores:

1. **Error de autenticación**: Ejecuta `firebase login` nuevamente
2. **Error de proyecto**: Verifica que estás en el proyecto correcto con `firebase projects:list`
3. **Error de dependencias**: Elimina `node_modules` y ejecuta `npm install` nuevamente
