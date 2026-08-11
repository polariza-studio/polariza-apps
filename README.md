# Polariza Apps

Catálogo de apps simples que demuestran lo que se puede construir desde Polariza Studio. Cada app vive en `apps/<nombre-app>/` con su propio README (qué es, por qué existe, cómo se ejecuta).

## Apps

- [SetUp](apps/setup) — plan, organize, and track your workouts.

## Convención

- Una carpeta por app dentro de `apps/`.
- Cada app es independiente: sus propias dependencias, su propio README.
- Simple por defecto — si una app crece lo suficiente como para convertirse en caso de estudio real, se documenta como proyecto propio en el Hub.

## Despliegue

Un único sitio de GitHub Pages para todo el repositorio, con cada app en su propia subruta: `polariza-studio.github.io/polariza-apps/<nombre-app>/`. El [workflow](.github/workflows/deploy.yml) compila cada carpeta de `apps/` que tenga `package.json` y genera un índice que enlaza a todas. Se dispara en cada push a `main` que toque `apps/`.
