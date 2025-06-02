<<<<<<< HEAD
# TFG

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
=======
Para poder iniciar este proyecto necesitas seguir los siguientes pasos:

-
-Backend->
Para el backedn tiene que tener instalado Xampp:
(https://www.apachefriends.org/es/index.html)
Iniciar Apache y MySQL con el puerto:
Para Apache el puerto 80, 443
Para MySQL el puerto 3306.

Descarga el repositorio del proyecto y añadelo al directorio de Xampp
C:\xampp\htdocs\TFG
Y abrelo con Visual Studio Code

Luego inicia PhpMyAdmin desde la configuración de PhpMyAdmin en el boton 
Admin de Xampp para añadir las bases de datos necesarias para que el proyecto funcione 
Abra esos archivos sql e introducelos en phpmyadmin
Tablas:

CREATE TABLE `tareas` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario_id` int(11) NOT NULL,
  `completada` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `temporizadores` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `duracion` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `usuarios` (
  `IdUsuarios` int(11) NOT NULL,
  `Correo` varchar(40) NOT NULL,
  `NombreUsuario` varchar(20) NOT NULL,
  `Contraseña` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



Una vez hecho esto, tendras que instalar algunos paquetes de dependencias para que el frontend funcione.
Si no tienes instalado Angular19, instalalo con este comando:
npm install -g @angular/cli
Y verifica la instalacion con:
ng version
navega hasta la carpeta del proyecto, y ejecuta en la terminal:
npm install

En el backend hay que instalar JWT para que funcione el token de acceso

cd C:\xampp\htdocs\TFG\TfgAngular19\Backend

composer require firebase/php-jwt

Despues de instalar todas las dependencias inicia el proyecto:
ng serve

Deberia de abrirse en http://localhost:4200/

Despues de eso tendras que crearte un nuevo usuario para poder logearte y acceder a la aplicación.


>>>>>>> 2d7d57c46355470ca7d563afc77317c114f2da84
