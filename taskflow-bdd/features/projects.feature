# ============================================================
# EP-02: Gestión de Proyectos y Tablero
# US-03: Crear proyecto
# US-04: Invitar miembro
# ============================================================

Feature: Gestión de proyectos
  Como propietario de un proyecto
  Quiero crear y administrar proyectos
  Para organizar el trabajo de mi equipo

  Background:
    Given el servidor de TaskFlow está disponible
    And la base de datos está limpia
    And existe un usuario autenticado con email "owner@test.com"

  Scenario: Crear proyecto con datos válidos
    When el usuario crea un proyecto con:
      | name        | TaskFlow Backend     |
      | description | API REST con Express |
      | color       | #0D9488              |
    Then la respuesta tiene código de estado 201
    And el proyecto tiene columnas: "To Do", "In Progress", "In Review", "Done"
    And el usuario es propietario del proyecto

  Scenario: No se puede crear un proyecto sin nombre
    When el usuario crea un proyecto con:
      | name        |                 |
      | description | Sin nombre      |
    Then la respuesta tiene código de estado 400
    And el cuerpo contiene "message" con valor "El nombre del proyecto es requerido"

  Scenario: Invitar a un miembro al proyecto
    Given que existe un proyecto "Mi Proyecto" del usuario "owner@test.com"
    And existe un usuario con email "miembro@test.com"
    When el propietario invita a "miembro@test.com" como "member"
    Then la respuesta tiene código de estado 200
    And el proyecto tiene 2 participantes

  Scenario: Un invitado solo puede ver el proyecto, no crear tareas
    Given que existe un proyecto "Mi Proyecto" del usuario "owner@test.com"
    And existe un usuario con email "invitado@test.com" con rol "viewer"
    When "invitado@test.com" intenta crear una tarea en el proyecto
    Then la respuesta tiene código de estado 403
    And el cuerpo contiene "message" con valor "No tenés permisos para crear tareas"