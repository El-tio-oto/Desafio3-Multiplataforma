# Zenith Finance - App de Finanzas

Aplicación móvil de finanzas con módulo de autenticación completo, desarrollada con React Native y Expo.

## Características

- **Diseño Dark Mode Premium**: Fondo oscuro casi negro, componentes gris oscuro/azulado con bordes finos, texto blanco y acentos en azul celeste brillante (#00C2FF)
- **Autenticación Completa**:
  - Pantalla de Login con validaciones en tiempo real
  - Pantalla de Registro con validaciones estrictas
  - Persistencia de sesión con AsyncStorage
  - Logout limpio que limpia el almacenamiento local
- **Navegación Inteligente**:
  - Si el usuario no está autenticado: muestra flujo de Auth (Login/Register)
  - Si el usuario está autenticado: redirige al Dashboard
  - La sesión persiste al cerrar y abrir la app sin parpadeos molestos
- **Validaciones**:
  - Email con formato válido
  - Contraseña mínima de 6 caracteres
  - Confirmación de contraseña
  - Mensajes de error específicos en la UI

## Estructura del Proyecto

```
src/
├── components/
│   └── ui/
│       ├── Input.js          # Componente de input reutilizable
│       ├── Button.js         # Botón con estado de loading
│       ├── Checkbox.js       # Checkbox personalizado
│       └── SocialButton.js   # Botón para login social
├── context/
│   └── AuthContext.js        # Contexto de autenticación global
├── navigation/
│   └── AppNavigator.js       # Configuración de navegación
└── screens/
    ├── auth/
    │   ├── LoginScreen.js    # Pantalla de Login
    │   └── RegisterScreen.js # Pantalla de Registro
    └── DashboardScreen.js    # Dashboard placeholder
```

## Instalación

1. Instalar las dependencias:
```bash
npm install
```

2. Iniciar el proyecto:
```bash
npm start
```

3. Ejecutar en tu plataforma preferida:
```bash
npm run android    # Para Android
npm run ios        # Para iOS
npm run web        # Para Web
```

## Dependencias Principales

- `expo` - Framework de React Native
- `@react-navigation/native` - Navegación principal
- `@react-navigation/native-stack` - Navegación tipo stack
- `@react-native-async-storage/async-storage` - Persistencia de datos
- `@expo/vector-icons` - Iconos vectoriales

## Notas

- Los assets (icon.png, splash.png, etc.) son placeholders y deben ser reemplazados con tus propios diseños
- La autenticación actualmente es simulada (mock). Para producción, integra con tu backend/API real
- El Dashboard es un placeholder listo para ser desarrollado con las funcionalidades de finanzas

## Próximos Pasos Sugeridos

1. Reemplazar los assets con tus propios diseños
2. Integrar con tu API de autenticación real
3. Desarrollar el Dashboard con funcionalidades de finanzas
4. Agregar más pantallas y funcionalidades según tus necesidades
